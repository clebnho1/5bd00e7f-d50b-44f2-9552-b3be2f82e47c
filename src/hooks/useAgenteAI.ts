
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type AgenteAI = Tables['agentes_ai']['Row'];

export function useAgenteAI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agente, setAgente] = useState<AgenteAI | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgente = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('agentes_ai')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setAgente(data);
    } catch (error: any) {
      console.error('Erro ao carregar agente:', error);
      toast({
        title: "Erro ao carregar agente",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (user?.id) {
      fetchAgente();
    }
  }, [user?.id, fetchAgente]);

  const saveAgente = useCallback(async (agenteData: Omit<Tables['agentes_ai']['Insert'], 'user_id'>) => {
    if (!user?.id) return null;

    try {
      const isUpdate = agente !== null;
      let result;

      if (isUpdate) {
        const { data, error } = await supabase
          .from('agentes_ai')
          .update(agenteData)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: "Agente atualizado",
          description: "Configurações do agente atualizadas com sucesso!",
        });

        // Enviar webhook para atualização
        sendWebhookSafe(user.id, 'agente_ai_updated', {
          agente_id: data.id,
          user_id: user.id,
          user_email: user.email,
          old_data: agente,
          new_data: data,
          changes: agenteData
        }, {
          action: 'update_agente_ai',
          widget: 'agente_ai'
        }).catch(console.error);

      } else {
        const { data, error } = await supabase
          .from('agentes_ai')
          .insert({ ...agenteData, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast({
          title: "Agente criado",
          description: "Agente AI criado com sucesso!",
        });

        // Enviar webhook para criação
        sendWebhookSafe(user.id, 'agente_ai_created', {
          agente_id: data.id,
          user_id: user.id,
          user_email: user.email,
          agente_data: data
        }, {
          action: 'create_agente_ai',
          widget: 'agente_ai'
        }).catch(console.error);
      }

      setAgente(result);
      return result;
    } catch (error: any) {
      console.error('Erro ao salvar agente:', error);
      toast({
        title: "Erro ao salvar agente",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    }
  }, [user, agente, toast]);

  const deleteAgente = useCallback(async () => {
    if (!user?.id || !agente) return false;

    try {
      const { error } = await supabase
        .from('agentes_ai')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Agente removido",
        description: "Agente AI removido com sucesso!",
      });

      // Enviar webhook para exclusão
      sendWebhookSafe(user.id, 'agente_ai_deleted', {
        agente_id: agente.id,
        user_id: user.id,
        user_email: user.email,
        deleted_data: agente
      }, {
        action: 'delete_agente_ai',
        widget: 'agente_ai'
      }).catch(console.error);

      setAgente(null);
      return true;
    } catch (error: any) {
      console.error('Erro ao remover agente:', error);
      toast({
        title: "Erro ao remover agente",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  }, [user, agente, toast]);

  return {
    agente,
    loading,
    saveAgente,
    deleteAgente,
    refetch: fetchAgente
  };
}
