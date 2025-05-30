
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type WhatsAppInstance = Tables['whatsapp_instances']['Row'];

const EVOLUTION_API_BASE_URL = 'https://apiwhats.lifecombr.com.br';
const EVOLUTION_API_KEY = '0417bf43b0a8669bd6635bcb49d783df';

// Utility function para fazer requests com retry otimizado
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 Tentativa ${i + 1} para: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': EVOLUTION_API_KEY,
          'X-Requested-With': 'XMLHttpRequest',
          ...options.headers,
        },
        signal: AbortSignal.timeout(30000) // 30s timeout
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Sucesso na tentativa ${i + 1}:`, data);
      return { response, data };
    } catch (error: any) {
      console.warn(`❌ Falha na tentativa ${i + 1}:`, error.message);
      
      if (i === maxRetries - 1) {
        throw new Error(`Falha após ${maxRetries} tentativas: ${error.message}`);
      }
      
      // Progressive backoff
      await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
    }
  }
};

export function useWhatsAppAPI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchInstance();
    }
  }, [user?.id]);

  const fetchInstance = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('📊 Carregando instância do usuário...');
      
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      console.log('📊 Instância carregada:', data);
      setInstance(data);

      // Se existe instância, verificar status na Evolution API
      if (data?.id) {
        await checkInstanceStatusInEvolution(data.id);
      }
    } catch (error: any) {
      console.error('Erro ao carregar instância WhatsApp:', error);
      toast({
        title: "Erro ao carregar WhatsApp",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkInstanceStatusInEvolution = async (instanceId: string) => {
    try {
      console.log('📡 Verificando status na Evolution API para:', instanceId);
      
      const { data } = await fetchWithRetry(
        `${EVOLUTION_API_BASE_URL}/instance/connectionState/${instanceId}`,
        {
          method: 'GET',
        },
        2
      );

      console.log('📡 Status da Evolution API:', data);
      
      // Mapear status da Evolution para nosso sistema
      let status: string = 'desconectado';
      if (data.instance?.state === 'open') {
        status = 'conectado';
      } else if (data.instance?.state === 'connecting') {
        status = 'conectando';
      }

      // Atualizar status no banco se diferente
      if (instance && instance.status !== status) {
        await updateInstanceStatus(status as any);
      }
    } catch (error) {
      console.error('Erro ao verificar status na Evolution API (continuando):', error);
    }
  };

  const createInstance = async (nomeCliente: string) => {
    if (!user?.id) return null;
    if (!nomeCliente.trim()) return null;

    console.log('🏗️ Iniciando criação da instância para:', nomeCliente.trim());

    try {
      setConnecting(true);
      
      // ETAPA 1: Criar no banco de dados primeiro
      const { data: dbInstance, error: dbError } = await supabase
        .from('whatsapp_instances')
        .upsert({
          user_id: user.id,
          nome_empresa: nomeCliente.trim(),
          status: 'desconectado'
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      console.log('✅ Instância criada no banco:', dbInstance);
      setInstance(dbInstance);

      // ETAPA 2: Criar na Evolution API
      try {
        console.log('🔗 Criando instância na Evolution API...');
        
        const { data: evolutionData } = await fetchWithRetry(
          `${EVOLUTION_API_BASE_URL}/instance/create`,
          {
            method: 'POST',
            body: JSON.stringify({
              instanceName: dbInstance.id,
              token: EVOLUTION_API_KEY,
              qrcode: true,
              integration: 'WHATSAPP-BAILEYS'
            }),
          }
        );

        console.log('✅ Instância criada na Evolution API:', evolutionData);

        toast({
          title: "Instância criada com sucesso!",
          description: `Instância WhatsApp criada para "${nomeCliente.trim()}"`,
        });

        // Enviar webhook
        sendWebhookSafe(user.id, 'whatsapp_instance_created', {
          instance_id: dbInstance.id,
          nome_empresa: nomeCliente.trim(),
          user_id: user.id,
          user_email: user.email,
          status: 'desconectado',
          evolution_data: evolutionData
        }, {
          action: 'create_whatsapp_instance',
          widget: 'whatsapp'
        }).catch(console.error);

        return dbInstance;
      } catch (apiError: any) {
        console.error('Erro na Evolution API, mas instância criada no banco:', apiError);
        toast({
          title: "Instância criada localmente",
          description: `Instância salva. Tentaremos conectar com a Evolution API quando disponível.`,
          variant: "default",
        });
        return dbInstance;
      }
    } catch (error: any) {
      console.error('Erro ao criar instância:', error);
      toast({
        title: "Erro ao criar instância",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    } finally {
      setConnecting(false);
    }
  };

  const connectWhatsApp = async () => {
    if (!instance) return false;

    try {
      setConnecting(true);
      console.log('📱 Iniciando conexão WhatsApp para:', instance.nome_empresa);
      
      // ETAPA 1: Atualizar status para "conectando"
      await updateInstanceStatus('conectando');
      
      // ETAPA 2: Solicitar conexão na Evolution API
      console.log('🔗 Conectando via Evolution API...');
      
      const { data: connectionData } = await fetchWithRetry(
        `${EVOLUTION_API_BASE_URL}/instance/connect/${instance.id}`,
        {
          method: 'GET',
        }
      );

      console.log('🔄 Dados de conexão recebidos:', connectionData);
      
      // ETAPA 3: Se há QR Code, atualizar
      if (connectionData.qrcode || connectionData.base64) {
        const qrCodeData = connectionData.qrcode || connectionData.base64;
        await updateInstanceStatus('conectando', qrCodeData);
        console.log('✅ QR Code gerado! Aguardando scan...');
        
        // ETAPA 4: Monitorar status automaticamente
        const monitorConnection = async () => {
          let attempts = 0;
          const maxAttempts = 30; // 1.5 minutos
          
          const checkStatus = async () => {
            try {
              const { data: statusData } = await fetchWithRetry(
                `${EVOLUTION_API_BASE_URL}/instance/connectionState/${instance.id}`,
                {
                  method: 'GET',
                },
                1
              );

              console.log('🔍 Status atual:', statusData.instance?.state);
              
              if (statusData.instance?.state === 'open') {
                await updateInstanceStatus('conectado');
                console.log('🎉 WhatsApp conectado com sucesso!');
                return true;
              }
              
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(checkStatus, 3000);
              } else {
                console.log('⏰ Timeout aguardando conexão');
                await updateInstanceStatus('desconectado');
              }
              
              return false;
            } catch (error) {
              console.error('Erro ao verificar status:', error);
              attempts++;
              if (attempts < maxAttempts) {
                setTimeout(checkStatus, 5000);
              }
              return false;
            }
          };
          
          setTimeout(checkStatus, 2000);
        };
        
        monitorConnection();
      }
      
      return true;
    } catch (error: any) {
      console.error('Erro ao conectar WhatsApp:', error);
      await updateInstanceStatus('erro');
      toast({
        title: "Erro ao conectar",
        description: `Falha na conexão: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const updateInstanceStatus = async (status: 'conectado' | 'desconectado' | 'erro' | 'conectando', qrCode?: string) => {
    if (!user?.id || !instance) return null;

    try {
      const oldStatus = instance.status;
      
      const updateData: any = { 
        status,
        ultima_verificacao: new Date().toISOString()
      };

      if (qrCode !== undefined) {
        updateData.qr_code = qrCode;
      }

      console.log('🔄 Atualizando status de', oldStatus, 'para:', status);

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .update(updateData)
        .eq('id', instance.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Status atualizado para:', status);

      // Toast apenas para conexão bem-sucedida
      if (status === 'conectado') {
        toast({
          title: "🎉 WhatsApp Conectado!",
          description: "Seu WhatsApp foi conectado com sucesso!",
        });
      }

      // Enviar webhook
      sendWebhookSafe(user.id, 'whatsapp_status_changed', {
        instance_id: instance.id,
        nome_empresa: instance.nome_empresa,
        user_id: user.id,
        user_email: user.email,
        old_status: oldStatus,
        new_status: status,
        qr_code_updated: qrCode !== undefined
      }, {
        action: 'whatsapp_status_change',
        widget: 'whatsapp'
      }).catch(console.error);

      setInstance(data);
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    }
  };

  const disconnectWhatsApp = async () => {
    if (!instance) return false;

    try {
      console.log('🔌 Desconectando WhatsApp...');
      
      try {
        await fetchWithRetry(
          `${EVOLUTION_API_BASE_URL}/instance/logout/${instance.id}`,
          {
            method: 'DELETE',
          }
        );
        console.log('✅ Desconectado da Evolution API');
      } catch (error) {
        console.warn('Erro ao desconectar da Evolution API (continuando):', error);
      }

      await updateInstanceStatus('desconectado');
      
      toast({
        title: "WhatsApp desconectado",
        description: "WhatsApp foi desconectado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      await updateInstanceStatus('desconectado');
      return true;
    }
  };

  const deleteInstance = async () => {
    if (!user?.id || !instance) return false;

    try {
      console.log('🗑️ Deletando instância...');
      
      // Deletar da Evolution API
      try {
        await fetchWithRetry(
          `${EVOLUTION_API_BASE_URL}/instance/delete/${instance.id}`,
          {
            method: 'DELETE',
          }
        );
        console.log('✅ Deletado da Evolution API');
      } catch (error) {
        console.warn('Erro ao deletar da Evolution API (continuando):', error);
      }

      // Deletar do banco
      const { error } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('id', instance.id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('🗑️ Instância deletada do banco');

      toast({
        title: "Instância removida",
        description: "Instância WhatsApp removida com sucesso!",
      });

      // Enviar webhook
      sendWebhookSafe(user.id, 'whatsapp_instance_deleted', {
        instance_id: instance.id,
        nome_empresa: instance.nome_empresa,
        user_id: user.id,
        user_email: user.email,
        deleted_data: instance
      }, {
        action: 'delete_whatsapp_instance',
        widget: 'whatsapp'
      }).catch(console.error);

      setInstance(null);
      return true;
    } catch (error: any) {
      console.error('Erro ao remover instância:', error);
      toast({
        title: "Erro ao remover instância",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    instance,
    loading,
    connecting,
    createInstance,
    updateInstanceStatus,
    deleteInstance,
    connectWhatsApp,
    disconnectWhatsApp,
    refetch: fetchInstance
  };
}
