
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';

export function useWebhookTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const testWebhook = async (webhookUrl: string): Promise<boolean> => {
    if (!user?.id || !webhookUrl.trim()) return false;

    setIsTesting(true);
    setTestResult(null);
    
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
      setTestResult(isSuccess);
      
      try {
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
      } catch (error) {
        console.error('Failed to log webhook test result:', error);
      }

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
      setTestResult(false);
      
      try {
        await sendWebhookSafe(user.id, 'webhook_test_error', {
          user_id: user.id,
          webhook_url: webhookUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }, {
          action: 'webhook_test_failed'
        });
      } catch (logError) {
        console.error('Failed to log webhook test error:', logError);
      }
      
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o webhook.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  return {
    isTesting,
    testResult,
    testWebhook
  };
}
