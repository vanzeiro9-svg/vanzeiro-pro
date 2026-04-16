import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Fuel, UserCheck, Wrench, ShieldCheck, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

const categorias = [
  { value: 'funcionario', label: 'Funcionário', icon: UserCheck },
  { value: 'combustivel', label: 'Combustível', icon: Fuel },
  { value: 'manutencao', label: 'Manutenção', icon: Wrench },
  { value: 'seguro', label: 'Seguro', icon: ShieldCheck },
  { value: 'outros', label: 'Outros', icon: MoreHorizontal },
];

const categoriaLabel = (cat: string) => categorias.find(c => c.value === cat)?.label || cat;

const mesCorrente = new Date().toISOString().slice(0, 7);

const Despesas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    categoria: 'outros',
    data_despesa: new Date().toISOString().slice(0, 10),
    recorrente: false,
  });

  const [mesFiltro, setMesFiltro] = useState(mesCorrente);

  const { data: despesas = [], isLoading } = useQuery({
    queryKey: ['despesas', mesFiltro],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('user_id', user!.id)
        .eq('mes_referencia', mesFiltro)
        .order('data_despesa', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('despesas').insert({
        user_id: user!.id,
        descricao: form.descricao,
        valor: parseFloat(form.valor),
        categoria: form.categoria,
        data_despesa: form.data_despesa,
        recorrente: form.recorrente,
        mes_referencia: form.data_despesa.slice(0, 7),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Despesa adicionada!' });
      setShowForm(false);
      setForm({ descricao: '', valor: '', categoria: 'outros', data_despesa: new Date().toISOString().slice(0, 10), recorrente: false });
    },
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('despesas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Despesa removida' });
    },
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const total = despesas.reduce((acc, d) => acc + Number(d.valor), 0);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Despesas</h1>
          <p className="text-sm text-muted-foreground">Controle seus gastos mensais</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus className="w-4 h-4" />
          Nova
        </Button>
      </div>

      {/* Filtro de mês */}
      <div className="mb-4">
        <Input
          type="month"
          value={mesFiltro}
          onChange={e => setMesFiltro(e.target.value)}
          className="w-full touch-target"
        />
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="p-4 mb-4 space-y-3 animate-fade-in">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={form.descricao}
              onChange={e => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ex: Salário do monitor"
              className="touch-target"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={e => setForm({ ...form, valor: e.target.value })}
                placeholder="0,00"
                className="touch-target"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                <SelectTrigger className="touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={form.data_despesa}
              onChange={e => setForm({ ...form, data_despesa: e.target.value })}
              className="touch-target"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Despesa recorrente?</Label>
            <Switch checked={form.recorrente} onCheckedChange={v => setForm({ ...form, recorrente: v })} />
          </div>
          <Button
            className="w-full touch-target font-bold"
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending || !form.descricao.trim() || !form.valor}
          >
            {addMutation.isPending ? 'Salvando...' : 'Salvar Despesa'}
          </Button>
        </Card>
      )}

      {/* Total */}
      <Card className="p-4 mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Total do mês</span>
        <span className="text-lg font-bold text-destructive">{formatCurrency(total)}</span>
      </Card>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : despesas.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">Nenhuma despesa neste mês.</p>
      ) : (
        <div className="space-y-2">
          {despesas.map((d: any) => {
            const CatIcon = categorias.find(c => c.value === d.categoria)?.icon || MoreHorizontal;
            return (
              <Card key={d.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <CatIcon className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{d.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoriaLabel(d.categoria)} • {new Date(d.data_despesa).toLocaleDateString('pt-BR')}
                    {d.recorrente && ' • 🔄'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-destructive">{formatCurrency(Number(d.valor))}</p>
                  <button
                    onClick={() => deleteMutation.mutate(d.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Despesas;
