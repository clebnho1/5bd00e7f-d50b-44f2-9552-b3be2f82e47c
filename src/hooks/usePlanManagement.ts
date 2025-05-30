
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';

export function usePlanManagement() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const updateUserPlan = useCallback(async (userId: string, plano: string, expirationDate?: string) => {
    if (!user || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem alterar planos",
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
      
      let updateData: any = { 
        plano,
        plano_active: true,
        updated_at: new Date().toISOString()
      };

      if (plano === 'gratuito') {
        updateData.trial_expires_at = expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        updateData.plano_expires_at = null;
      } else if (plano === 'profissional' || plano === 'empresarial') {
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
        target_user_email: userData?.email,
        old_plan: userData?.plano,
        new_plan: plano,
        expiration_date: updateData.plano_expires_at || updateData.trial_expires_at,
        admin_user_id: user.id,
        admin_user_email: user.email
      }, {
        action: 'plan_update',
        admin_action: true
      }).catch(console.error);

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "Erro ao atualizar plano",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  }, [user, isAdmin, toast]);

  return {
    updateUserPlan
  };
}
