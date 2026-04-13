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
import { Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const tiposDocumento = [
  'CNH',
  'Certidão negativa de crimes',
  'Autorização Detran',
  'Vistoria do veículo',
];

const Documentos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: '', data_vencimento: '' });

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
      const now = new Date();
      const venc = new Date(form.data_vencimento);
      const dias = Math.ceil((venc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let status = 'ok';
      if (dias < 0) status = 'vencido';
      else if (dias <= 30) status = 'vencendo';

      const { error } = await supabase.from('documentos').insert({
        user_id: user!.id,
        tipo: form.tipo,
        data_vencimento: form.data_vencimento,
        status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setOpen(false);
      setForm({ tipo: '', data_vencimento: '' });
      toast({ title: 'Documento cadastrado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const getStatusInfo = (dataVencimento: string) => {
    const now = new Date();
    const venc = new Date(dataVencimento);
    const dias = Math.ceil((venc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 0) return { label: 'Vencido', color: 'bg-destructive/10 text-destructive', dot: '🔴' };
    if (dias <= 7) return { label: `${dias} dias`, color: 'bg-destructive/10 text-destructive', dot: '🔴' };
    if (dias <= 30) return { label: `${dias} dias`, color: 'bg-warning/10 text-warning', dot: '🟡' };
    return { label: 'OK', color: 'bg-success/10 text-success', dot: '🟢' };
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Documentos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="touch-target gap-2"><Plus className="w-4 h-4" /> Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar documento</DialogTitle></DialogHeader>
            <form onSubmit={e => { e.preventDefault(); addMutation.mutate(); }} className="space-y-3">
              <div><Label>Tipo do documento</Label>
                <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v})}>
                  <SelectTrigger className="touch-target"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {tiposDocumento.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Data de vencimento</Label><Input type="date" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} required className="touch-target" /></div>
              <Button type="submit" className="w-full touch-target font-semibold" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Salvando...' : 'Cadastrar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : documentos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum documento cadastrado.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc: any) => {
            const info = getStatusInfo(doc.data_vencimento);
            return (
              <Card key={doc.id} className="p-4 flex items-center justify-between animate-fade-in">
                <div>
                  <h3 className="font-bold text-foreground text-sm">{doc.tipo}</h3>
                  <p className="text-xs text-muted-foreground">Vence: {new Date(doc.data_vencimento).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${info.color}`}>
                  {info.dot} {info.label}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Documentos;
