import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload, History, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = {
  MOTORISTA: 'Motorista',
  VEICULO: 'Veículo',
} as const;

const DOCUMENTOS_OBRIGATORIOS = [
  'CNH (EAR)',
  'Vistoria Semestral',
  'Alvará Municipal',
  'Seguro APP',
  'Inmetro (Tacógrafo)',
];

const Documentos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ tipo: '', data_vencimento: '' });
  const [file, setFile] = useState<File | null>(null);

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['documentos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('documentos').select('*').order('data_vencimento');
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      let arquivo_url = null;

      if (file) {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('documentos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('documentos')
          .getPublicUrl(fileName);
          
        arquivo_url = publicUrl;
      }

      const info = getStatusInfo(form.data_vencimento);
      
      const { error } = await supabase.from('documentos').insert({
        user_id: user!.id,
        tipo: form.tipo,
        data_vencimento: form.data_vencimento,
        arquivo_url,
        status: info.status === 'critical' ? 'vencido' : info.status === 'ok' ? 'ok' : 'vencendo',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setOpen(false);
      setForm({ tipo: '', data_vencimento: '' });
      setFile(null);
      setUploading(false);
      toast({ title: 'Documento cadastrado!' });
    },
    onError: (error: any) => {
      setUploading(false);
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const getStatusInfo = (dataVencimento: string) => {
    const now = new Date();
    const venc = new Date(dataVencimento);
    const dias = Math.ceil((venc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dias < 0) {
      return { label: 'Vencido', color: 'bg-destructive text-destructive-foreground', dot: '🔴', status: 'critical' };
    }
    if (dias <= 30) {
      return { label: 'Atenção', color: 'bg-warning text-warning-foreground', dot: '🟡', status: 'attention' };
    }
    return { label: 'Em dia', color: 'bg-success text-success-foreground', dot: '🟢', status: 'ok' };
  };

  const getLatestByCategory = (tipo: string) => {
    const versions = documentos.filter((d: any) => d.tipo === tipo);
    if (versions.length === 0) return null;
    return versions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const getAllVersions = (tipo: string) => {
    return documentos.filter((d: any) => d.tipo === tipo).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentação e Detran</h1>
          <p className="text-sm text-muted-foreground">Evite multas e apreensões</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="touch-target gap-2 bg-primary hover:bg-primary/90 shadow-lg font-bold"><Plus className="w-4 h-4" /> Enviar Foto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Documento</DialogTitle>
              <p className="text-sm text-muted-foreground">Selecione o tipo e anexe o comprovante.</p>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Tipo do documento</Label>
                <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENTOS_OBRIGATORIOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de vencimento</Label>
                <Input type="date" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} required className="w-full" />
              </div>
              <div className="space-y-2">
                <Label>Arquivo (PDF ou Imagem)</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                  <Input 
                    type="file" 
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{file ? file.name : "Clique ou arraste para enviar"}</span>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full font-semibold h-11" disabled={addMutation.isPending || uploading}>
                {addMutation.isPending || uploading ? 'Enviando...' : 'Salvar Documento'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 pt-2">
        {DOCUMENTOS_OBRIGATORIOS.map((tipo) => {
          const latest = getLatestByCategory(tipo);
          const info = latest ? getStatusInfo(latest.data_vencimento) : { label: 'Pendente', color: 'bg-muted text-muted-foreground', dot: '⚪', status: 'pending' };
          const history = getAllVersions(tipo);

          return (
            <Card key={tipo} className="p-4 flex items-center justify-between border-none shadow-sm bg-card hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground text-sm truncate">{tipo}</h3>
                  {latest && (
                    <Badge variant="ghost" className="h-5 text-[10px] bg-secondary/50">Ativo</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  {latest ? (
                    <>
                      <p className="flex items-center gap-1"><FileText className="w-3 h-3" /> Vence em: {new Date(latest.data_vencimento).toLocaleDateString('pt-BR')}</p>
                      {latest.arquivo_url && (
                          <a href={latest.arquivo_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Ver
                          </a>
                      )}
                    </>
                  ) : (
                    <p className="text-destructive font-medium italic">Nenhum documento enviado</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${info.color} flex items-center gap-1.5`}>
                  {info.label.toUpperCase()}
                </span>
                
                {history.length > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-muted text-muted-foreground hover:text-foreground">
                        <History className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Histórico: {tipo}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-4">
                        {history.map((h: any, i: number) => (
                          <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div>
                              <p className="text-xs font-bold">{new Date(h.data_vencimento).toLocaleDateString('pt-BR')}</p>
                              <p className="text-[10px] text-muted-foreground">Enviado em: {new Date(h.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {i === 0 && <Badge className="text-[9px]">Atual</Badge>}
                              {h.arquivo_url && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                  <a href={h.arquivo_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Documentos;
