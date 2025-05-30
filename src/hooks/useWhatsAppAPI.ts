
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type WhatsAppInstance = Tables['whatsapp_instances']['Row'];

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

  const createInstance = async (nomeCliente: string) => {
    if (!user?.id) return null;
    if (!nomeCliente.trim()) return null;

    console.log('🏗️ Criando instância com nome do cliente:', nomeCliente.trim());

    try {
      setConnecting(true);
      
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .upsert({
          user_id: user.id,
          nome_empresa: nomeCliente.trim(), // Salvar o nome do cliente
          status: 'desconectado'
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Instância criada com nome do cliente:', data.nome_empresa);

      toast({
        title: "Instância criada",
        description: `Instância WhatsApp criada para "${nomeCliente.trim()}"!`,
      });

      // Enviar webhook
      sendWebhookSafe(user.id, 'whatsapp_instance_created', {
        instance_id: data.id,
        nome_empresa: nomeCliente.trim(),
        user_id: user.id,
        user_email: user.email,
        status: 'desconectado'
      }, {
        action: 'create_whatsapp_instance',
        widget: 'whatsapp'
      }).catch(console.error);

      setInstance(data);
      return data;
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

      // Só mostrar toast para mudanças importantes
      if (status === 'conectado') {
        toast({
          title: "WhatsApp Conectado!",
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

  const deleteInstance = async () => {
    if (!user?.id || !instance) return false;

    try {
      const { error } = await supabase
        .from('whatsapp_instances')
        .delete()
        .eq('id', instance.id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('🗑️ Instância deletada');

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

  const connectWhatsApp = async () => {
    if (!instance) return false;

    try {
      setConnecting(true);
      console.log('📱 INICIANDO processo de conexão WhatsApp para:', instance.nome_empresa);
      
      // ETAPA 1: Definir status como "conectando"
      await updateInstanceStatus('conectando');
      
      // ETAPA 2: Gerar QR Code
      console.log('🔄 Gerando QR Code...');
      const simulatedQrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
      
      // ETAPA 3: Atualizar com QR Code mas manter status "conectando"
      await updateInstanceStatus('conectando', simulatedQrCode);
      
      console.log('✅ QR Code gerado! Aguardando scan do usuário...');
      
      // ETAPA 4: Simular scan após 15 segundos
      setTimeout(async () => {
        console.log('📱 SIMULANDO scan do QR Code pelo usuário');
        await updateInstanceStatus('conectado');
        console.log('🎉 WhatsApp conectado com sucesso!');
      }, 15000); // 15 segundos para dar tempo do usuário ver o QR
      
      return true;
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      await updateInstanceStatus('erro');
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWhatsApp = async () => {
    if (!instance) return false;

    try {
      console.log('🔌 Desconectando WhatsApp');
      await updateInstanceStatus('desconectado');
      return true;
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
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
