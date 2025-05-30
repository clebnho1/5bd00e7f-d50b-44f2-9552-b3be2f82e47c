
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from './useDebounce';

interface UserSettings {
  webhook_url?: string;
}

// Retry utility with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`🔄 Retry attempt ${attempt + 1} after ${delay}ms delay:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);

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

  const saveSettingsImpl = async (newSettings: Partial<UserSettings>): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    // Mutex-like protection
    if (savingInProgress) {
      console.log('⏳ Save operation already in progress, skipping...');
      return false;
    }

    try {
      setSavingInProgress(true);
      setLoading(true);

      console.log('💾 Starting save operation for user:', user.id, newSettings);

      const result = await retryWithBackoff(async () => {
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

        return true;
      });

      setSettings(prev => ({ ...prev, ...newSettings }));
      console.log('✅ Settings saved successfully');
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to save settings after retries:', error);
      
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setSavingInProgress(false);
      setLoading(false);
    }
  };

  // Debounced save function to prevent rapid consecutive calls
  const saveSettings = useDebounce(saveSettingsImpl, 500);

  return {
    settings,
    loading: loading || savingInProgress,
    saveSettings,
    loadSettings
  };
}
