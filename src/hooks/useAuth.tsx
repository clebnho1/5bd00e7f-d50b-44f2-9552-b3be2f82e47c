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
  const { toast } = useToast();

  console.log('🔧 [AUTH_PROVIDER] Estado atual:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading, 
    userRole 
  });

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 [ROLE] Buscando role para usuário:', userId);
      
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

      console.log('✅ [ROLE_SUCCESS] Role encontrado:', data.role);
      setUserRole(data.role);
    } catch (error) {
      console.error('💥 [ROLE_CRASH]', error);
      setUserRole('user');
    }
  };

  useEffect(() => {
    console.log('🔄 [INIT] Iniciando autenticação');
    
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // PRIMEIRO: Configurar listener para mudanças de estado
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;
            
            console.log('🔄 [AUTH_CHANGE] Evento:', {
              event,
              hasSession: !!newSession,
              hasUser: !!newSession?.user
            });
            
            if (event === 'SIGNED_OUT' || !newSession) {
              clearAuthState();
            } else {
              setSession(newSession);
              setUser(newSession?.user ?? null);
              
              if (newSession?.user) {
                await fetchUserRole(newSession.user.id);
              }
            }
          }
        );

        // SEGUNDO: Obter sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log('📨 [SESSION] Sessão obtida:', {
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user
        });

        if (isMounted) {
          if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchUserRole(currentSession.user.id);
          } else {
            clearAuthState();
          }
          
          setLoading(false);
          console.log('✅ [INIT] Inicialização concluída');
        }

        return subscription;

      } catch (error) {
        console.error('💥 [INIT_ERROR]', error);
        if (isMounted) {
          clearAuthState();
          setLoading(false);
        }
      }
    };

    let subscriptionPromise = initializeAuth();

    return () => {
      isMounted = false;
      subscriptionPromise.then(subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
      console.log('🧹 [CLEANUP] Limpando AuthProvider');
    };
  }, []);

  const refreshUserRole = async () => {
    if (user) {
      console.log('🔄 [REFRESH_ROLE] Atualizando role do usuário');
      await fetchUserRole(user.id);
    }
  };

  const isAdmin = () => {
    return userRole === 'admin' || user?.email === 'admin@admin.com';
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
      console.log('🔐 [SIGNIN] Tentativa de login para:', email);
      
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
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Muitas tentativas. Tente novamente em alguns minutos";
        }

        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      }

      console.log('✅ [SIGNIN] Login bem-sucedido');
      
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
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Email inválido";
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
      console.log('🚪 [SIGNOUT] Iniciando logout');
      
      // Limpar estado local primeiro para evitar tentativas de uso de sessão inválida
      clearAuthState();
      
      // Tentar fazer logout no Supabase, mas não falhar se der erro
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          // Se for erro de sessão não encontrada, não é um problema crítico
          if (error.message?.includes('session') || error.message?.includes('Session')) {
            console.log('ℹ️ [SIGNOUT] Sessão já estava inválida, logout local realizado');
          } else {
            console.error('⚠️ [SIGNOUT_WARNING] Erro no logout remoto:', error);
          }
        } else {
          console.log('✅ [SIGNOUT] Logout remoto bem-sucedido');
        }
      } catch (remoteError) {
        console.error('⚠️ [SIGNOUT_REMOTE_ERROR] Erro no logout remoto:', remoteError);
        // Continuar mesmo com erro remoto - o estado local já foi limpo
      }
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      
    } catch (error) {
      console.error('💥 [SIGNOUT_CRITICAL] Erro crítico durante logout:', error);
      // Mesmo com erro crítico, garantir que o estado local seja limpo
      clearAuthState();
      
      toast({
        title: "Logout realizado",
        description: "Sessão encerrada localmente.",
      });
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
