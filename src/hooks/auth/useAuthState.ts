
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { sendWebhookSafe } from '@/utils/webhook';

type UserRole = Database['public']['Enums']['user_role'];

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
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

      setUserRole(data.role);
    } catch (error) {
      console.error('💥 [ROLE_CRASH]', error);
      setUserRole('user');
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  const isAdmin = () => {
    return userRole === 'admin' || user?.email === 'admin@admin.com';
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Primeiro, configura o listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;
            
            console.log('🔄 Auth state change:', event, newSession?.user?.email);
            
            // Webhook para mudanças de estado da autenticação
            if (newSession?.user?.id) {
              await sendWebhookSafe(newSession.user.id, 'auth_state_changed', {
                event,
                user_id: newSession.user.id,
                email: newSession.user.email,
                timestamp: new Date().toISOString(),
                has_session: !!newSession
              }, {
                action: 'auth_state_change',
                event_type: event
              });
            }
            
            if (event === 'SIGNED_OUT' || !newSession) {
              setUser(null);
              setSession(null);
              setUserRole(null);
            } else if (newSession?.user) {
              setSession(newSession);
              setUser(newSession.user);
              
              // Busca o role sem aguardar para evitar deadlock
              setTimeout(() => {
                if (isMounted) {
                  fetchUserRole(newSession.user.id);
                }
              }, 0);
            }
          }
        );

        // Depois, verifica se já existe uma sessão
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (isMounted && currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Webhook para sessão existente encontrada
          await sendWebhookSafe(currentSession.user.id, 'session_restored', {
            user_id: currentSession.user.id,
            email: currentSession.user.email,
            timestamp: new Date().toISOString(),
            session_expires: currentSession.expires_at
          }, {
            action: 'session_restore',
            automatic: true
          });
          
          // Busca o role sem aguardar
          setTimeout(() => {
            if (isMounted) {
              fetchUserRole(currentSession.user.id);
            }
          }, 0);
        }

        if (isMounted) {
          setLoading(false);
        }

        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
        };

      } catch (error) {
        console.error('💥 [AUTH_INIT_ERROR]', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();

    return () => {
      isMounted = false;
      if (cleanup) {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, []);

  return {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    refreshUserRole
  };
}
