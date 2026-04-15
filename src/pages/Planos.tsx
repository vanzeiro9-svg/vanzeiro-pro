import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { startStripeCheckout } from "@/lib/billing";
import { useState } from "react";

const Planos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await startStripeCheckout("new");
    } catch (error: any) {
      toast({
        title: "Erro no checkout",
        description: error.message ?? "Não foi possível iniciar o checkout no Stripe.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900">Escolha seu plano</h1>
          <p className="text-slate-600 mt-3">
            Para continuar para o painel, ative sua assinatura.
          </p>
        </div>

        <Card className="max-w-md mx-auto p-8 border-2 border-primary shadow-xl bg-white">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <span className="inline-flex bg-primary text-white rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest">
                Plano Pro
              </span>
              <div className="flex items-end justify-center gap-1">
                <span className="text-xl font-bold mb-2">R$</span>
                <span className="text-6xl font-black">97</span>
                <span className="text-slate-500 font-bold mb-2">/mês</span>
              </div>
            </div>

            <div className="space-y-3 text-left">
              {[
                "Gestão completa de alunos",
                "Mensalidades e cobranças no WhatsApp",
                "Alertas de documentos e vencimentos",
                "Suporte prioritário",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12 font-black text-base"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Redirecionando..." : "ATIVAR ASSINATURA"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
              Voltar para página inicial
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Planos;
