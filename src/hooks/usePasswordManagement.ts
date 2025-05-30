
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';

export function usePasswordManagement() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const resetUserPassword = useCallback(async (email: string) => {
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
  }, [user, isAdmin, toast]);

  const generateTemporaryPassword = useCallback(async (userId: string, email: string) => {
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
  }, [user, isAdmin, toast]);

  return {
    resetUserPassword,
    generateTemporaryPassword
  };
}
