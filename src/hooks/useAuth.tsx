
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, plano: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erro ao verificar sessão:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Email e senha são obrigatórios",
        variant: "destructive",
      });
      throw new Error("Email e senha são obrigatórios");
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      let errorMessage = "Erro no login";
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Email ou senha incorretos";
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada";
      }

      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Login realizado com sucesso!",
      description: "Bem-vindo de volta!",
    });
  };

  const signUp = async (email: string, password: string, name: string, plano: string) => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      throw new Error("Todos os campos são obrigatórios");
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      throw new Error("Senha muito fraca");
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          plano: plano,
        },
      },
    });

    if (error) {
      let errorMessage = "Erro no cadastro";
      
      if (error.message.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado";
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres";
      }

      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Verifique seu email para confirmar a conta.",
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao sair",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const resetPassword = async (email: string) => {
    if (!email.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Email é obrigatório",
        variant: "destructive",
      });
      throw new Error("Email é obrigatório");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Email enviado!",
      description: "Verifique sua caixa de entrada para redefinir sua senha.",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      resetPassword,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
