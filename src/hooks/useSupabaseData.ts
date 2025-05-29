
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
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

      if (error) throw error;
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

    // Validação de campos obrigatórios
    if (!data.nome || !data.sexo || !data.area_atuacao || !data.estilo_comportamento || !data.nome_empresa) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('agentes_ai')
        .upsert({
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

      if (error) throw error;

      toast({
        title: "Agente AI salvo",
        description: "Configurações atualizadas com sucesso.",
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

  return { agentData, loading, saveAgenteAI, refetch: fetchAgenteAI };
}

export function useColaboradores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [colaboradores, setColaboradores] = useState<Tables['colaboradores']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchColaboradores();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchColaboradores = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
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

  const saveColaborador = async (data: { nome: string; produtos?: string[]; horarios?: string; ativo?: boolean }) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    if (!data.nome?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do colaborador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('colaboradores')
        .insert({
          user_id: user.id,
          nome: data.nome.trim(),
          produtos: data.produtos || [],
          horarios: data.horarios || '09:00 - 18:00',
          ativo: data.ativo ?? true,
        });

      if (error) throw error;

      toast({
        title: "Colaborador adicionado",
        description: "Novo colaborador foi adicionado com sucesso.",
      });

      fetchColaboradores();
    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      toast({
        title: "Erro ao salvar colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const updateColaborador = async (id: string, data: Partial<Tables['colaboradores']['Update']>) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('colaboradores')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id); // Segurança adicional

      if (error) throw error;

      toast({
        title: "Colaborador atualizado",
        description: "Informações atualizadas com sucesso.",
      });

      fetchColaboradores();
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error);
      toast({
        title: "Erro ao atualizar colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return { colaboradores, loading, saveColaborador, updateColaborador, refetch: fetchColaboradores };
}

export function useWhatsAppInstance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [instance, setInstance] = useState<Tables['whatsapp_instances']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInstance();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchInstance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setInstance(data);
    } catch (error: any) {
      console.error('Erro ao carregar instância WhatsApp:', error);
      toast({
        title: "Erro ao carregar instância WhatsApp",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveInstance = async (data: { nome_empresa: string; status?: Database['public']['Enums']['whatsapp_status']; qr_code?: string | null; ultima_verificacao?: string | null }) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    if (!data.nome_empresa?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome da empresa é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('whatsapp_instances')
        .upsert({
          user_id: user.id,
          nome_empresa: data.nome_empresa.trim(),
          status: data.status || 'desconectado',
          qr_code: data.qr_code || null,
          ultima_verificacao: data.ultima_verificacao || null,
        });

      if (error) throw error;

      toast({
        title: "Instância WhatsApp salva",
        description: "Configurações atualizadas com sucesso.",
      });

      fetchInstance();
    } catch (error: any) {
      console.error('Erro ao salvar instância WhatsApp:', error);
      toast({
        title: "Erro ao salvar instância WhatsApp",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return { instance, loading, saveInstance, refetch: fetchInstance };
}

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Tables['user_settings']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (data: Partial<Tables['user_settings']['Insert']>) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          webhook_url: data.webhook_url || null,
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Configurações atualizadas com sucesso.",
      });

      fetchSettings();
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return { settings, loading, saveSettings, refetch: fetchSettings };
}
