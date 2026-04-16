import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CreditCard, FileWarning, LogOut, ShieldAlert, TrendingUp, Users, Wallet } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/AppLayout';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const mesCorrente = new Date().toISOString().slice(0, 7); // YYYY-MM
  const inicioMesCorrente = `${mesCorrente}-01`;
  const inicioProximoMesCorrente = (() => {
    const [ano, mes] = mesCorrente.split('-').map(Number);
    const proximo = new Date(ano, mes, 1);
    return `${proximo.getFullYear()}-${String(proximo.getMonth() + 1).padStart(2, '0')}-01`;
  })();
  const periodoLabel = new Date(`${mesCorrente}-02`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const { data: stats, error: statsError, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboard-stats', mesCorrente],
    queryFn: async () => {
      const [alunosRes, mensalidadesRes, docsRes] = await Promise.all([
        supabase.from('alunos').select('id', { count: 'exact', head: true }).eq('status', 'ativo').eq('user_id', user!.id),
        supabase.from('mensalidades').select('valor, status').eq('mes_referencia', mesCorrente).eq('user_id', user!.id),
        supabase.from('documentos').select('*').eq('user_id', user!.id),
      ]);

      const errors = [
        ['alunos', alunosRes.error],
        ['mensalidades', mensalidadesRes.error],
        ['documentos', docsRes.error],
      ].filter(([, e]) => Boolean(e)) as Array<[string, NonNullable<typeof alunosRes.error>]>;

      if (errors.length > 0) {
        const details = errors
          .map(([table, e]) => `${table}: ${e.message}${e.code ? ` (${e.code})` : ''}`)
          .join(' | ');
        throw new Error(
          `Falha ao carregar dados do dashboard. ${details}.`
        );
      }

      const now = new Date();
      const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const docsVencendo = (docsRes.data || []).filter((d) => {
        const venc = new Date(d.data_vencimento);
        return venc <= in30days;
      });

      const receitaBruta = (mensalidadesRes.data || [])
        .filter((m) => m.status === 'pago')
        .reduce((acc, curr) => acc + Number(curr.valor), 0);

      const inadimplencia = (mensalidadesRes.data || [])
        .filter((m) => m.status === 'atrasado')
        .reduce((acc, curr) => acc + Number(curr.valor), 0);

      const despesasTotais = (despesasRes.data || []).reduce((acc, curr) => acc + Number(curr.valor), 0);
      const lucroLiquido = receitaBruta - despesasTotais;

      const hasExpiredDoc = (docsRes.data || []).some((d) => {
        const venc = new Date(d.data_vencimento);
        return venc < now;
      });

      return {
        periodo: periodoLabel,
        totalAlunos: alunosRes.count || 0,
        receitaBruta,
        despesasTotais,
        lucroLiquido,
        inadimplencia,
        chartData: [
          { nome: 'Receitas', valor: receitaBruta },
          { nome: 'Despesas', valor: despesasTotais },
        ],
        docsVencendo: docsVencendo.length,
        docsUrgentes: docsVencendo.slice(0, 3),
        hasExpiredDoc,
      };
    },
  });

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const cards = [
    {
      label: 'Alunos Ativos',
      value: stats?.totalAlunos ?? 0,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Documentos a vencer',
      value: stats?.docsVencendo ?? 0,
      icon: FileWarning,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Receita Bruta',
      value: formatCurrency(stats?.receitaBruta ?? 0),
      icon: Wallet,
      color: 'text-emerald-700',
      bg: 'bg-emerald-100',
    },
    {
      label: 'Despesas Totais',
      value: formatCurrency(stats?.despesasTotais ?? 0),
      icon: CreditCard,
      color: 'text-rose-700',
      bg: 'bg-rose-100',
    },
    {
      label: 'Lucro Líquido',
      value: formatCurrency(stats?.lucroLiquido ?? 0),
      icon: TrendingUp,
      color: (stats?.lucroLiquido ?? 0) >= 0 ? 'text-blue-700' : 'text-amber-700',
      bg: (stats?.lucroLiquido ?? 0) >= 0 ? 'bg-blue-100' : 'bg-amber-100',
    },
    {
      label: 'Inadimplência (vencidas)',
      value: formatCurrency(stats?.inadimplencia ?? 0),
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Olá! 👋</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Período financeiro: <span className="font-semibold capitalize">{stats?.periodo ?? periodoLabel}</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            await signOut();
            navigate('/', { replace: true });
          }}
          className="touch-target"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {stats?.hasExpiredDoc && (
        <Alert variant="destructive" className="mb-6 animate-pulse border-2 shadow-lg">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="font-extrabold tracking-tight">ATENÇÃO CRÍTICA</AlertTitle>
          <AlertDescription className="font-medium">
            Risco de apreensão de veículo. Documentos vencidos!
          </AlertDescription>
        </Alert>
      )}

      {statsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Não foi possível carregar seus dados</AlertTitle>
          <AlertDescription>
            {statsError instanceof Error ? statsError.message : 'Erro desconhecido.'}
          </AlertDescription>
        </Alert>
      )}

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

      <Card className="p-4 mb-6">
        <h2 className="text-base font-bold text-foreground mb-4">Receitas vs Despesas</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.chartData ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis tickFormatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
