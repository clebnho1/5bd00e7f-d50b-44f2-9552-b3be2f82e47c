
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
  const [webhookSent, setWebhookSent] = useState(false);

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
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🔄 [AUTH_INIT] Inicializando autenticação...');
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AUTH_SESSION_ERROR]', error);
          setLoading(false);
          return;
        }
        
        if (isMounted && currentSession?.user) {
          console.log('✅ [AUTH_INIT] Sessão existente encontrada:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          fetchUserRole(currentSession.user.id);
          
          // Enviar webhook apenas uma vez por sessão
          if (!webhookSent) {
            setWebhookSent(true);
            sendWebhookSafe(currentSession.user.id, 'session_restored', {
              user_id: currentSession.user.id,
              email: currentSession.user.email,
              timestamp: new Date().toISOString(),
              session_expires: currentSession.expires_at
            }, {
              action: 'session_restore',
              automatic: true
            }).catch(console.error);
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;
            
            console.log('🔄 Auth state change:', event, newSession?.user?.email);
            
            if (event === 'SIGNED_OUT' || !newSession) {
              setUser(null);
              setSession(null);
              setUserRole(null);
              setWebhookSent(false);
            } else if (newSession?.user) {
              setSession(newSession);
              setUser(newSession.user);
              
              fetchUserRole(newSession.user.id);
              
              // Enviar webhook apenas para eventos específicos
              if (event === 'SIGNED_IN' && !webhookSent) {
                setWebhookSent(true);
                sendWebhookSafe(newSession.user.id, 'auth_state_changed', {
                  event,
                  user_id: newSession.user.id,
                  email: newSession.user.email,
                  timestamp: new Date().toISOString(),
                  has_session: !!newSession
                }, {
                  action: 'auth_state_change',
                  event_type: event
                }).catch(console.error);
              }
            }
          }
        );
        
        authSubscription = subscription;

        if (isMounted) {
          setLoading(false);
        }

      } catch (error) {
        console.error('💥 [AUTH_INIT_ERROR]', error);
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
  }, [webhookSent]);

  return {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    refreshUserRole
  };
}
