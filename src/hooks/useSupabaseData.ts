
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';

interface UserSettings {
  webhook_url?: string;
}

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar configurações do usuário
  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('webhook_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      setSettings(data || {});
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setSettings(prev => ({ ...prev, ...newSettings }));
      
      // Webhook para configurações salvas
      await sendWebhookSafe(user.id, 'user_settings_updated', {
        user_id: user.id,
        settings: newSettings,
        timestamp: new Date().toISOString()
      }, {
        action: 'settings_updated',
        settings_keys: Object.keys(newSettings)
      });
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      
      // Webhook para erro ao salvar
      await sendWebhookSafe(user.id, 'user_settings_error', {
        user_id: user.id,
        settings: newSettings,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }, {
        action: 'settings_save_failed'
      });
      
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async (webhookUrl: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const testPayload = {
        event: 'webhook_test',
        user_id: user.id,
        timestamp: new Date().toISOString(),
        data: {
          message: 'Teste de webhook do sistema',
          test: true
        }
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10000)
      });

      const isSuccess = response.ok;
      
      // Webhook para resultado do teste
      await sendWebhookSafe(user.id, 'webhook_test_result', {
        user_id: user.id,
        webhook_url: webhookUrl,
        success: isSuccess,
        status_code: response.status,
        timestamp: new Date().toISOString()
      }, {
        action: 'webhook_test',
        result: isSuccess ? 'success' : 'failed'
      });

      if (isSuccess) {
        toast({
          title: "Webhook testado",
          description: "Webhook está funcionando corretamente!",
        });
      } else {
        toast({
          title: "Webhook offline",
          description: `Webhook retornou status ${response.status}`,
          variant: "destructive",
        });
      }

      return isSuccess;
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      
      // Webhook para erro no teste
      await sendWebhookSafe(user.id, 'webhook_test_error', {
        user_id: user.id,
        webhook_url: webhookUrl,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }, {
        action: 'webhook_test_failed'
      });
      
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o webhook.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    testWebhook,
    loadSettings
  };
}
