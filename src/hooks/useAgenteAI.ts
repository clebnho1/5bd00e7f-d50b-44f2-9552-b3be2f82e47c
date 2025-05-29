
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export function useAgenteAI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agentData, setAgentData] = useState<Tables['agentes_ai']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAgenteAI();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAgenteAI = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('agentes_ai')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setAgentData(data);
    } catch (error: any) {
      console.error('Erro ao carregar agente AI:', error);
      toast({
        title: "Erro ao carregar agente AI",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAgenteAI = async (data: Partial<Tables['agentes_ai']['Insert']>) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    if (!data.nome || !data.sexo || !data.area_atuacao || !data.estilo_comportamento || !data.nome_empresa) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Verificar se é criação ou atualização
      const isUpdate = !!agentData;
      
      // Primeiro verifica se já existe um agente para este usuário
      const { data: existingAgent } = await supabase
        .from('agentes_ai')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      
      if (existingAgent) {
        // Se existe, faz UPDATE
        result = await supabase
          .from('agentes_ai')
          .update({
            nome: data.nome,
            sexo: data.sexo,
            area_atuacao: data.area_atuacao,
            estilo_comportamento: data.estilo_comportamento,
            usar_emotion: data.usar_emotion ?? true,
            nome_empresa: data.nome_empresa,
            telefone_empresa: data.telefone_empresa || null,
            email_empresa: data.email_empresa || null,
            website_empresa: data.website_empresa || null,
            endereco_empresa: data.endereco_empresa || null,
            funcoes: data.funcoes || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Se não existe, faz INSERT
        result = await supabase
          .from('agentes_ai')
          .insert({
            user_id: user.id,
            nome: data.nome,
            sexo: data.sexo,
            area_atuacao: data.area_atuacao,
            estilo_comportamento: data.estilo_comportamento,
            usar_emotion: data.usar_emotion ?? true,
            nome_empresa: data.nome_empresa,
            telefone_empresa: data.telefone_empresa || null,
            email_empresa: data.email_empresa || null,
            website_empresa: data.website_empresa || null,
            endereco_empresa: data.endereco_empresa || null,
            funcoes: data.funcoes || null,
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Agente AI salvo",
        description: "Configurações atualizadas com sucesso.",
      });

      // Enviar webhook
      await sendWebhookSafe(user.id, isUpdate ? 'agente_ai_updated' : 'agente_ai_created', {
        nome: data.nome,
        sexo: data.sexo,
        area_atuacao: data.area_atuacao,
        estilo_comportamento: data.estilo_comportamento,
        nome_empresa: data.nome_empresa,
        usar_emotion: data.usar_emotion ?? true,
        telefone_empresa: data.telefone_empresa,
        email_empresa: data.email_empresa,
        website_empresa: data.website_empresa,
        endereco_empresa: data.endereco_empresa,
        funcoes: data.funcoes
      }, {
        action: isUpdate ? 'update' : 'create',
        previous_data: isUpdate ? agentData : null
      });

      fetchAgenteAI();
    } catch (error: any) {
      console.error('Erro ao salvar agente AI:', error);
      toast({
        title: "Erro ao salvar agente AI",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return { 
    agentData, 
    loading, 
    saveAgenteAI, 
    refetch: fetchAgenteAI 
  };
}
