import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const SubscriptionLock = () => {
  const { user, signOut } = useAuth();

  const { data: count = 0 } = useQuery({
    queryKey: ['alunos-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop Blur Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />

      {/* Central Card */}
      <Card className="relative w-full max-w-sm p-8 bg-card shadow-2xl border-2 border-primary/20 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Sua gestão está pausada</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seus <span className="font-bold text-foreground">{count}</span> alunos e dados financeiros estão salvos com segurança. 
              Reative agora para voltar a gerir suas rotas.
            </p>
          </div>

          <div className="w-full space-y-3">
            <Button 
              className="w-full touch-target font-bold gap-2 text-base h-12"
              onClick={() => window.open('https://vanzeiro.com.br', '_blank')}
            >
              REATIVAR ASSINATURA
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full touch-target text-muted-foreground hover:text-foreground gap-2"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </Button>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
          Vanzeiro Pro • Sistema de Gestão
        </p>
      </Card>
    </div>
  );
};

export default SubscriptionLock;
