import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, nome: string, whatsapp: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  profile: any;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const query = supabase.from('profiles').select('*').eq('user_id', userId).single();
    const { data, error } = await Promise.race([
      query,
      new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: 'PROFILE_FETCH_TIMEOUT' } }), 20_000),
      ),
    ]);

    if (error) {
      if (error.message === 'PROFILE_FETCH_TIMEOUT') {
        console.warn('Timeout ao carregar perfil; tente recarregar a página.');
      }
      throw error;
    }
    setProfile(data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Failsafe: se nada acontecer em 5 segundos, liberamos a tela
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Nunca use await em chamadas supabase dentro deste callback — causa deadlock com updateUser/setSession etc.
    // Ver: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timeout);
      setLoading(true);
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);

      if (currentUser) {
        void (async () => {
          try {
            await fetchProfile(currentUser.id);
          } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            setProfile(null);
          } finally {
            setLoading(false);
          }
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, nome: string, whatsapp: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, whatsapp } },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const requestPasswordReset = async (email: string) => {
    const redirectTo = `${window.location.origin}/auth/redefinir-senha`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) throw error;
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Primeiro tenta encerrar a sessão no cliente (mais confiável para "deslogar" na hora).
      // Se a lib não suportar scope/local, ela simplesmente ignora o objeto.
      // @ts-expect-error - compat com versões diferentes do supabase-js
      await supabase.auth.signOut({ scope: 'local' });

      // Em seguida tenta encerrar globalmente (revoga refresh token no servidor).
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      // Fallback: mesmo que a chamada falhe, garantimos logout local limpando storage e estado.
      console.warn('Falha ao deslogar via Supabase, limpando sessão local.', error);
    } finally {
      try {
        // Remove tokens persistidos do Supabase (padrão: sb-<project-ref>-auth-token)
        for (let i = localStorage.length - 1; i >= 0; i -= 1) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith('sb-') && key.includes('-auth-token')) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // ignore
      }

      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        profile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
