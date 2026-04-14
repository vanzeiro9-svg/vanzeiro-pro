import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Wallet, 
  Calendar, 
  ClipboardList, 
  ArrowRight, 
  ShieldCheck, 
  XCircle 
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="font-black text-white italic text-xl">V</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Vanzeiro</span>
          </div>
          <Button variant="ghost" className="font-bold text-slate-600 hover:text-primary" asChild>
            <Link to={user ? "/dashboard" : "/login"}>
              {user ? "Ir para o Painel" : "Entrar"}
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900">
              O fim do caderninho. <br />
              <span className="text-primary italic">O início da sua gestão profissional.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              O Vanzeiro é o único app pensado exclusivamente para o transportador escolar brasileiro. Organize seus alunos, controle mensalidades e documentos em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={handleCTA} size="lg" className="h-14 px-10 text-lg font-black shadow-xl shadow-primary/20 gap-2">
                Começar Agora <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 text-slate-400 font-bold text-sm uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 100% Seguro</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Sem Multas</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl" />
            <img 
              src="/vanzeiro_hero.png" 
              alt="Transportador Escolar Profissional" 
              className="relative rounded-3xl shadow-2xl border-2 border-white"
            />
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4">Resolva seus maiores problemas hoje</h2>
          <p className="text-slate-500 font-medium">Desenvolvedo por quem entende a rotina das vans escolares.</p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Chega de Calote",
              desc: "Gere cobranças automáticas e envie lembretes profissionais no WhatsApp com um clique. Mais dinheiro no seu bolso.",
              icon: Wallet,
              color: "bg-green-100 text-green-600",
            },
            {
              title: "Prazos Sob Controle",
              desc: "Receba alertas críticos antes de qualquer documento vencer. Evite multas de trânsito e apreensões do Detran.",
              icon: Calendar,
              color: "bg-blue-100 text-blue-600",
            },
            {
              title: "Sem Burocracia",
              desc: "Lista de alunos, escolas e rotas organizada. Faça chamada digital e tenha histórico de frequência exportável.",
              icon: ClipboardList,
              color: "bg-orange-100 text-orange-600",
            }
          ].map((item) => (
            <Card key={item.title} className="p-8 border-none shadow-lg hover:shadow-xl transition-shadow bg-white group">
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <span className="text-primary font-black tracking-[0.3em] uppercase text-sm">Parceria Exclusiva</span>
              <div className="h-12 flex items-center gap-4 grayscale brightness-200">
                {/* Logo Placeholder for Zero Utilitários */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 border-4 border-white rotate-45 flex items-center justify-center">
                    <span className="rotate-[-45deg] font-black italic">Z</span>
                  </div>
                  <span className="text-2xl font-black italic tracking-tighter">ZERO UTILITÁRIOS</span>
                </div>
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black">
              Clientes Zero Utilitários ganham <span className="text-primary">6 meses de Plano Pro grátis</span>.
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Se você comprou sua van na Zero Utilitários, solicite seu cupom agora e profissionalize sua gestão sem custo por meio ano.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900">Preço justo e sem pegadinhas</h2>
            <p className="text-xl text-slate-500">Tudo o que o transportador precisa por um valor acessível.</p>
          </div>
          
          <Card className="max-w-md w-full p-10 border-4 border-primary shadow-2xl relative">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest">
              Plano Único
            </div>
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <span className="text-slate-400 font-bold uppercase text-sm">Mensalidade</span>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-2xl font-black mb-2">R$</span>
                  <span className="text-7xl font-black tracking-tighter text-slate-900">97</span>
                  <span className="text-slate-400 font-bold text-xl mb-2">/mês</span>
                </div>
              </div>

              <div className="space-y-4 py-8 border-y border-slate-100 text-left">
                {[
                  "Gestão completa de alunos",
                  "Controle financeiro e cobrança Zap",
                  "Alertas de documentos e Detran",
                  "Suporte priorutário via WhatsApp",
                  "Backup automático de dados"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="font-bold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleCTA} size="lg" className="w-full h-14 text-lg font-black shadow-xl shadow-primary/20">
                Assinar Agora
              </Button>
              
              <div className="flex flex-col gap-2 pt-4">
                <span className="inline-flex items-center justify-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Cancele quando quiser, sem multa.
                </span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Garantia de Satisfação</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="font-black text-white italic text-xl">V</span>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase italic">Vanzeiro</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm font-medium">
              Transformando o transporte escolar brasileiro através da tecnologia e profissionalismo.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:justify-end text-slate-500 font-bold text-sm uppercase tracking-widest">
            <Link to="#" className="hover:text-primary transition-colors">Termos de Uso</Link>
            <Link to="#" className="hover:text-primary transition-colors">Política de Privacidade</Link>
            <span className="text-slate-300 font-normal">Copyright © 2024 Vanzeiro</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
