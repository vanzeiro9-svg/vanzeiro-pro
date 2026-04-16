import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import AuthRedefinirSenha from "./pages/AuthRedefinirSenha";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import Mensalidades from "./pages/Mensalidades";
import Inadimplencia from "./pages/Inadimplencia";
import Documentos from "./pages/Documentos";
import Frequencia from "./pages/Frequencia";
import Configuracoes from "./pages/Configuracoes";
import Planos from "./pages/Planos";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // Se ainda estiver carregando a sessão inicial e não temos um usuário, mostramos loading
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Iniciando sistema...</p>
      </div>
    );
  }
  
  // Se terminou de carregar e não há usuário, manda para o login
  if (!loading && !user) return <Navigate to="/auth/login" replace />;
  
  // Se temos um usuário (mesmo que o loading ainda esteja true buscando perfil), liberamos o acesso
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // Se ainda está carregando, não mostra nada (evita flash do login)
  if (loading) return null;

  // Se já temos usuário e assinatura ativa, entra no dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth/login" element={<AuthRoute><AuthLogin /></AuthRoute>} />
            <Route path="/auth/signup" element={<AuthRoute><AuthSignup /></AuthRoute>} />
            <Route path="/auth/redefinir-senha" element={<AuthRedefinirSenha />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/" element={<Landing />} />
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/planos" element={<ProtectedRoute><Planos /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/alunos" element={<ProtectedRoute><Alunos /></ProtectedRoute>} />
            <Route path="/mensalidades" element={<ProtectedRoute><Mensalidades /></ProtectedRoute>} />
            <Route path="/inadimplencia" element={<ProtectedRoute><Inadimplencia /></ProtectedRoute>} />
            <Route path="/documentos" element={<ProtectedRoute><Documentos /></ProtectedRoute>} />
            <Route path="/frequencia" element={<ProtectedRoute><Frequencia /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
