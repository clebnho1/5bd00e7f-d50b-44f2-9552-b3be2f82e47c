
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
    let mounted = true;
    let authSubscription: any;

    const initAuth = async () => {
      try {
        // Pega a sessão atual primeiro
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted && currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchUserRole(currentSession.user.id);
        }

        // Configura o listener de mudanças
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;
            
            if (event === 'SIGNED_OUT' || !newSession) {
              setUser(null);
              setSession(null);
              setUserRole(null);
            } else if (newSession.user) {
              setSession(newSession);
              setUser(newSession.user);
              await fetchUserRole(newSession.user.id);
            }
          }
        );

        if (mounted) {
          setLoading(false);
        }

      } catch (error) {
        console.error('💥 [AUTH_INIT_ERROR]', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
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
