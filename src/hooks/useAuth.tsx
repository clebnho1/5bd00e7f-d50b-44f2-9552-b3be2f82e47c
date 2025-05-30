
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendWebhookSafe } from '@/utils/webhook';
import { useAuthState } from './auth/useAuthState';
import { useAuthActions } from './auth/useAuthActions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string, plano: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, setUser, setLoading } = useAuthState();
  const { signIn, signUp, signOut, resetPassword } = useAuthActions();
  
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Enviar webhook para mudanças de estado de autenticação
        if (session?.user) {
          sendWebhookSafe(session.user.id, 'auth_state_changed', {
            event,
            user_id: session.user.id,
            email: session.user.email,
            timestamp: new Date().toISOString(),
            has_session: !!session
          }, {
            action: 'auth_state_change',
            event_type: event
          }).catch(console.error);

          // Para INITIAL_SESSION, também enviar evento de sessão restaurada
          if (event === 'INITIAL_SESSION' && !isFirstLoad) {
            sendWebhookSafe(session.user.id, 'session_restored', {
              user_id: session.user.id,
              email: session.user.email,
              timestamp: new Date().toISOString(),
              session_expires: session.expires_at
            }, {
              action: 'session_restore',
              automatic: true
            }).catch(console.error);
          }
        }

        if (isFirstLoad) {
          setIsFirstLoad(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, isFirstLoad]);

  const isAdmin = () => {
    if (!user) return false;
    
    // Verificar se o usuário é admin baseado no email ou metadata
    const adminEmails = ['admin@admin.com', 'clebermosmann@gmail.com'];
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    
    return adminEmails.includes(user.email || '') || userRole === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      isAdmin,
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
