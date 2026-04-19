import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, MessageSquare, History, Search, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Mensalidades = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [despesaForm, setDespesaForm] = useState({
    categoria: 'Combustivel',
    valor: '',
    data_despesa: new Date().toISOString().slice(0, 10),
  });
  const [mostrarControlePagamentos, setMostrarControlePagamentos] = useState(false);
  const [buscaNome, setBuscaNome] = useState('');

  // Categorias de despesas - padrão + personalizadas (salvas no localStorage)
  const CATEGORIAS_PADRAO = ['Combustível', 'Manutenção', 'Seguro', 'IPVA', 'Pneus', 'Outros'];
  const [categoriasCustom, setCategoriasCustom] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('despesas_categorias') || '[]'); } catch { return []; }
  });
  const [novaCategoria, setNovaCategoria] = useState('');
  const [mostrarNovaCategoria, setMostrarNovaCategoria] = useState(false);

  const todasCategorias = [...CATEGORIAS_PADRAO, ...categoriasCustom];

  const adicionarCategoria = () => {
    const cat = novaCategoria.trim();
    if (!cat || todasCategorias.includes(cat)) return;
    const novas = [...categoriasCustom, cat];
    setCategoriasCustom(novas);
    localStorage.setItem('despesas_categorias', JSON.stringify(novas));
    setDespesaForm((prev) => ({ ...prev, categoria: cat }));
    setNovaCategoria('');
    setMostrarNovaCategoria(false);
  };

  const removerCategoriaCustom = (cat: string) => {
    const novas = categoriasCustom.filter(c => c !== cat);
    setCategoriasCustom(novas);
    localStorage.setItem('despesas_categorias', JSON.stringify(novas));
  };
  const inicioMesFiltro = `${mesFiltro}-01`;
  const inicioProximoMes = (() => {
    const [ano, mes] = mesFiltro.split('-').map(Number);
    const proximo = new Date(ano, mes, 1);
    return `${proximo.getFullYear()}-${String(proximo.getMonth() + 1).padStart(2, '0')}-01`;
  })();

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

  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas', mesFiltro],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select('id, categoria, valor, data_despesa')
        .eq('usuario_id', user!.id)
        .gte('data_despesa', inicioMesFiltro)
        .lt('data_despesa', inicioProximoMes)
        .order('data_despesa', { ascending: false });

      if (error) {
        if (error.message?.includes("Could not find the table 'public.despesas'")) {
          return [];
        }
        throw error;
      }
      return data || [];
    },
  });

  const addDespesaMutation = useMutation({
    mutationFn: async () => {
      const valor = Number(despesaForm.valor);

      if (!despesaForm.categoria || !despesaForm.data_despesa || Number.isNaN(valor) || valor <= 0) {
        throw new Error('Preencha categoria, valor e data corretamente.');
      }

      const { error } = await supabase.from('despesas').insert({
        usuario_id: user!.id,
        descricao: despesaForm.categoria,
        categoria: despesaForm.categoria,
        valor,
        data_despesa: despesaForm.data_despesa,
        fixa: false,
      });

      if (error) {
        if (error.message?.includes("Could not find the table 'public.despesas'")) {
          throw new Error('A tabela de despesas ainda não foi criada no banco. Execute as migrações do Supabase e tente novamente.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDespesaForm({
        categoria: 'Combustivel',
        valor: '',
        data_despesa: new Date().toISOString().slice(0, 10),
      });
      toast({ title: 'Despesa registrada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao registrar despesa', description: error.message, variant: 'destructive' });
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
  const totalDespesasMes = despesas.reduce((acc: number, item: any) => acc + Number(item.valor), 0);
  const mensalidadesFiltradas = mensalidades.filter((m: any) =>
    (m.alunos?.nome || '').toLowerCase().includes(buscaNome.toLowerCase())
  );

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

      <Card className="p-4 mt-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Registro de Despesas</h2>
          <span className="text-xs font-semibold text-muted-foreground capitalize">Período: {mesLabel}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            {mostrarNovaCategoria ? (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  value={novaCategoria}
                  onChange={e => setNovaCategoria(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarCategoria(); } }}
                  placeholder="Nome da nova categoria..."
                  className="touch-target flex-1"
                />
                <Button type="button" onClick={adicionarCategoria} size="sm" className="h-11 px-3 shrink-0">
                  <Check className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-11 px-3 shrink-0" onClick={() => { setMostrarNovaCategoria(false); setNovaCategoria(''); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Select
                value={despesaForm.categoria}
                onValueChange={(value) => {
                  if (value === '__nova__') { setMostrarNovaCategoria(true); return; }
                  setDespesaForm((prev) => ({ ...prev, categoria: value }));
                }}
              >
                <SelectTrigger className="touch-target">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_PADRAO.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  {categoriasCustom.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Personalizadas</div>
                      {categoriasCustom.map(cat => (
                        <div key={cat} className="flex items-center justify-between pr-2">
                          <SelectItem value={cat}>{cat}</SelectItem>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removerCategoriaCustom(cat); }}
                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                  <div className="border-t border-border mt-1 pt-1">
                    <SelectItem value="__nova__">
                      <span className="flex items-center gap-2 text-primary font-semibold">
                        <Plus className="w-3.5 h-3.5" /> Nova categoria...
                      </span>
                    </SelectItem>
                  </div>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={despesaForm.valor}
              onChange={(e) => setDespesaForm((prev) => ({ ...prev, valor: e.target.value }))}
              placeholder="0,00"
              className="touch-target"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              value={despesaForm.data_despesa}
              onChange={(e) => setDespesaForm((prev) => ({ ...prev, data_despesa: e.target.value }))}
              className="touch-target"
            />
          </div>
        </div>

        <Button
          onClick={() => addDespesaMutation.mutate()}
          disabled={addDespesaMutation.isPending}
          className="w-full md:w-auto touch-target"
        >
          {addDespesaMutation.isPending ? 'Salvando despesa...' : 'Salvar despesa'}
        </Button>

        <div className="border-t pt-3">
          <p className="text-sm font-semibold text-foreground">
            Total de despesas no mês: R$ {totalDespesasMes.toFixed(2)}
          </p>
          {despesas.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-1">Nenhuma despesa registrada para este período.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {despesas.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.categoria}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(`${d.data_despesa}T00:00:00`).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-foreground">R$ {Number(d.valor).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 mt-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-foreground">Controle de Pagamento dos Alunos</h2>
          <Button
            type="button"
            variant={mostrarControlePagamentos ? 'outline' : 'default'}
            onClick={() => setMostrarControlePagamentos((prev) => !prev)}
            className="touch-target"
          >
            {mostrarControlePagamentos ? 'Ocultar lista' : 'Mostrar lista'}
          </Button>
        </div>

        {mostrarControlePagamentos && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Buscar aluno por nome..."
                className="pl-9 pr-9"
              />
              {buscaNome && (
                <button
                  onClick={() => setBuscaNome('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  type="button"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {isLoading ? (
              <p className="text-muted-foreground text-center py-6">Carregando...</p>
            ) : mensalidades.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">Nenhuma cobrança neste mês.</p>
                <p className="text-sm text-muted-foreground mt-1">Clique em "Gerar cobranças" para criar.</p>
              </Card>
            ) : mensalidadesFiltradas.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">Nenhum aluno encontrado para "{buscaNome}".</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {mensalidadesFiltradas.map((m: any) => (
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
          </>
        )}
      </Card>
    </AppLayout>
  );
};

export default Mensalidades;
