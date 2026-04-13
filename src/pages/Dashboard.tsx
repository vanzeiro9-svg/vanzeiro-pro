import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, AlertTriangle, FileWarning, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/AppLayout';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [alunosRes, mensalidadesRes, docsRes] = await Promise.all([
        supabase.from('alunos').select('id', { count: 'exact' }).eq('status', 'ativo'),
        supabase.from('mensalidades').select('id, aluno_id, mes_referencia', { count: 'exact' }).in('status', ['pendente', 'atrasado']),
        supabase.from('documentos').select('*'),
      ]);

      const now = new Date();
      const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const docsVencendo = (docsRes.data || []).filter((d) => {
        const venc = new Date(d.data_vencimento);
        return venc <= in30days;
      });

      return {
        totalAlunos: alunosRes.count || 0,
        inadimplentes: mensalidadesRes.count || 0,
        docsVencendo: docsVencendo.length,
        docsUrgentes: docsVencendo.slice(0, 3),
        inadimplentesList: mensalidadesRes.data || [],
      };
    },
  });

  const cards = [
    {
      label: 'Alunos ativos',
      value: stats?.totalAlunos ?? '-',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-accent',
    },
    {
      label: 'Mensalidades em atraso',
      value: stats?.inadimplentes ?? '-',
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Docs vencendo (30 dias)',
      value: stats?.docsVencendo ?? '-',
      icon: FileWarning,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Olá! 👋</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} className="touch-target">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {cards.map((card) => (
          <Card key={card.label} className="p-4 flex items-center gap-4 animate-fade-in">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {stats?.docsUrgentes && stats.docsUrgentes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-foreground mb-3">⚠️ Documentos urgentes</h2>
          <div className="space-y-2">
            {stats.docsUrgentes.map((doc: any) => {
              const venc = new Date(doc.data_vencimento);
              const now = new Date();
              const dias = Math.ceil((venc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isVencido = dias < 0;
              return (
                <Card key={doc.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{doc.tipo}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence: {venc.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isVencido
                        ? 'bg-destructive/10 text-destructive'
                        : dias <= 7
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {isVencido ? 'Vencido' : `${dias} dias`}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
