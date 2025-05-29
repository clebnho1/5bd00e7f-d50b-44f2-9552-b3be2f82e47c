
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export function useSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSubscriptions(data || []);
      setCurrentSubscription(data?.[0] || null);
    } catch (error: any) {
      console.error('Erro ao carregar assinaturas:', error);
      toast({
        title: "Erro ao carregar assinaturas",
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
      const { error } = await supabase
        .from('subscriptions')
        .update({ plan, updated_at: new Date().toISOString() })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: `Seu plano foi alterado para ${plan}`,
      });

      fetchSubscriptions();
    } catch (error: any) {
      console.error('Erro ao atualizar assinatura:', error);
      toast({
        title: "Erro ao atualizar plano",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return {
    subscriptions,
    currentSubscription,
    loading,
    updateSubscription,
    refetch: fetchSubscriptions
  };
}
