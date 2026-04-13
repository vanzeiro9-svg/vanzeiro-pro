import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Frequencia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const hoje = new Date().toISOString().slice(0, 10);
  const [rotaId, setRotaId] = useState<string>('todas');

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rotas').select('*').order('nome');
      if (error) throw error;
      return data;
    },
  });

  const { data: alunos = [] } = useQuery({
    queryKey: ['alunos-freq', rotaId],
    queryFn: async () => {
      let query = supabase.from('alunos').select('id, nome, rota_id, rotas(nome)').eq('status', 'ativo').order('nome');
      if (rotaId !== 'todas') query = query.eq('rota_id', rotaId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: frequencias = [] } = useQuery({
    queryKey: ['frequencias', hoje],
    queryFn: async () => {
      const { data, error } = await supabase.from('frequencias').select('*').eq('data', hoje);
      if (error) throw error;
      return data;
    },
  });

  const marcarMutation = useMutation({
    mutationFn: async ({ alunoId, status }: { alunoId: string; status: string }) => {
      const existing = frequencias.find((f: any) => f.aluno_id === alunoId);
      if (existing) {
        const { error } = await supabase.from('frequencias').update({ status }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('frequencias').insert({
          user_id: user!.id,
          aluno_id: alunoId,
          data: hoje,
          status,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frequencias'] });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const getStatus = (alunoId: string) => {
    const freq = frequencias.find((f: any) => f.aluno_id === alunoId);
    return freq ? (freq as any).status : null;
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Chamada</h1>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {rotas.length > 0 && (
        <div className="mb-4">
          <Select value={rotaId} onValueChange={setRotaId}>
            <SelectTrigger className="touch-target"><SelectValue placeholder="Filtrar por rota" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as rotas</SelectItem>
              {rotas.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {alunos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum aluno ativo encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alunos.map((aluno: any) => {
            const status = getStatus(aluno.id);
            return (
              <Card key={aluno.id} className="p-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{aluno.nome}</h3>
                    {aluno.rotas?.nome && <p className="text-xs text-muted-foreground">🚐 {aluno.rotas.nome}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={status === 'presente' ? 'default' : 'outline'}
                      onClick={() => marcarMutation.mutate({ alunoId: aluno.id, status: 'presente' })}
                      className="touch-target text-xs"
                    >
                      ✅ Embarcou
                    </Button>
                    <Button
                      size="sm"
                      variant={status === 'ausente' ? 'destructive' : 'outline'}
                      onClick={() => marcarMutation.mutate({ alunoId: aluno.id, status: 'ausente' })}
                      className="touch-target text-xs"
                    >
                      ❌ Não veio
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Frequencia;
