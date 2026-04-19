import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Truck, CreditCard, MessageCircle, School, MapPin, Clock, Plus, Trash2, Settings2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Componente reutilizável para gerenciar listas de parâmetros
const ParamList = ({
  title,
  icon: Icon,
  items,
  onAdd,
  onDelete,
  placeholder,
  isAdding,
}: {
  title: string;
  icon: any;
  items: { id: string; nome: string }[];
  onAdd: (nome: string) => void;
  onDelete: (id: string) => void;
  placeholder: string;
  isAdding: boolean;
}) => {
  const [novoNome, setNovoNome] = useState('');

  const handleAdd = () => {
    if (!novoNome.trim()) return;
    onAdd(novoNome.trim());
    setNovoNome('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-primary font-bold">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{title}</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={novoNome}
          onChange={e => setNovoNome(e.target.value)}
          placeholder={placeholder}
          className="touch-target text-sm h-9"
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          disabled={isAdding || !novoNome.trim()}
          className="h-9 px-3 shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic px-1">Nenhum item cadastrado.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-foreground">{item.nome}</span>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Configuracoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nome: '',
    chave_pix: '',
    veiculo_modelo: '',
    veiculo_placa: '',
    avisos_whatsapp: true,
  });

  // --- Perfil ---
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        nome: profile.nome || '',
        chave_pix: (profile as any).chave_pix || '',
        veiculo_modelo: (profile as any).veiculo_modelo || '',
        veiculo_placa: (profile as any).veiculo_placa || '',
        avisos_whatsapp: (profile as any).avisos_whatsapp ?? true,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: form.nome,
          chave_pix: form.chave_pix,
          veiculo_modelo: form.veiculo_modelo,
          veiculo_placa: form.veiculo_placa,
          avisos_whatsapp: form.avisos_whatsapp,
        })
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Configurações salvas!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  // --- Escolas ---
  const { data: escolas = [] } = useQuery({
    queryKey: ['escolas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('escolas').select('*').eq('user_id', user!.id).order('nome');
      if (error) throw error;
      return data as { id: string; nome: string }[];
    },
  });

  const addEscolaMutation = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from('escolas').insert({ user_id: user!.id, nome });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escolas'] });
      toast({ title: 'Escola adicionada!' });
    },
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const deleteEscolaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('escolas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['escolas'] }),
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  // --- Rotas ---
  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rotas').select('*').eq('user_id', user!.id).order('nome');
      if (error) throw error;
      return data as { id: string; nome: string }[];
    },
  });

  const addRotaMutation = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from('rotas').insert({ user_id: user!.id, nome });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotas'] });
      toast({ title: 'Rota adicionada!' });
    },
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const deleteRotaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rotas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rotas'] }),
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  // --- Turnos ---
  const { data: turnos = [] } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('turnos').select('*').eq('user_id', user!.id).order('nome');
      if (error) throw error;
      return data as { id: string; nome: string }[];
    },
  });

  const addTurnoMutation = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from('turnos').insert({ user_id: user!.id, nome });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast({ title: 'Turno adicionado!' });
    },
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const deleteTurnoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('turnos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['turnos'] }),
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const manageSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: {
          returnUrl: `${window.location.origin}/configuracoes`,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('Não foi possível gerar o link do portal Stripe.');

      window.location.assign(data.url);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao abrir portal',
        description: error.message ?? 'Não foi possível abrir o portal da assinatura.',
        variant: 'destructive',
      });
    },
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus dados e parâmetros do sistema</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando seus dados...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Perfil */}
          <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }} className="space-y-6">
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <User className="w-5 h-5" />
                <span>Perfil do Motorista</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={e => setForm({...form, nome: e.target.value})}
                  className="touch-target"
                  placeholder="Como seus clientes te conhecem"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix" className="flex items-center gap-2">
                   <CreditCard className="w-4 h-4" />
                   Chave Pix (Para cobranças)
                </Label>
                <Input
                  id="pix"
                  value={form.chave_pix}
                  onChange={e => setForm({...form, chave_pix: e.target.value})}
                  className="touch-target"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="space-y-0.5">
                  <Label htmlFor="avisos" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Avisos do WhatsApp
                  </Label>
                  <p className="text-[10px] text-muted-foreground italic">Mostrar botão de notificação rápida na chamada</p>
                </div>
                <Switch
                  id="avisos"
                  checked={form.avisos_whatsapp}
                  onCheckedChange={v => setForm({...form, avisos_whatsapp: v})}
                />
              </div>
            </Card>

            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Truck className="w-5 h-5" />
                <span>Dados do Veículo</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo da Van</Label>
                  <Input
                    id="modelo"
                    value={form.veiculo_modelo}
                    onChange={e => setForm({...form, veiculo_modelo: e.target.value})}
                    className="touch-target"
                    placeholder="Ex: Mercedes Sprinter 2022"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa</Label>
                  <Input
                    id="placa"
                    value={form.veiculo_placa}
                    onChange={e => setForm({...form, veiculo_placa: e.target.value})}
                    className="touch-target uppercase"
                    placeholder="ABC-1234"
                  />
                </div>
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full touch-target font-bold"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>

          {/* Parâmetros do Sistema */}
          <Card className="p-4 space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Settings2 className="w-5 h-5" />
              <span>Parâmetros do Sistema</span>
            </div>
            <p className="text-xs text-muted-foreground -mt-4">
              Gerencie as opções disponíveis ao cadastrar alunos.
            </p>

            <div className="border-t border-border pt-4">
              <ParamList
                title="Escolas"
                icon={School}
                items={escolas}
                onAdd={nome => addEscolaMutation.mutate(nome)}
                onDelete={id => deleteEscolaMutation.mutate(id)}
                placeholder="Nome da escola..."
                isAdding={addEscolaMutation.isPending}
              />
            </div>

            <div className="border-t border-border pt-4">
              <ParamList
                title="Rotas"
                icon={MapPin}
                items={rotas}
                onAdd={nome => addRotaMutation.mutate(nome)}
                onDelete={id => deleteRotaMutation.mutate(id)}
                placeholder="Nome da rota..."
                isAdding={addRotaMutation.isPending}
              />
            </div>

            <div className="border-t border-border pt-4">
              <ParamList
                title="Turnos"
                icon={Clock}
                items={turnos}
                onAdd={nome => addTurnoMutation.mutate(nome)}
                onDelete={id => deleteTurnoMutation.mutate(id)}
                placeholder="Ex: Manhã, Tarde, Integral..."
                isAdding={addTurnoMutation.isPending}
              />
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>Minha Assinatura</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Gerencie cobrança com segurança no Stripe. Você pode cancelar, trocar cartão ou atualizar método de pagamento.
            </p>
            <Button
              type="button"
              className="w-full touch-target font-bold gap-2"
              onClick={() => manageSubscriptionMutation.mutate()}
              disabled={manageSubscriptionMutation.isPending}
            >
              {manageSubscriptionMutation.isPending ? 'Gerando link seguro...' : 'Gerenciar Assinatura'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default Configuracoes;
