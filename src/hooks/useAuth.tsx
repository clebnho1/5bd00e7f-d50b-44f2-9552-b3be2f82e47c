import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, plano: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  isAdmin: () => boolean;
  userRole: UserRole | null;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  console.log('🔧 [AUTH_PROVIDER] Estado:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading, 
    userRole,
    initialized 
  });

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 [ROLE] Buscando role para:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [ROLE_ERROR]', error);
        setUserRole('user');
        return;
      }

      console.log('✅ [ROLE_SUCCESS] Role:', data.role);
      setUserRole(data.role);
    } catch (error) {
      console.error('💥 [ROLE_CRASH]', error);
      setUserRole('user');
    }
  };

  useEffect(() => {
    if (initialized) return;

    console.log('🔄 [AUTH_INIT] Inicializando uma única vez');
    setInitialized(true);

    let mounted = true;

    const initAuth = async () => {
      try {
        // Configurar listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;
            
            console.log('🔄 [AUTH_CHANGE]', { event, hasSession: !!newSession });
            
            if (event === 'SIGNED_OUT' || !newSession) {
              setUser(null);
              setSession(null);
              setUserRole(null);
            } else {
              setSession(newSession);
              setUser(newSession.user);
              
              if (newSession.user) {
                await fetchUserRole(newSession.user.id);
              }
            }
            
            setLoading(false);
          }
        );

        // Obter sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (currentSession?.user) {
            console.log('📨 [SESSION] Sessão encontrada');
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchUserRole(currentSession.user.id);
          }
          setLoading(false);
        }

        return subscription;
      } catch (error) {
        console.error('💥 [AUTH_INIT_ERROR]', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const subscriptionPromise = initAuth();

    return () => {
      mounted = false;
      subscriptionPromise.then(sub => sub?.unsubscribe());
    };
  }, [initialized]);

  const isAdmin = () => {
    return userRole === 'admin' || user?.email === 'admin@admin.com';
  };

  const refreshUserRole = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      const errorMsg = "Email e senha são obrigatórios";
      toast({
        title: "Campos obrigatórios",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    try {
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
      
    } catch (error) {
      console.error('💥 Erro durante sign in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, plano: string) => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      const errorMsg = "Todos os campos são obrigatórios";
      toast({
        title: "Campos obrigatórios",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    if (password.length < 6) {
      const errorMsg = "A senha deve ter pelo menos 6 caracteres";
      toast({
        title: "Senha muito fraca",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
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
        
        if (error.message.includes('User already registered') || 
            error.message.includes('duplicate key value violates unique constraint')) {
          errorMessage = "Este email já está cadastrado";
          
          toast({
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login.",
            variant: "destructive",
          });
          
          throw new Error(errorMessage);
        }

        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user && !data.session) {
        toast({
          title: "Verifique seu email",
          description: "Um link de confirmação foi enviado para seu email.",
        });
      } else if (data.session) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao sistema!",
        });
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      await supabase.auth.signOut();
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email.trim()) {
      const errorMsg = "Email é obrigatório";
      toast({
        title: "Campo obrigatório",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
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
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  };

  const contextValue = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    loading,
    isAdmin,
    userRole,
    refreshUserRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
