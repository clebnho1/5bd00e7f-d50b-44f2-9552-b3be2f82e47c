
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export function useAdministracao() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Tables['users']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin()) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    if (!user || !isAdmin()) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
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
  };

  const updateUser = async (userId: string, data: { name?: string; email?: string }) => {
    if (!user || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem editar usuários",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: "Informações do usuário atualizadas com sucesso.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const resetUserPassword = async (email: string) => {
    if (!user || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem resetar senhas",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset de senha enviado",
        description: "Email de reset de senha foi enviado para o usuário.",
      });
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return { users, loading, updateUser, resetUserPassword, refetch: fetchUsers };
}
