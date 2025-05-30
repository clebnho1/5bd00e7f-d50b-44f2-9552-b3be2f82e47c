
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

      console.log('🧪 Testando webhook:', webhookUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(5000)
      });

      const isSuccess = response.ok;
      setTestResult(isSuccess);

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
      
      toast({
        title: "Erro no teste",
        description: "Não foi possível testar o webhook. Verifique a URL e tente novamente.",
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
