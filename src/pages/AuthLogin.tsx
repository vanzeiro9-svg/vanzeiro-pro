import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const SUPPORT_EMAIL = "mestre@vanzeiro.com.br";

/** Domínios frequentemente digitados errado → domínio provável (evita “não recebi o e-mail”). */
const EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  "gmaill.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
};

function emailWithTypoSuggestion(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  const domain = email.slice(at + 1).trim().toLowerCase();
  const fixedDomain = EMAIL_DOMAIN_TYPOS[domain];
  if (!fixedDomain) return null;
  return `${email.slice(0, at + 1)}${fixedDomain}`;
}

const AuthLogin = () => {
  const { signIn, requestPasswordReset } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [forgotEmailOpen, setForgotEmailOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      const lower = message.toLowerCase();
      let description = message;
      if (message === "Invalid login credentials") {
        description = "E-mail ou senha incorretos.";
      } else if (
        lower.includes("email not confirmed") ||
        lower.includes("email_not_confirmed")
      ) {
        description =
          "Este e-mail ainda não foi confirmado. No Supabase: Authentication → Users → abra o usuário e confirme o e-mail, ou marque “Auto Confirm” ao criar o usuário.";
      }
      toast({
        title: "Erro ao entrar",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast({
        title: "Informe seu e-mail",
        description: "Digite o e-mail da conta acima para receber o link de redefinição.",
        variant: "destructive",
      });
      return;
    }
    const suggested = emailWithTypoSuggestion(trimmed);
    if (suggested) {
      toast({
        title: "Confira o endereço de e-mail",
        description: `O domínio parece incorreto. Você quis dizer ${suggested}? Corrija no campo acima e peça o link de novo.`,
        variant: "destructive",
      });
      return;
    }
    setResetLoading(true);
    try {
      await requestPasswordReset(trimmed);
      toast({
        title: "E-mail enviado",
        description: "Se existir uma conta com esse e-mail, você receberá o link para redefinir a senha.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Não foi possível enviar o e-mail.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setResetLoading(false);
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
              Vanzeiro
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Faça login para acessar seu painel
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="touch-target text-base"
              required
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotEmailOpen(true)}
                className="text-sm text-primary font-semibold underline-offset-2 hover:underline"
              >
                Esqueceu seu e-mail?
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="touch-target text-base"
              required
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-sm text-primary font-semibold underline-offset-2 hover:underline disabled:opacity-50"
              >
                {resetLoading ? "Enviando…" : "Esqueceu sua senha?"}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full touch-target text-base font-black shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? "Entrando..." : "ENTRAR"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            to="/auth/signup"
            className="text-primary font-semibold underline-offset-2 hover:underline"
          >
            Criar conta
          </Link>
        </p>

        <Dialog open={forgotEmailOpen} onOpenChange={setForgotEmailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Esqueceu seu e-mail?</DialogTitle>
              <DialogDescription className="text-left space-y-3 pt-2">
                <span className="block">
                  Não há recuperação automática de e-mail. Procure na caixa de entrada (e no spam) mensagens da Vanzeiro
                  ou do cadastro. Se ainda não encontrar, fale com o suporte informando seu nome e WhatsApp usados no
                  cadastro.
                </span>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Recuperar%20e-mail%20Vanzeiro`}
                  className="inline-block text-primary font-semibold underline-offset-2 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AuthLogin;
