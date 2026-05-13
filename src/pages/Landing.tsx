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
  WifiOff,
  Star
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

  const depoimentos = [
    {
      nome: 'Rogério M.',
      cidade: 'São Paulo, SP',
      texto: 'Antes eu esquecia de cobrar. Hoje ninguém me deve. O WhatsApp do Vanzeiro é incrível.',
      estrelas: 5,
    },
    {
      nome: 'Patrícia S.',
      cidade: 'Belo Horizonte, MG',
      texto: 'Organizei 28 alunos em 10 minutos. Não vivo mais sem esse app.',
      estrelas: 5,
    },
    {
      nome: 'Carlos A.',
      cidade: 'Curitiba, PR',
      texto: 'Recebi o alerta que minha vistoria ia vencer. Evitei uma multa enorme. Vale cada centavo.',
      estrelas: 5,
    },
  ];

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

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-slate-500 font-bold text-xs uppercase tracking-wide">
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Sem contrato
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> 100% seguro
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                <WifiOff className="w-3.5 h-3.5 text-orange-500" /> Funciona offline
              </span>
            </div>
          </div>

          {/* App Mockup */}
          <div className="relative flex justify-center">
            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl" />
            {/* Phone Frame */}
            <div className="relative w-[280px] bg-slate-900 rounded-[3rem] p-2.5 shadow-2xl border-4 border-slate-800">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-full z-10" />
              <div className="bg-slate-50 rounded-[2.4rem] overflow-hidden">
                {/* App Screenshot Mockup */}
                <div className="bg-white min-h-[520px] p-4 pt-10">
                  {/* Header */}
                  <div className="mb-5">
                    <p className="text-lg font-black text-slate-900">Olá! 👋</p>
                    <p className="text-xs text-slate-400">mestre@vanzeiro.com.br</p>
                  </div>
                  {/* Stats Cards */}
                  <div className="space-y-2.5 mb-4">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 text-sm">👥</div>
                      <div>
                        <p className="text-lg font-black text-slate-900 leading-none">30</p>
                        <p className="text-[10px] text-slate-400 font-medium">Alunos Ativos</p>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500 text-sm">⚠️</div>
                      <div>
                        <p className="text-base font-black text-slate-900 leading-none">R$ 1.850</p>
                        <p className="text-[10px] text-slate-400 font-medium">A receber no mês</p>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm">✅</div>
                      <div>
                        <p className="text-base font-black text-slate-900 leading-none">Docs OK</p>
                        <p className="text-[10px] text-slate-400 font-medium">Status Legal</p>
                      </div>
                    </div>
                  </div>
                  {/* Bottom Nav Mock */}
                  <div className="absolute bottom-6 left-0 right-0 mx-4 bg-white border-t border-slate-100 flex justify-around pt-2 pb-1">
                    {['🏠','👥','📋','💰','📄','⚙️'].map((icon, i) => (
                      <span key={i} className={`text-base ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>{icon}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section — Compact 2-col grid on mobile */}
      <section className="py-16 bg-slate-50 px-4">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-3">Resolva seus maiores problemas hoje</h2>
          <p className="text-slate-500 font-medium">Desenvolvido por quem entende a rotina das vans escolares.</p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              title: "Chega de Calote",
              desc: "Cobranças automáticas e lembretes no WhatsApp com um clique.",
              icon: Wallet,
              color: "bg-green-100 text-green-600",
            },
            {
              title: "Prazos Sob Controle",
              desc: "Alertas antes de qualquer documento vencer. Evite multas e apreensões.",
              icon: Calendar,
              color: "bg-blue-100 text-blue-600",
            },
            {
              title: "Sem Burocracia",
              desc: "Alunos, rotas e chamada digital. Histórico exportável em segundos.",
              icon: ClipboardList,
              color: "bg-orange-100 text-orange-600",
            }
          ].map((item) => (
            <Card key={item.title} className="p-5 border-none shadow-md hover:shadow-lg transition-shadow bg-white group col-span-1 last:col-span-2 md:last:col-span-1">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-3">Quem já usa, não volta atrás</h2>
            <p className="text-slate-500 font-medium">Transportadores reais. Resultados reais.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {depoimentos.map((d) => (
              <Card key={d.nome} className="p-6 border border-slate-100 shadow-md hover:shadow-lg transition-shadow bg-white">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: d.estrelas }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 font-medium italic mb-4 leading-relaxed">"{d.texto}"</p>
                <div className="border-t border-slate-100 pt-4">
                  <p className="font-bold text-slate-900 text-sm">{d.nome}</p>
                  <p className="text-slate-400 text-xs">{d.cidade}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[260px] lg:min-h-[320px]">
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80"
              alt="Motorista de van escolar em frente ao veículo"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white text-2xl lg:text-3xl font-black leading-tight">
                Feito para quem trabalha de verdade.
              </p>
            </div>
          </div>

          <Card className="border-none shadow-lg bg-white p-7 lg:p-9">
            <div className="space-y-5">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-black uppercase tracking-widest">
                Parceria Exclusiva
              </span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                Clientes Zero Utilitários ganham <span className="text-primary">6 meses de Plano Pro grátis</span>.
              </h2>
              <p className="text-slate-600 text-lg">
                Comprou sua van na Zero Utilitários? Solicite seu cupom e profissionalize sua gestão sem custo por meio ano.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900">Preço justo e sem pegadinhas</h2>
            <p className="text-xl text-slate-500">Tudo o que o transportador precisa por um valor acessível.</p>
          </div>
          
          <Card className="max-w-md w-full p-10 border-4 border-primary shadow-2xl relative bg-white">
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
                {/* Urgency badge */}
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-700 font-bold text-sm">
                  🎉 Teste 7 dias grátis — cancele quando quiser
                </div>
              </div>

              <div className="space-y-4 py-8 border-y border-slate-100 text-left">
                {[
                  "Gestão completa de alunos",
                  "Controle financeiro e cobrança Zap",
                  "Alertas de documentos e Detran",
                  "Suporte prioritário via WhatsApp",
                  "Backup automático de dados"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-bold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleCTA} size="lg" className="w-full h-14 text-lg font-black shadow-xl shadow-primary/20">
                Assinar Agora
              </Button>
              
              <div className="flex flex-col gap-1 pt-2">
                <span className="inline-flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Sem contrato • Cancele quando quiser
                </span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Garantia de Satisfação de 7 dias</span>
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
            <span className="text-slate-300 font-normal">Copyright © 2025 Vanzeiro</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
