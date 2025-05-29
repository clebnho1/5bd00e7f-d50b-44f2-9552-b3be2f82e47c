
import { supabase } from '@/integrations/supabase/client';

interface WebhookPayload {
  event: string;
  user_id: string;
  timestamp: string;
  data: any;
  metadata?: any;
}

export const sendWebhookData = async (
  userId: string, 
  event: string, 
  data: any, 
  metadata?: any
): Promise<boolean> => {
  try {
    // Buscar URL do webhook do usuário
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('webhook_url')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar webhook URL:', error);
      return false;
    }

    if (!settings?.webhook_url) {
      console.log('ℹ️ Webhook não configurado para usuário:', userId);
      return false;
    }

    const payload: WebhookPayload = {
      event,
      user_id: userId,
      timestamp: new Date().toISOString(),
      data,
      metadata
    };

    console.log('📤 Enviando webhook:', { event, webhook_url: settings.webhook_url });

    const response = await fetch(settings.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000) // 10 segundos timeout
    });

    if (response.ok) {
      console.log('✅ Webhook enviado com sucesso:', event);
      return true;
    } else {
      console.error('❌ Webhook falhou:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error);
    return false;
  }
};

export const sendWebhookSafe = async (
  userId: string, 
  event: string, 
  data: any, 
  metadata?: any
): Promise<void> => {
  // Versão que não trava a aplicação se webhook falhar
  try {
    await sendWebhookData(userId, event, data, metadata);
  } catch (error) {
    console.error('❌ Webhook error (non-blocking):', error);
  }
};
