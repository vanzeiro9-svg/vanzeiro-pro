import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, nome, '');
        toast({
          title: 'Conta criada!',
          description: 'Verifique seu email para confirmar o cadastro.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mb-32" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/20 rotate-3">
            <Bus className="w-10 h-10 text-white -rotate-3" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 italic uppercase">Vanzeiro</h1>
            <p className="text-slate-500 font-medium text-sm">
              Gestão Profissional de Transporte Escolar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="nome">Seu nome</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="touch-target text-base"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="touch-target text-base"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="touch-target text-base"
              minLength={6}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full touch-target text-base font-black shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? 'Aguarde...' : isLogin ? 'ENTRAR NO PAINEL' : 'CRIAR MINHA CONTA'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold underline-offset-2 hover:underline"
          >
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </p>
        
        <div className="pt-6 text-center border-t border-slate-100 mt-4">
          <p className="text-[10px] text-slate-300 font-mono tracking-widest uppercase">
            Build v1.8.2 • Premium Edition
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
