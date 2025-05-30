
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string, plano: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: () => boolean;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache para dados do usuário para evitar consultas desnecessárias
const userCache = new Map<string, { role: UserRole; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Função para buscar role do usuário com cache
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      // Verificar cache primeiro
      const cached = userCache.get(userId);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setUserRole(cached.role);
        return;
      }

      console.log('🔍 Buscando role do usuário:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ [ROLE_ERROR]', error);
        setUserRole('user');
        return;
      }

      const role = data?.role || 'user';
      setUserRole(role);
      
      // Atualizar cache
      userCache.set(userId, { role, timestamp: now });
      
    } catch (error) {
      console.error('💥 [ROLE_CRASH]', error);
      setUserRole('user');
    }
  }, []);

  const refreshUserRole = useCallback(async () => {
    if (user) {
      // Invalidar cache e buscar novamente
      userCache.delete(user.id);
      await fetchUserRole(user.id);
    }
  }, [user, fetchUserRole]);

  const isAdmin = useCallback(() => {
    return userRole === 'admin' || user?.email === 'admin@admin.com';
  }, [userRole, user?.email]);

  // Funções de autenticação
  const signIn = useCallback(async (email: string, password: string): Promise<User> => {
    console.log('🔐 [AUTH] Tentando fazer login:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      console.error('❌ [AUTH] Erro no login:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Usuário não encontrado');
    }

    console.log('✅ [AUTH] Login bem-sucedido:', data.user.email);
    return data.user;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, plano: string): Promise<User> => {
    console.log('📝 [AUTH] Tentando criar conta:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          plano
        }
      }
    });

    if (error) {
      console.error('❌ [AUTH] Erro no cadastro:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Erro ao criar usuário');
    }

    console.log('✅ [AUTH] Cadastro bem-sucedido:', data.user.email);
    return data.user;
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    console.log('🚪 [AUTH] Fazendo logout');
    
    // Limpar cache local
    if (user) {
      userCache.delete(user.id);
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ [AUTH] Erro no logout:', error);
      throw error;
    }

    console.log('✅ [AUTH] Logout bem-sucedido');
  }, [user]);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    console.log('🔄 [AUTH] Enviando reset de senha:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    
    if (error) {
      console.error('❌ [AUTH] Erro no reset:', error);
      throw error;
    }

    console.log('✅ [AUTH] Email de reset enviado');
  }, []);

  // Inicialização da autenticação
  useEffect(() => {
    let isMounted = true;
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🔄 [AUTH_CONTEXT] Inicializando autenticação...');
        
        // Configurar listener primeiro
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;
            
            console.log('🔄 [AUTH_CONTEXT] Estado mudou:', event, newSession?.user?.email);
            
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (event === 'SIGNED_OUT' || !newSession?.user) {
              setUserRole(null);
              if (newSession?.user) {
                userCache.delete(newSession.user.id);
              }
            } else if (newSession?.user) {
              // Buscar role em background (não bloquear)
              setTimeout(() => {
                fetchUserRole(newSession.user.id);
              }, 0);
            }
          }
        );
        
        authSubscription = subscription;

        // Verificar sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AUTH_CONTEXT] Erro ao buscar sessão:', error);
        } else if (isMounted && currentSession?.user) {
          console.log('✅ [AUTH_CONTEXT] Sessão existente:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Buscar role em background
          setTimeout(() => {
            fetchUserRole(currentSession.user.id);
          }, 0);
        }

      } catch (error) {
        console.error('💥 [AUTH_CONTEXT] Erro na inicialização:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchUserRole]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userRole,
      signIn,
      signUp,
      signOut,
      resetPassword,
      isAdmin,
      refreshUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
