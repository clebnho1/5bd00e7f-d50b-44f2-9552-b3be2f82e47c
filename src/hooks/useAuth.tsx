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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  console.log('🔄 [DEBUG] AuthProvider render - Estado atual:', {
    user: !!user,
    session: !!session,
    loading,
    userRole,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    console.log('🚀 [DEBUG] useEffect iniciado - mounted:', mounted);

    const initializeAuth = async () => {
      try {
        console.log('🔍 [DEBUG] Iniciando initializeAuth...');
        console.log('📊 [DEBUG] Estado antes da inicialização:', {
          user: !!user,
          session: !!session,
          loading,
          mounted
        });
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        console.log('📨 [DEBUG] getSession resposta:', {
          hasSession: !!initialSession,
          hasUser: !!initialSession?.user,
          error: error?.message,
          mounted
        });
        
        if (error) {
          console.error('❌ [DEBUG] Erro ao obter sessão inicial:', error);
          if (mounted) {
            console.log('🔧 [DEBUG] Definindo loading como false devido ao erro');
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          console.log('✅ [DEBUG] Sessão inicial obtida, atualizando estado:', {
            hasSession: !!initialSession,
            hasUser: !!initialSession?.user,
            mounted
          });
          
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('👤 [DEBUG] Usuário encontrado, buscando role...');
            await fetchUserRole(initialSession.user.id);
          }
          
          console.log('🎯 [DEBUG] Definindo loading como false após inicialização');
          setLoading(false);
          console.log('🎉 [DEBUG] Autenticação inicializada com sucesso');
        } else {
          console.log('⚠️ [DEBUG] Componente desmontado, ignorando atualização');
        }
      } catch (error) {
        console.error('💥 [DEBUG] Erro durante inicialização:', error);
        if (mounted) {
          console.log('🔧 [DEBUG] Definindo loading como false devido ao erro catch');
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔄 [DEBUG] onAuthStateChange disparado:', {
          event,
          hasSession: !!currentSession,
          hasUser: !!currentSession?.user,
          mounted,
          timestamp: new Date().toISOString()
        });
        
        if (mounted) {
          console.log('📝 [DEBUG] Atualizando estado com nova sessão');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user && event === 'SIGNED_IN') {
            console.log('🔐 [DEBUG] Usuário logado, buscando role...');
            await fetchUserRole(currentSession.user.id);
          } else if (!currentSession?.user) {
            console.log('👤 [DEBUG] Usuário deslogado, limpando role');
            setUserRole(null);
          }
          
          // Garantir que loading seja false após qualquer mudança de auth
          if (loading) {
            console.log('🔧 [DEBUG] Definindo loading como false após mudança de auth');
            setLoading(false);
          }
          
          console.log('📊 [DEBUG] Estado após onAuthStateChange:', {
            user: !!currentSession?.user,
            session: !!currentSession,
            loading: false,
            event
          });
        } else {
          console.log('⚠️ [DEBUG] onAuthStateChange: componente desmontado, ignorando');
        }
      }
    );

    // Timeout de segurança para garantir que loading seja false
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.log('⏰ [DEBUG] Timeout de segurança: definindo loading como false');
        console.log('📊 [DEBUG] Estado no timeout:', {
          mounted,
          loading,
          user: !!user,
          session: !!session
        });
        setLoading(false);
      } else {
        console.log('⏰ [DEBUG] Timeout executado mas condições não atendidas:', {
          mounted,
          loading,
          user: !!user,
          session: !!session
        });
      }
    }, 3000);

    initializeAuth();

    return () => {
      console.log('🧹 [DEBUG] Cleanup: desmontando AuthProvider');
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 [DEBUG] Buscando role para usuário:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [DEBUG] Erro ao buscar role:', error);
        return;
      }

      console.log('✅ [DEBUG] Role encontrado:', data.role);
      setUserRole(data.role);
    } catch (error) {
      console.error('💥 [DEBUG] Erro ao buscar role do usuário:', error);
    }
  };

  const isAdmin = () => {
    const result = userRole === 'admin' || user?.email === 'admin@admin.com';
    console.log('🔐 [DEBUG] isAdmin check:', {
      userRole,
      email: user?.email,
      result
    });
    return result;
  };

  const signIn = async (email: string, password: string) => {
    console.log('=== SIGNIN FUNCTION START ===');
    
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
      console.log('🔐 Tentando login com email:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ Erro de login Supabase:', error);
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

      console.log('✅ Login realizado com sucesso');
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
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
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
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    } finally {
      setLoading(false);
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
      setLoading(true);
      
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
    } finally {
      setLoading(false);
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
  };

  console.log('🎯 [DEBUG] Provendo contexto:', {
    user: !!user,
    session: !!session,
    loading,
    userRole,
    timestamp: new Date().toISOString()
  });

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
  
  console.log('🔗 [DEBUG] useAuth chamado, retornando:', {
    user: !!context.user,
    session: !!context.session,
    loading: context.loading,
    userRole: context.userRole,
    timestamp: new Date().toISOString()
  });
  
  return context;
}
