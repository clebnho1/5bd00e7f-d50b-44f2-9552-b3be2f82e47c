
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];

export function useUserManagement() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const updateUser = useCallback(async (userId: string, data: { name?: string; email?: string }) => {
    if (!user || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem editar usuários",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

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
        target_user_email: userData?.email,
        changes: data,
        admin_user_id: user.id,
        admin_user_email: user.email
      }, {
        action: 'user_update',
        previous_data: {
          name: userData?.name,
          email: userData?.email
        },
        admin_action: true
      }).catch(console.error);

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  }, [user, isAdmin, toast]);

  const toggleUserStatus = useCallback(async (userId: string, currentStatus: boolean) => {
    if (!user || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem ativar/desativar usuários",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

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
        target_user_email: userData?.email,
        new_status: newStatus,
        admin_user_id: user.id,
        admin_user_email: user.email
      }, {
        action: 'user_status_change',
        admin_action: true
      }).catch(console.error);

      return true;
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  }, [user, isAdmin, toast]);

  return {
    updateUser,
    toggleUserStatus
  };
}
