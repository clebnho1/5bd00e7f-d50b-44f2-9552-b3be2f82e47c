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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAdmin()) {
      fetchUsers();
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

      sendWebhookSafe(user.id, 'admin_user_updated', {
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
      }).catch(console.error);

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

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!user || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem ativar/desativar usuários",
        variant: "destructive",
      });
      return;
    }

    try {
      const userToUpdate = users.find(u => u.id === userId);
      const newStatus = !currentStatus;

      const { error } = await supabase
        .from('users')
        .update({ 
          active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: newStatus ? "Usuário ativado" : "Usuário desativado",
        description: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });

      sendWebhookSafe(user.id, 'admin_user_status_changed', {
        target_user_id: userId,
        target_user_email: userToUpdate?.email,
        new_status: newStatus,
        admin_user_id: user.id,
        admin_user_email: user.email
      }, {
        action: 'user_status_change',
        admin_action: true
      }).catch(console.error);

      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const updateUserPlan = async (userId: string, plano: string, expirationDate?: string) => {
    if (!user || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem alterar planos",
        variant: "destructive",
      });
      return;
    }

    try {
      const userToUpdate = users.find(u => u.id === userId);
      
      let updateData: any = { 
        plano,
        plano_active: true,
        updated_at: new Date().toISOString()
      };

      if (plano === 'gratuito') {
        // Plano gratuito: 7 dias de trial
        updateData.trial_expires_at = expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        updateData.plano_expires_at = null;
      } else if (plano === 'profissional' || plano === 'empresarial') {
        // Planos pagos: 30 dias
        updateData.plano_expires_at = expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        updateData.trial_expires_at = null;
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: `Plano do usuário alterado para ${plano}`,
      });

      sendWebhookSafe(user.id, 'admin_plan_updated', {
        target_user_id: userId,
        target_user_email: userToUpdate?.email,
        old_plan: userToUpdate?.plano,
        new_plan: plano,
        expiration_date: updateData.plano_expires_at || updateData.trial_expires_at,
        admin_user_id: user.id,
        admin_user_email: user.email
      }, {
        action: 'plan_update',
        admin_action: true
      }).catch(console.error);

      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "Erro ao atualizar plano",
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

      sendWebhookSafe(user.id, 'admin_password_reset', {
        target_user_email: email,
        admin_user_id: user.id,
        admin_user_email: user.email,
        reset_link_sent: true
      }, {
        action: 'password_reset',
        admin_action: true,
        redirect_url: `${window.location.origin}/reset-password`
      }).catch(console.error);

    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });

      sendWebhookSafe(user.id, 'admin_password_reset_error', {
        target_user_email: email,
        admin_user_id: user.id,
        admin_user_email: user.email,
        error: error.message
      }, {
        action: 'password_reset_failed',
        admin_action: true
      }).catch(console.error);
    }
  };

  const generateTemporaryPassword = async (userId: string, email: string) => {
    if (!user || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem gerar senhas temporárias",
        variant: "destructive",
      });
      return null;
    }

    try {
      const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: tempPassword
      });

      if (error) throw error;

      toast({
        title: "Senha temporária gerada",
        description: "Nova senha temporária foi definida para o usuário.",
      });

      sendWebhookSafe(user.id, 'admin_temp_password_generated', {
        target_user_id: userId,
        target_user_email: email,
        admin_user_id: user.id,
        admin_user_email: user.email,
        temp_password_generated: true
      }, {
        action: 'temp_password_generated',
        admin_action: true
      }).catch(console.error);

      return tempPassword;
    } catch (error: any) {
      console.error('Erro ao gerar senha temporária:', error);
      toast({
        title: "Erro ao gerar senha",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    }
  };

  return { 
    users, 
    loading, 
    updateUser, 
    updateUserPlan,
    toggleUserStatus,
    resetUserPassword,
    generateTemporaryPassword,
    refetch: fetchUsers 
  };
}
