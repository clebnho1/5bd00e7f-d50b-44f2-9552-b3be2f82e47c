import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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

  const createWhatsAppInstanceForCompany = async (nomeEmpresa: string) => {
    try {
      // Verificar se já existe uma instância para este usuário
      const { data: existingInstance } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (existingInstance) {
        // Se existe, atualizar o nome da empresa
        const { error } = await supabase
          .from('whatsapp_instances')
          .update({
            nome_empresa: nomeEmpresa,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user!.id);

        if (error) throw error;

        toast({
          title: "Instância WhatsApp atualizada",
          description: `Nome da empresa atualizado para: ${nomeEmpresa}`,
        });
      } else {
        // Criar nova instância
        const { error } = await supabase
          .from('whatsapp_instances')
          .insert({
            user_id: user!.id,
            nome_empresa: nomeEmpresa,
            status: 'desconectado'
          });

        if (error) throw error;

        toast({
          title: "Instância WhatsApp criada",
          description: `Instância criada automaticamente para: ${nomeEmpresa}`,
        });
      }
    } catch (error: any) {
      console.error('Erro ao criar/atualizar instância WhatsApp:', error);
      toast({
        title: "Erro na instância WhatsApp",
        description: "Não foi possível criar/atualizar a instância automaticamente.",
        variant: "destructive",
      });
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

      // Criar/atualizar instância WhatsApp automaticamente
      if (data.nome_empresa) {
        await createWhatsAppInstanceForCompany(data.nome_empresa);
      }

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
  const [instance, setInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔧 [useWhatsAppInstance] Hook inicializado', { user: !!user });

  useEffect(() => {
    console.log('🔧 [useWhatsAppInstance] useEffect executado', { user: !!user });
    
    if (user) {
      fetchInstance();
    } else {
      console.log('🔧 [useWhatsAppInstance] Sem usuário, definindo loading=false');
      setLoading(false);
    }
  }, [user]);

  const fetchInstance = async () => {
    if (!user) {
      console.log('🔧 [fetchInstance] Sem usuário, saindo');
      setLoading(false);
      return;
    }

    console.log('🔧 [fetchInstance] Iniciando busca da instância');

    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      console.log('🔧 [fetchInstance] Instância encontrada:', !!data);
      setInstance(data);
    } catch (error) {
      console.error('🔧 [fetchInstance] Erro:', error);
    } finally {
      console.log('🔧 [fetchInstance] Definindo loading=false');
      setLoading(false);
    }
  };

  const createWhatsAppInstance = async (instanceName: string) => {
    try {
      console.log('Creating WhatsApp instance with name:', instanceName);
      
      // Usar o endpoint correto da Evolution API
      const response = await fetch(`https://apiwhats.lifecombr.com.br/instance/connect/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0417bf43b0a8669bd6635bcb49d783df'
        }
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const apiData = await response.json();
      console.log('API Response data:', apiData);

      // Retornar os dados da API real
      return {
        qr_code: apiData.qrCode || apiData.qr_code || null,
        status: 'conectando',
        api_response: apiData
      };
    } catch (error) {
      console.error('Error creating WhatsApp instance:', error);
      
      toast({
        title: "Erro ao criar instância",
        description: `Falha na conexão com a Evolution API: ${error.message}`,
        variant: "destructive",
      });

      throw error; // Re-throw para que o chamador possa tratar
    }
  };

  const disconnectInstance = async () => {
    if (!instance || !user) return;

    try {
      console.log('Disconnecting instance:', instance.nome_empresa);

      // Tentar desconectar via API da Evolution
      const response = await fetch(`https://apiwhats.lifecombr.com.br/instance/disconnect/${instance.nome_empresa}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0417bf43b0a8669bd6635bcb49d783df'
        }
      });

      // Mesmo se a API falhar, atualizar o status local
      const { error } = await supabase
        .from('whatsapp_instances')
        .update({
          status: 'desconectado',
          qr_code: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "WhatsApp desconectado",
        description: "A instância foi desconectada com sucesso.",
      });

      fetchInstance(); // Recarregar dados
    } catch (error) {
      console.error('Error disconnecting instance:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar a instância.",
        variant: "destructive",
      });
    }
  };

  const saveInstance = async (instanceData: any) => {
    if (!user) return;

    try {
      setLoading(true);

      // Se está criando uma nova instância, usar a API externa
      if (!instance) {
        try {
          // Criar instância na API externa
          const apiResult = await createWhatsAppInstance(instanceData.nome_empresa);
          instanceData = { ...instanceData, ...apiResult };
        } catch (apiError) {
          // Se a API falhar, não salvar no banco
          return;
        }
      }

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .upsert({
          user_id: user.id,
          ...instanceData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setInstance(data);
      
      toast({
        title: "Instância WhatsApp criada",
        description: "A integração foi configurada com sucesso.",
      });
    } catch (error) {
      console.error('Error saving instance:', error);
      toast({
        title: "Erro ao salvar instância",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('🔧 [useWhatsAppInstance] Estado atual:', { 
    hasInstance: !!instance, 
    loading
  });

  return {
    instance,
    loading,
    saveInstance,
    disconnectInstance
  };
}

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
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

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSettings({ ...settings, ...newSettings });
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async (webhookUrl: string) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Teste de conectividade do webhook'
        })
      });

      if (response.ok) {
        toast({
          title: "Webhook Online",
          description: "O endpoint está respondendo corretamente.",
        });
        return true;
      } else {
        toast({
          title: "Webhook Offline",
          description: `Erro ${response.status}: ${response.statusText}`,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Webhook Offline",
        description: "Não foi possível conectar ao endpoint.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    testWebhook
  };
}
