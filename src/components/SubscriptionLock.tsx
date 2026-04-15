import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Lock, LogOut, ArrowRight, Clock3 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { startStripeCheckout } from '@/lib/billing';
import { useNavigate } from 'react-router-dom';

const SubscriptionLock = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  const reactivationCouponId = import.meta.env.VITE_STRIPE_REACTIVATION_COUPON_ID || 'COLOQUE_AQUI_O_ID_DO_CUPOM';

  const { data: count = 0 } = useQuery({
    queryKey: ['alunos-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  useEffect(() => {
    const OFFER_DURATION_MS = 2 * 60 * 60 * 1000;
    const STORAGE_KEY = 'vanzeiro_paywall_offer_ends_at';

    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    let endsAt = stored ? Number(stored) : NaN;

    if (!Number.isFinite(endsAt) || endsAt <= now) {
      endsAt = now + OFFER_DURATION_MS;
      localStorage.setItem(STORAGE_KEY, String(endsAt));
    }

    const updateTime = () => {
      const remaining = Math.max(endsAt - Date.now(), 0);
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        const nextEnd = Date.now() + OFFER_DURATION_MS;
        localStorage.setItem(STORAGE_KEY, String(nextEnd));
        endsAt = nextEnd;
      }
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdownLabel = useMemo(() => {
    const totalSeconds = Math.floor(timeLeftMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }, [timeLeftMs]);

  const handleReactivation = async () => {
    setLoading(true);
    try {
      await startStripeCheckout('reactivation', { couponId: reactivationCouponId });
    } catch (error: any) {
      toast({
        title: 'Erro ao reativar',
        description: error.message ?? 'Não foi possível iniciar a reativação no Stripe.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md" />

      <Card className="relative w-full max-w-md p-8 bg-card shadow-2xl border-2 border-primary/20 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary animate-pulse" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-foreground">Sentimos sua falta no Vanzeiro!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seus <span className="font-bold text-foreground">{count}</span> alunos e dados financeiros estão salvos com segurança. 
              Reative agora para voltar a gerir suas rotas.
            </p>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm font-bold text-foreground">
                Reative sua conta agora e ganhe 20% de desconto nas próximas 3 mensalidades.
              </p>
            </div>
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 flex items-center justify-center gap-2">
              <Clock3 className="w-4 h-4 text-amber-700" />
              <p className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                Oferta por tempo limitado: {countdownLabel}
              </p>
            </div>
          </div>

          <div className="w-full space-y-3">
            <Button 
              className="w-full touch-target font-bold gap-2 text-base h-12"
              onClick={handleReactivation}
              disabled={loading}
            >
              {loading ? 'Redirecionando...' : 'Reativar Agora'}
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full touch-target text-muted-foreground hover:text-foreground gap-2"
              onClick={async () => {
                await signOut();
                navigate('/', { replace: true });
              }}
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
