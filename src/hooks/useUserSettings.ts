
import { useState, useEffect, useCallback } from 'react';
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

  const loadSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('webhook_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      setSettings(data || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id, loadSettings]);

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
      
      // Enviar notificação de sucesso apenas se não for webhook de erro
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
      console.error('Failed to save settings:', error);
      
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    loadSettings
  };
}
