
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
      console.log('🔍 Loading user settings for:', user.id);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('webhook_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading settings:', error);
        return;
      }

      console.log('✅ Settings loaded successfully:', data);
      setSettings(data || {});
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id, loadSettings]);

  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      console.log('💾 Saving settings for user:', user.id, newSettings);

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...newSettings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('🚫 Database error during upsert:', error);
        throw error;
      }

      setSettings(prev => ({ ...prev, ...newSettings }));
      console.log('✅ Settings saved successfully');
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  return {
    settings,
    loading,
    saveSettings,
    loadSettings
  };
}
