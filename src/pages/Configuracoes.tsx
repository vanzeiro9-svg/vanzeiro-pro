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
import { User, Truck, CreditCard, MessageCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
      )}
    </AppLayout>
  );
};

export default Configuracoes;
