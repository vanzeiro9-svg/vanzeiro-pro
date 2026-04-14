import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MessageSquare, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Mensalidades = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const { data: mensalidades = [], isLoading } = useQuery({
    queryKey: ['mensalidades', mesFiltro],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mensalidades')
        .select('*, alunos(nome, responsavel_nome, responsavel_whatsapp)')
        .eq('mes_referencia', mesFiltro)
        .order('status');
      if (error) throw error;
      return data;
    },
  });

  const gerarMutation = useMutation({
    mutationFn: async () => {
      const { data: alunos, error: alunosError } = await supabase
        .from('alunos')
        .select('id, valor_mensalidade')
        .eq('status', 'ativo');
      if (alunosError) throw alunosError;
      if (!alunos?.length) throw new Error('Nenhum aluno ativo');

      const { data: existing } = await supabase
        .from('mensalidades')
        .select('aluno_id')
        .eq('mes_referencia', mesFiltro);
      
      const existingIds = new Set((existing || []).map(e => e.aluno_id));
      const novos = alunos.filter(a => !existingIds.has(a.id)).map(a => ({
        user_id: user!.id,
        aluno_id: a.id,
        mes_referencia: mesFiltro,
        valor: a.valor_mensalidade,
        status: 'pendente',
      }));

      if (novos.length === 0) throw new Error('Cobranças já geradas para este mês');
      const { error } = await supabase.from('mensalidades').insert(novos);
      if (error) throw error;
      return novos.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: `${count} cobranças geradas!` });
    },
    onError: (error: any) => {
      toast({ title: 'Aviso', description: error.message, variant: 'destructive' });
    },
  });

  const pagarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mensalidades')
        .update({ status: 'pago', data_pagamento: new Date().toISOString().slice(0, 10) })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensalidades'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Pagamento registrado!' });
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
      if (error) throw error;
      return data;
    },
  });

  const handleCobrarZap = (m: any) => {
    const nomeResponsavel = m.alunos?.responsavel_nome || 'Responsável';
    const nomeMotorista = profile?.nome || 'Seu Motorista';
    const mes = new Date(m.mes_referencia + '-02').toLocaleDateString('pt-BR', { month: 'long' });
    const valor = Number(m.valor).toFixed(2);
    const chavePix = (profile as any)?.chave_pix || '[SUA CHAVE PIX NO PERFIL]';
    
    const texto = `Olá ${nomeResponsavel}, aqui é o ${nomeMotorista}. Segue o lembrete da mensalidade de ${mes} do(a) ${m.alunos?.nome}. Valor: R$ ${valor}. Chave Pix: ${chavePix}. Obrigado!`;
    const fone = m.alunos?.responsavel_whatsapp.replace(/\D/g, '');
    
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  const mesLabel = new Date(mesFiltro + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
          <div className="flex items-center gap-2">
            <input 
              type="month" 
              value={mesFiltro} 
              onChange={(e) => setMesFiltro(e.target.value)}
              className="text-sm bg-transparent border-none p-0 focus:ring-0 text-muted-foreground cursor-pointer"
            />
            <Link to="/inadimplencia" className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase hover:underline">
              <History className="w-3 h-3" /> Ver Inadimplentes
            </Link>
          </div>
        </div>
        <Button onClick={() => gerarMutation.mutate()} disabled={gerarMutation.isPending} className="touch-target">
          {gerarMutation.isPending ? 'Gerando...' : 'Gerar cobranças'}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : mensalidades.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma cobrança neste mês.</p>
          <p className="text-sm text-muted-foreground mt-1">Clique em "Gerar cobranças" para criar.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {mensalidades.map((m: any) => (
            <Card key={m.id} className="p-4 flex items-center justify-between animate-fade-in">
              <div>
                <h3 className="font-bold text-foreground text-sm">{m.alunos?.nome}</h3>
                <p className="text-sm font-semibold text-foreground">R$ {Number(m.valor).toFixed(2)}</p>
                <span className={`text-xs font-bold ${
                  m.status === 'pago' ? 'text-success' :
                  m.status === 'atrasado' ? 'text-destructive' :
                  'text-warning'
                }`}>
                  {m.status === 'pago' ? '✅ Pago' : m.status === 'atrasado' ? '❌ Atrasado' : '⏳ Pendente'}
                </span>
              </div>
              <div className="flex gap-2">
                {m.status !== 'pago' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCobrarZap(m)}
                      className="touch-target gap-1 border-primary text-primary hover:bg-primary/10"
                    >
                      <MessageSquare className="w-4 h-4" /> Zap
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => pagarMutation.mutate(m.id)}
                      disabled={pagarMutation.isPending}
                      className="touch-target gap-1"
                    >
                      <Check className="w-4 h-4" /> Pago
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Mensalidades;
