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
import { User, Truck, CreditCard, MessageCircle, Settings2, GraduationCap, MapPin, Clock, Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

type CrudItem = { id: string; nome: string; user_id: string };

const CrudSection = ({ title, icon: Icon, table, userId, defaultItems }: { title: string; icon: React.ElementType; table: 'escolas' | 'turnos' | 'rotas'; userId: string; defaultItems?: string[] }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [seeded, setSeeded] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const query = supabase.from(table).select('id, nome, user_id').eq('user_id', userId).order('nome');
      if (table === 'rotas') {
        const { data, error } = await supabase.from('rotas').select('id, nome, user_id, turno').eq('user_id', userId).order('nome');
        if (error) throw error;
        return data as CrudItem[];
      }
      const { data, error } = await query;
      if (error) throw error;

      // Auto-seed defaults on first load if empty
      if (data.length === 0 && defaultItems && defaultItems.length > 0 && !seeded) {
        const rows = defaultItems.map(nome => {
          const row: any = { nome, user_id: userId };
          if (table === 'rotas') row.turno = 'Manhã';
          return row;
        });
        await supabase.from(table).insert(rows);
        setSeeded(true);
        const { data: refreshed, error: err2 } = await supabase.from(table).select('id, nome, user_id').eq('user_id', userId).order('nome');
        if (err2) throw err2;
        return refreshed as CrudItem[];
      }

      return data as CrudItem[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (nome: string) => {
      const insertData: any = { nome, user_id: userId };
      if (table === 'rotas') insertData.turno = 'Manhã';
      const { error } = await supabase.from(table).insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      setNewName('');
      toast({ title: `${title.slice(0, -1)} adicionado(a)!` });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
      const { error } = await supabase.from(table).update({ nome }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      setEditingId(null);
      toast({ title: 'Atualizado!' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      toast({ title: 'Removido!' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="w-4 h-4 text-primary" />
        <span>{title}</span>
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder={`Nova ${title.slice(0, -1).toLowerCase()}...`}
          className="touch-target text-sm"
          onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) addMutation.mutate(newName.trim()); }}
        />
        <Button
          type="button"
          size="icon"
          className="touch-target shrink-0"
          disabled={!newName.trim() || addMutation.isPending}
          onClick={() => addMutation.mutate(newName.trim())}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Nenhum(a) cadastrado(a)</p>
      ) : (
        <ul className="space-y-1">
          {items.map(item => (
            <li key={item.id} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              {editingId === item.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="h-8 text-sm flex-1"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && editName.trim()) updateMutation.mutate({ id: item.id, nome: editName.trim() }); if (e.key === 'Escape') setEditingId(null); }}
                  />
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => { if (editName.trim()) updateMutation.mutate({ id: item.id, nome: editName.trim() }); }}>
                    <Check className="w-4 h-4 text-primary" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1">{item.nome}</span>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingId(item.id); setEditName(item.nome); }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteMutation.mutate(item.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
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

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus dados e do veículo</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando seus dados...</p>
        </div>
      ) : (
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

            <div className="flex items-center justify-between pt-2 border-t border-border">
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
      )}

      {/* Parâmetros do Sistema */}
      {user && (
        <Card className="p-4 space-y-6 mt-6">
          <div className="flex items-center gap-2 text-primary font-bold mb-2">
            <Settings2 className="w-5 h-5" />
            <span>Parâmetros do Sistema</span>
          </div>
          <CrudSection title="Escolas" icon={GraduationCap} table="escolas" userId={user.id} />
          <hr className="border-border" />
          <CrudSection title="Rotas" icon={MapPin} table="rotas" userId={user.id} />
          <hr className="border-border" />
          <CrudSection title="Turnos" icon={Clock} table="turnos" userId={user.id} />
        </Card>
      )}
    </AppLayout>
  );
};

export default Configuracoes;
