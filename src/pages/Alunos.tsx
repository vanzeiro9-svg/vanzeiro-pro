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
import { Plus, Phone, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const turnoLabels: Record<string, string> = { manha: 'Manhã', tarde: 'Tarde', integral: 'Integral' };
const statusLabels: Record<string, string> = { ativo: 'Ativo', pausado: 'Pausado', desistente: 'Desistente' };

const Alunos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<any>(null);
  const [form, setForm] = useState({
    nome: '', responsavel_nome: '', responsavel_whatsapp: '',
    endereco_embarque: '', endereco_desembarque: '', escola: '',
    turno: 'manha', valor_mensalidade: '', status: 'ativo', rota_id: '',
  });

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('alunos').select('*, rotas(nome)').order('nome');
      if (error) throw error;
      return data;
    },
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rotas').select('*').order('nome');
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('alunos').insert({
        user_id: user!.id,
        nome: form.nome,
        responsavel_nome: form.responsavel_nome,
        responsavel_whatsapp: form.responsavel_whatsapp,
        endereco_embarque: form.endereco_embarque,
        endereco_desembarque: form.endereco_desembarque,
        escola: form.escola,
        turno: form.turno,
        valor_mensalidade: parseFloat(form.valor_mensalidade) || 0,
        status: form.status,
        rota_id: form.rota_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setOpen(false);
      setForm({ nome: '', responsavel_nome: '', responsavel_whatsapp: '', endereco_embarque: '', endereco_desembarque: '', escola: '', turno: 'manha', valor_mensalidade: '', status: 'ativo', rota_id: '' });
      toast({ title: 'Aluno cadastrado!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alunos').update({
        nome: form.nome,
        responsavel_nome: form.responsavel_nome,
        responsavel_whatsapp: form.responsavel_whatsapp,
        endereco_embarque: form.endereco_embarque,
        endereco_desembarque: form.endereco_desembarque,
        escola: form.escola,
        turno: form.turno,
        valor_mensalidade: parseFloat(form.valor_mensalidade) || 0,
        status: form.status,
        rota_id: form.rota_id || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      setEditOpen(false);
      toast({ title: 'Dados atualizados!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alunos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setEditOpen(false);
      toast({ title: 'Aluno removido com sucesso' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = (aluno: any) => {
    setSelectedAluno(aluno);
    setForm({
      nome: aluno.nome,
      responsavel_nome: aluno.responsavel_nome,
      responsavel_whatsapp: aluno.responsavel_whatsapp,
      endereco_embarque: aluno.endereco_embarque || '',
      endereco_desembarque: aluno.endereco_desembarque || '',
      escola: aluno.escola || '',
      turno: aluno.turno,
      valor_mensalidade: aluno.valor_mensalidade.toString(),
      status: aluno.status,
      rota_id: aluno.rota_id || '',
    });
    setEditOpen(true);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">Alunos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="touch-target gap-2">
              <Plus className="w-4 h-4" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar aluno</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }} className="space-y-3">
              <div><Label>Nome do aluno</Label><Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required className="touch-target" /></div>
              <div><Label>Nome do responsável</Label><Input value={form.responsavel_nome} onChange={e => setForm({...form, responsavel_nome: e.target.value})} required className="touch-target" /></div>
              <div><Label>WhatsApp do responsável</Label><Input value={form.responsavel_whatsapp} onChange={e => setForm({...form, responsavel_whatsapp: e.target.value})} placeholder="(11) 99999-9999" required className="touch-target" /></div>
              <div><Label>Endereço de embarque</Label><Input value={form.endereco_embarque} onChange={e => setForm({...form, endereco_embarque: e.target.value})} className="touch-target" /></div>
              <div><Label>Endereço de desembarque</Label><Input value={form.endereco_desembarque} onChange={e => setForm({...form, endereco_desembarque: e.target.value})} className="touch-target" /></div>
              <div><Label>Escola</Label><Input value={form.escola} onChange={e => setForm({...form, escola: e.target.value})} className="touch-target" /></div>
              <div><Label>Turno</Label>
                <Select value={form.turno} onValueChange={v => setForm({...form, turno: v})}>
                  <SelectTrigger className="touch-target"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Valor da mensalidade (R$)</Label><Input type="number" step="0.01" value={form.valor_mensalidade} onChange={e => setForm({...form, valor_mensalidade: e.target.value})} className="touch-target" /></div>
              {rotas.length > 0 && (
                <div><Label>Rota</Label>
                  <Select value={form.rota_id} onValueChange={v => setForm({...form, rota_id: v})}>
                    <SelectTrigger className="touch-target"><SelectValue placeholder="Selecione uma rota" /></SelectTrigger>
                    <SelectContent>
                      {rotas.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full touch-target font-semibold" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Salvando...' : 'Cadastrar aluno'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : alunos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum aluno cadastrado ainda.</p>
          <p className="text-sm text-muted-foreground mt-1">Clique em "Novo" para começar!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alunos.map((aluno: any) => (
            <Card key={aluno.id} className="p-4 animate-fade-in hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleEdit(aluno)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{aluno.nome}</h3>
                  <p className="text-sm text-muted-foreground">{aluno.escola} • {turnoLabels[aluno.turno]}</p>
                  <p className="text-sm text-muted-foreground">{aluno.responsavel_nome}</p>
                  {aluno.rotas?.nome && <p className="text-xs text-primary font-semibold mt-1">🚐 {aluno.rotas.nome}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    aluno.status === 'ativo' ? 'bg-success/10 text-success' : 
                    aluno.status === 'pausado' ? 'bg-warning/10 text-warning' : 
                    'bg-muted text-muted-foreground'
                  }`}>{statusLabels[aluno.status]}</span>
                  <span className="text-sm font-bold text-foreground">R$ {Number(aluno.valor_mensalidade).toFixed(2)}</span>
                  <a 
                    href={`https://wa.me/55${aluno.responsavel_whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-success/10 rounded-full transition-colors"
                  >
                    <Phone className="w-4 h-4 text-success" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Edição/Ficha */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ficha do Aluno</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(selectedAluno.id); }} className="space-y-3">
            <div><Label>Nome do aluno</Label><Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required className="touch-target" /></div>
            <div><Label>Nome do responsável</Label><Input value={form.responsavel_nome} onChange={e => setForm({...form, responsavel_nome: e.target.value})} required className="touch-target" /></div>
            <div><Label>WhatsApp do responsável</Label><Input value={form.responsavel_whatsapp} onChange={e => setForm({...form, responsavel_whatsapp: e.target.value})} placeholder="(11) 99999-9999" required className="touch-target" /></div>
            <div><Label>Endereço de embarque</Label><Input value={form.endereco_embarque} onChange={e => setForm({...form, endereco_embarque: e.target.value})} className="touch-target" /></div>
            <div><Label>Endereço de desembarque</Label><Input value={form.endereco_desembarque} onChange={e => setForm({...form, endereco_desembarque: e.target.value})} className="touch-target" /></div>
            <div><Label>Escola</Label><Input value={form.escola} onChange={e => setForm({...form, escola: e.target.value})} className="touch-target" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Turno</Label>
                <Select value={form.turno} onValueChange={v => setForm({...form, turno: v})}>
                  <SelectTrigger className="touch-target"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger className="touch-target"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pausado">Pausado</SelectItem>
                    <SelectItem value="desistente">Desistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Mensalidade (R$)</Label><Input type="number" step="0.01" value={form.valor_mensalidade} onChange={e => setForm({...form, valor_mensalidade: e.target.value})} className="touch-target" /></div>
              {rotas.length > 0 && (
                <div><Label>Rota</Label>
                  <Select value={form.rota_id} onValueChange={v => setForm({...form, rota_id: v})}>
                    <SelectTrigger className="touch-target"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {rotas.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" className="flex-1 gap-2">
                    <Trash2 className="w-4 h-4" /> Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente os dados do aluno e seu histórico financeiro.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(selectedAluno.id)} className="bg-destructive text-destructive-foreground">
                      Confirmar Exclusão
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button type="submit" className="flex-1 font-semibold" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Alunos;
