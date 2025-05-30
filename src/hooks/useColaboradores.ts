
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export function useColaboradores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [colaboradores, setColaboradores] = useState<Tables['colaboradores']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchColaboradores();
    }
  }, [user?.id]);

  const fetchColaboradores = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setColaboradores(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        title: "Erro ao carregar colaboradores",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createColaborador = async (colaboradorData: Omit<Tables['colaboradores']['Insert'], 'user_id'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .insert({ ...colaboradorData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Colaborador criado",
        description: "Colaborador criado com sucesso!",
      });

      // Enviar webhook
      sendWebhookSafe(user.id, 'colaborador_created', {
        colaborador_id: data.id,
        colaborador_name: data.nome,
        user_id: user.id,
        user_email: user.email,
        colaborador_data: data
      }, {
        action: 'create_colaborador',
        widget: 'colaboradores'
      }).catch(console.error);

      fetchColaboradores();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar colaborador:', error);
      toast({
        title: "Erro ao criar colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateColaborador = async (id: string, updates: Partial<Tables['colaboradores']['Update']>) => {
    if (!user?.id) return null;

    try {
      const oldColaborador = colaboradores.find(c => c.id === id);
      
      const { data, error } = await supabase
        .from('colaboradores')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Colaborador atualizado",
        description: "Informações atualizadas com sucesso!",
      });

      // Enviar webhook
      sendWebhookSafe(user.id, 'colaborador_updated', {
        colaborador_id: id,
        colaborador_name: data.nome,
        user_id: user.id,
        user_email: user.email,
        old_data: oldColaborador,
        new_data: data,
        changes: updates
      }, {
        action: 'update_colaborador',
        widget: 'colaboradores'
      }).catch(console.error);

      fetchColaboradores();
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error);
      toast({
        title: "Erro ao atualizar colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteColaborador = async (id: string) => {
    if (!user?.id) return false;

    try {
      const colaboradorToDelete = colaboradores.find(c => c.id === id);
      
      const { error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Colaborador removido",
        description: "Colaborador removido com sucesso!",
      });

      // Enviar webhook
      sendWebhookSafe(user.id, 'colaborador_deleted', {
        colaborador_id: id,
        colaborador_name: colaboradorToDelete?.nome,
        user_id: user.id,
        user_email: user.email,
        deleted_data: colaboradorToDelete
      }, {
        action: 'delete_colaborador',
        widget: 'colaboradores'
      }).catch(console.error);

      fetchColaboradores();
      return true;
    } catch (error: any) {
      console.error('Erro ao remover colaborador:', error);
      toast({
        title: "Erro ao remover colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleColaboradorStatus = async (id: string, currentStatus: boolean) => {
    if (!user?.id) return false;

    try {
      const colaborador = colaboradores.find(c => c.id === id);
      const newStatus = !currentStatus;
      
      const { data, error } = await supabase
        .from('colaboradores')
        .update({ ativo: newStatus })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: newStatus ? "Colaborador ativado" : "Colaborador desativado",
        description: `Colaborador ${newStatus ? 'ativado' : 'desativado'} com sucesso!`,
      });

      // Enviar webhook
      sendWebhookSafe(user.id, 'colaborador_status_changed', {
        colaborador_id: id,
        colaborador_name: colaborador?.nome,
        user_id: user.id,
        user_email: user.email,
        old_status: currentStatus,
        new_status: newStatus
      }, {
        action: 'toggle_colaborador_status',
        widget: 'colaboradores'
      }).catch(console.error);

      fetchColaboradores();
      return true;
    } catch (error: any) {
      console.error('Erro ao alterar status do colaborador:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    colaboradores,
    loading,
    createColaborador,
    updateColaborador,
    deleteColaborador,
    toggleColaboradorStatus,
    refetch: fetchColaboradores
  };
}
