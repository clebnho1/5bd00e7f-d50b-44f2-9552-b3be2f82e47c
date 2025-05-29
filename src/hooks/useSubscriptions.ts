
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

export function useSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setCurrentSubscription(data);
    } catch (error: any) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast({
        title: "Erro ao carregar dados do usuário",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (plan: string) => {
    if (!user || !currentSubscription) return;

    try {
      // Calcular data de expiração baseada no plano
      let updateData: any = { 
        plano: plan,
        updated_at: new Date().toISOString(),
        plano_active: true
      };

      if (plan === 'gratuito') {
        updateData.trial_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias
        updateData.plano_expires_at = null;
      } else {
        updateData.trial_expires_at = null;
        updateData.plano_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 dias
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentSubscription.id);

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: `Seu plano foi alterado para ${plan}`,
      });

      fetchUserSubscription();
    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "Erro ao atualizar plano",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return {
    currentSubscription,
    loading,
    updateSubscription,
    refetch: fetchUserSubscription
  };
}
