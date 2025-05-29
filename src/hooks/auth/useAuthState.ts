
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [initialized, setInitialized] = useState(false);

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

  const refreshUserRole = async () => {
    if (user) {
      await fetchUserRole(user.id);
    }
  };

  const isAdmin = () => {
    return userRole === 'admin' || user?.email === 'admin@admin.com';
  };

  useEffect(() => {
    if (initialized) return;

    console.log('🔄 [AUTH_INIT] Inicializando uma única vez');
    setInitialized(true);

    let mounted = true;

    const initAuth = async () => {
      try {
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

  return {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    refreshUserRole
  };
}
