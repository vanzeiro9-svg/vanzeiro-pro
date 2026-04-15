import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

const Inadimplencia = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState('devedores');

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['inadimplencia-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mensalidades')
        .select('*, alunos(nome, responsavel_nome, responsavel_whatsapp)')
        .eq('user_id', user!.id)
        .order('mes_referencia', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Aggregation Logic
  const studentsMap = records.reduce((acc: any, curr: any) => {
    const alunoId = curr.aluno_id;
    if (!acc[alunoId]) {
      acc[alunoId] = {
        id: alunoId,
        nome: curr.alunos?.nome,
        responsavel: curr.alunos?.responsavel_nome,
        whatsapp: curr.alunos?.responsavel_whatsapp,
        mesesDevidos: [],
        mesesPagos: [],
        totalDevido: 0,
        totalPago: 0,
      };
    }

    if (curr.status === 'pago') {
      acc[alunoId].mesesPagos.push(curr);
      acc[alunoId].totalPago += Number(curr.valor);
    } else {
      acc[alunoId].mesesDevidos.push(curr);
      acc[alunoId].totalDevido += Number(curr.valor);
    }

    return acc;
  }, {});

  const studentsList = Object.values(studentsMap) as any[];
  const devedores = studentsList.filter(s => s.mesesDevidos.length > 0)
    .sort((a, b) => b.totalDevido - a.totalDevido);
  const emDia = studentsList.filter(s => s.mesesDevidos.length === 0)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const metrics = {
    totalDevido: devedores.reduce((acc, curr) => acc + curr.totalDevido, 0),
    totalRecebido: studentsList.reduce((acc, curr) => acc + curr.totalPago, 0),
    totalAlunosInadimplentes: devedores.length,
  };

  const handleCobrarZap = (s: any) => {
    const nomeMotorista = profile?.nome || 'Seu Motorista';
    const chavePix = profile?.chave_pix || '[SUA CHAVE PIX NO PERFIL]';
    
    // Build list of months
    const listaMeses = s.mesesDevidos.map((m: any) => {
      const mesNome = new Date(m.mes_referencia + '-02').toLocaleDateString('pt-BR', { month: 'short' });
      return `• ${mesNome}: R$ ${Number(m.valor).toFixed(2)}`;
    }).join('\n');

    const texto = `Olá ${s.responsavel}, aqui é o ${nomeMotorista}. \n\nNotei que o(a) *${s.nome}* possui as seguintes mensalidades em aberto:\n${listaMeses}\n\n*Total Acumulado: R$ ${s.totalDevido.toFixed(2)}*\n\nChave Pix para pagamento: *${chavePix}*\n\nQualquer dúvida, estou à disposição! 🚐💨`;
    
    const fone = s.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  if (isLoading) return <AppLayout><div className="pt-20 text-center text-muted-foreground animate-pulse">Carregando dados financeiros...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Painel Financeiro</h1>
        <p className="text-sm text-muted-foreground">Visão geral de recebimentos e pendências</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 bg-destructive/5 border-destructive/20 shadow-none">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">A Receber (Total)</span>
          </div>
          <p className="text-xl font-black text-destructive">R$ {metrics.totalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-4 bg-success/5 border-success/20 shadow-none">
          <div className="flex items-center gap-2 text-success mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Recebido</span>
          </div>
          <p className="text-xl font-black text-success">R$ {metrics.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
      </div>

      <Tabs defaultValue="devedores" className="space-y-4" onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 h-11 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="devedores" className="rounded-lg font-bold gap-2">
            Inadimplentes
            <Badge variant={devedores.length > 0 ? "destructive" : "secondary"} className="h-5 px-1.5 text-[10px]">
              {devedores.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="historico" className="rounded-lg font-bold">Histórico Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="devedores" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {devedores.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">Parabéns! Nenhuma inadimplência encontrada.</p>
            </Card>
          ) : (
            devedores.map((s) => (
              <Card key={s.id} className="p-4 border-none shadow-sm space-y-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <AlertCircle className="w-16 h-16 text-destructive" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground">{s.nome}</h3>
                    <p className="text-[11px] text-muted-foreground">Responsável: {s.responsavel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-destructive leading-none">R$ {s.totalDevido.toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-destructive/70 uppercase">{s.mesesDevidos.length} meses em atraso</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 border-y border-dashed py-3 border-muted">
                    {s.mesesDevidos.map((m: any) => (
                        <Badge key={m.id} variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-[9px] uppercase font-bold">
                            {new Date(m.mes_referencia + '-02').toLocaleDateString('pt-BR', { month: 'short' })}
                        </Badge>
                    ))}
                </div>

                <Button 
                  onClick={() => handleCobrarZap(s)}
                  className="w-full touch-target gap-2 font-bold shadow-lg shadow-primary/10"
                >
                  <MessageSquare className="w-4 h-4" /> 
                  Cobrar Todos no Zap
                </Button>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="historico" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           {studentsList.length === 0 ? (
             <p className="text-center text-muted-foreground py-10">Nenhum dado de mensalidade disponível.</p>
           ) : (
             studentsList.sort((a,b) => a.nome.localeCompare(b.nome)).map(s => (
                <Card key={s.id} className="p-4 border-none shadow-sm group">
                   <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-foreground italic flex items-center gap-2">
                            {s.nome}
                            {s.mesesDevidos.length === 0 && <CheckCircle2 className="w-3 h-3 text-success" />}
                        </h3>
                        <p className="text-[10px] text-muted-foreground">Total Pago: R$ {s.totalPago.toFixed(2)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   
                   <div className="flex flex-wrap gap-1 text-[10px]">
                      {records.filter(r => r.aluno_id === s.id).map((m: any) => (
                        <div key={m.id} className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter ${
                            m.status === 'pago' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                            {new Date(m.mes_referencia + '-02').toLocaleDateString('pt-BR', { month: 'short' })}
                        </div>
                      ))}
                   </div>
                </Card>
             ))
           )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Inadimplencia;
