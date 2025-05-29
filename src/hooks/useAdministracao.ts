
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export function useAdministracao() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Tables['users']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && isAdmin()) {
      fetchUsers();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchUsers = async () => {
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
      // Buscar dados antigos para o webhook
      const userToUpdate = users.find(u => u.id === userId);

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: "Informações do usuário atualizadas com sucesso.",
      });

      // Enviar webhook
      await sendWebhookSafe(user.id, 'admin_user_updated', {
        target_user_id: userId,
        target_user_email: userToUpdate?.email,
        changes: data,
        admin_user_id: user.id,
        admin_user_email: user.email
      }, {
        action: 'user_update',
        previous_data: {
          name: userToUpdate?.name,
          email: userToUpdate?.email
        },
        admin_action: true
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

      // Enviar webhook
      await sendWebhookSafe(user.id, 'admin_password_reset', {
        target_user_email: email,
        admin_user_id: user.id,
        admin_user_email: user.email,
        reset_link_sent: true
      }, {
        action: 'password_reset',
        admin_action: true,
        redirect_url: `${window.location.origin}/reset-password`
      });

    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });

      // Enviar webhook para erro
      await sendWebhookSafe(user.id, 'admin_password_reset_error', {
        target_user_email: email,
        admin_user_id: user.id,
        admin_user_email: user.email,
        error: error.message
      }, {
        action: 'password_reset_failed',
        admin_action: true
      });
    }
  };

  return { 
    users, 
    loading: loading || authLoading, 
    updateUser, 
    resetUserPassword, 
    refetch: fetchUsers 
  };
}
