
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

export function useUsersList() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!user || !isAdmin()) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        throw error;
      }
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, toast]);

  const fixUsersWithoutExpiration = useCallback(async () => {
    if (!user || !isAdmin()) return;

    try {
      const usersToFix = users.filter(u => {
        if (u.plano === 'gratuito' && !u.trial_expires_at) return true;
        if ((u.plano === 'profissional' || u.plano === 'empresarial') && !u.plano_expires_at) return true;
        return false;
      });

      for (const userToFix of usersToFix) {
        let updateData: any = {
          updated_at: new Date().toISOString()
        };

        if (userToFix.plano === 'gratuito') {
          updateData.trial_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        } else if (userToFix.plano === 'profissional' || userToFix.plano === 'empresarial') {
          updateData.plano_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        await supabase
          .from('users')
          .update(updateData)
          .eq('id', userToFix.id);
      }

      if (usersToFix.length > 0) {
        console.log(`Fixed ${usersToFix.length} users without expiration dates`);
        fetchUsers();
      }
    } catch (error) {
      console.error('Erro ao corrigir usuários sem data de expiração:', error);
    }
  }, [users, user, isAdmin, fetchUsers]);

  useEffect(() => {
    if (!authLoading && user && isAdmin()) {
      fetchUsers();
    }
  }, [user, authLoading, isAdmin, fetchUsers]);

  useEffect(() => {
    if (users.length > 0 && user && isAdmin()) {
      fixUsersWithoutExpiration();
    }
  }, [users.length, user, isAdmin, fixUsersWithoutExpiration]);

  return { 
    users, 
    loading, 
    refetch: fetchUsers 
  };
}
