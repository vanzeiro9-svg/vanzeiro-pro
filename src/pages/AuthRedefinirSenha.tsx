import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * Página aberta pelo link do e-mail de recuperação de senha (Supabase).
 * Configure em Supabase: Authentication → URL Configuration → Redirect URLs
 * a URL: {origin}/auth/redefinir-senha
 */
const AuthRedefinirSenha = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: "Senha inválida",
        description: "Use pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: "Senhas diferentes",
        description: "Digite a mesma senha nos dois campos.",
        variant: "destructive",
      });
      return;
    }

       setLoading(true);
    try {
      const update = supabase.auth.updateUser({ password });
      const timeoutMs = 25_000;
      const { error } = await Promise.race([
        update,
        new Promise<{ error: Error }>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "A operação demorou demais. Feche outras abas com o Vanzeiro aberto e tente de novo.",
                ),
              ),
            timeoutMs,
          ),
        ),
      ]);
      if (error) throw error;
      toast({
        title: "Senha atualizada",
        description: "Faça login com sua nova senha.",
      });
      await supabase.auth.signOut();
      navigate("/auth/login", { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Não foi possível atualizar a senha.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mb-32" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/20 rotate-3">
            <Bus className="w-10 h-10 text-white -rotate-3" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 italic uppercase">
              Nova senha
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Defina uma nova senha para sua conta
            </p>
          </div>
        </div>

        {!ready ? (
          <p className="text-center text-sm text-muted-foreground">
            Aguardando link de recuperação… Se esta página ficar assim, abra o link enviado por e-mail ou solicite uma nova recuperação na tela de login.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="np">Nova senha</Label>
              <Input
                id="np"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="touch-target text-base"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="npc">Confirmar senha</Label>
              <Input
                id="npc"
                type="password"
                placeholder="Repita a senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "Salvando..." : "SALVAR NOVA SENHA"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/auth/login" className="text-primary font-semibold underline-offset-2 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthRedefinirSenha;
