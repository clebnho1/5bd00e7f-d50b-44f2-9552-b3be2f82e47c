
import { supabase } from '@/integrations/supabase/client';
import { webhookCircuitBreaker } from './webhookCircuitBreaker';
import { webhookRateLimiter } from './webhookRateLimiter';

interface WebhookPayload {
  event: string;
  user_id: string;
  timestamp: string;
  data: any;
  metadata?: any;
}

// Cache para evitar múltiplos webhooks iguais
const webhookCache = new Map<string, number>();
const CACHE_DURATION = 5000; // 5 segundos

const validateWebhookUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

const getCacheKey = (userId: string, event: string, data: any): string => {
  return `${userId}:${event}:${JSON.stringify(data)}`;
};

export const sendWebhookData = async (
  userId: string, 
  event: string, 
  data: any, 
  metadata?: any
): Promise<boolean> => {
  try {
    // Verificar cache para evitar duplicatas
    const cacheKey = getCacheKey(userId, event, data);
    const now = Date.now();
    const cached = webhookCache.get(cacheKey);
    
    if (cached && (now - cached) < CACHE_DURATION) {
      console.log('🔄 Webhook já enviado recentemente, ignorando duplicata');
      return true;
    }

    console.log('🔍 Verificando webhook para usuário:', userId);
    
    // Para eventos do sistema, buscar webhook de admin
    if (userId === 'system') {
      console.log('ℹ️ Evento do sistema, buscando webhook de admin');
      
      const { data: adminSettings, error } = await supabase
        .from('user_settings')
        .select('webhook_url, users!inner(role)')
        .eq('users.role', 'admin')
        .not('webhook_url', 'is', null)
        .limit(1)
        .maybeSingle();

      if (error || !adminSettings?.webhook_url) {
        console.log('ℹ️ Webhook de admin não configurado');
        return false;
      }

      const success = await executeWebhookRequest(adminSettings.webhook_url, {
        event,
        user_id: 'system',
        timestamp: new Date().toISOString(),
        data,
        metadata
      });

      if (success) {
        webhookCache.set(cacheKey, now);
      }
      return success;
    }
    
    // Verificar se o usuário existe
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!userExists) {
      console.log('⚠️ Usuário não encontrado para webhook:', userId);
      return false;
    }

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

    const success = await executeWebhookRequest(settings.webhook_url, payload);
    
    if (success) {
      webhookCache.set(cacheKey, now);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return false;
  }
};

const executeWebhookRequest = async (webhookUrl: string, payload: WebhookPayload): Promise<boolean> => {
  // Validar URL
  if (!validateWebhookUrl(webhookUrl)) {
    console.error('❌ URL do webhook inválida:', webhookUrl);
    return false;
  }

  // Verificar rate limiting
  const rateLimitKey = `${payload.user_id}:${payload.event}`;
  if (!webhookRateLimiter.canMakeRequest(rateLimitKey)) {
    console.log('⏱️ Rate limit atingido para:', rateLimitKey);
    return false;
  }

  // Não enviar webhooks de erro se o circuit breaker estiver aberto
  if (payload.event.includes('error') && !webhookCircuitBreaker.canExecute(webhookUrl)) {
    console.log('🔒 Circuit breaker aberto para webhooks de erro');
    return false;
  }

  try {
    return await webhookCircuitBreaker.executeWithRetry(webhookUrl, async () => {
      console.log('📤 Enviando webhook:', { event: payload.event, webhook_url: webhookUrl });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Webhook falhou: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Webhook enviado com sucesso:', payload.event);
      return true;
    });
  } catch (error) {
    console.error('❌ Webhook falhou após todas as tentativas:', error);
    return false;
  }
};

export const sendWebhookSafe = async (
  userId: string, 
  event: string, 
  data: any, 
  metadata?: any
): Promise<void> => {
  try {
    await sendWebhookData(userId, event, data, metadata);
  } catch (error) {
    console.error('❌ Webhook error (non-blocking):', error);
  }
};
