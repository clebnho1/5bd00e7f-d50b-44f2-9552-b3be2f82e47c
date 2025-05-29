
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
    }
  }, [user]);

  const fetchAgenteAI = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agentes_ai')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAgentData(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agente AI",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAgenteAI = async (data: Partial<Tables['agentes_ai']['Insert']>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('agentes_ai')
        .upsert({
          user_id: user.id,
          ...data,
        });

      if (error) throw error;

      toast({
        title: "Agente AI salvo",
        description: "Configurações atualizadas com sucesso.",
      });

      fetchAgenteAI();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar agente AI",
        description: error.message,
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
    }
  }, [user]);

  const fetchColaboradores = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setColaboradores(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar colaboradores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveColaborador = async (data: { nome: string; produtos?: string[]; horarios?: string; ativo?: boolean }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('colaboradores')
        .insert({
          user_id: user.id,
          nome: data.nome,
          produtos: data.produtos || [],
          horarios: data.horarios || null,
          ativo: data.ativo ?? true,
        });

      if (error) throw error;

      toast({
        title: "Colaborador adicionado",
        description: "Novo colaborador foi adicionado com sucesso.",
      });

      fetchColaboradores();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar colaborador",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateColaborador = async (id: string, data: Partial<Tables['colaboradores']['Update']>) => {
    try {
      const { error } = await supabase
        .from('colaboradores')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Colaborador atualizado",
        description: "Informações atualizadas com sucesso.",
      });

      fetchColaboradores();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar colaborador",
        description: error.message,
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
    }
  }, [user]);

  const fetchInstance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setInstance(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar instância WhatsApp",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveInstance = async (data: { nome_empresa: string; status?: Database['public']['Enums']['whatsapp_status']; qr_code?: string | null; ultima_verificacao?: string | null }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('whatsapp_instances')
        .upsert({
          user_id: user.id,
          nome_empresa: data.nome_empresa,
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
      toast({
        title: "Erro ao salvar instância WhatsApp",
        description: error.message,
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
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (data: Partial<Tables['user_settings']['Insert']>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...data,
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Configurações atualizadas com sucesso.",
      });

      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { settings, loading, saveSettings, refetch: fetchSettings };
}
