
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Save, TestTube, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WebhookFormProps {
  currentWebhookUrl?: string;
  loading: boolean;
  onSave: (webhookUrl: string) => Promise<boolean>;
}

export function WebhookForm({ currentWebhookUrl, loading, onSave }: WebhookFormProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    if (currentWebhookUrl) {
      setWebhookUrl(currentWebhookUrl);
      validateWebhookUrl(currentWebhookUrl);
    }
  }, [currentWebhookUrl]);

  const validateWebhookUrl = (url: string): boolean => {
    if (!url.trim()) {
      setIsValidUrl(false);
      return false;
    }

    try {
      const urlObj = new URL(url);
      const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      setIsValidUrl(isValid);
      return isValid;
    } catch {
      setIsValidUrl(false);
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setWebhookUrl(value);
    validateWebhookUrl(value);
    setTestResult(null); // Reset test result when URL changes
  };

  const handleSave = async () => {
    if (!isValidUrl && webhookUrl.trim()) {
      return;
    }
    
    setSaveInProgress(true);
    try {
      console.log('🔄 Initiating webhook save:', webhookUrl);
      const success = await onSave(webhookUrl);
      
      if (success) {
        console.log('✅ Webhook save completed successfully');
      } else {
        console.log('❌ Webhook save failed');
      }
    } catch (error) {
      console.error('❌ Error during webhook save:', error);
    } finally {
      setSaveInProgress(false);
    }
  };

  const handleTest = async () => {
    if (!isValidUrl) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testing webhook:', webhookUrl);

      const testPayload = {
        event: 'webhook_test',
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
        signal: AbortSignal.timeout(10000) // Increased timeout to 10 seconds
      });

      const isSuccess = response.ok;
      setTestResult(isSuccess);
      
      console.log(isSuccess ? '✅ Webhook test successful' : '❌ Webhook test failed');
      
    } catch (error) {
      console.error('❌ Webhook test failed:', error);
      setTestResult(false);
    } finally {
      setIsTesting(false);
    }
  };

  const isLoading = loading || saveInProgress;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Configuração de Webhook
        </CardTitle>
        <CardDescription>
          Configure a URL do webhook para receber notificações e atualizações de todas as interações dos widgets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL do Webhook</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://seu-dominio.com/webhook"
            value={webhookUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={isLoading}
            className={
              webhookUrl && !isValidUrl 
                ? "border-red-500 focus:border-red-500" 
                : ""
            }
          />
          {webhookUrl && !isValidUrl && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>URL inválida</span>
            </div>
          )}
          {currentWebhookUrl && (
            <p className="text-sm text-gray-500">
              Webhook atual: {currentWebhookUrl}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={handleSave} 
            disabled={isLoading || (webhookUrl.trim() && !isValidUrl)}
          >
            {saveInProgress ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saveInProgress ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          
          {isValidUrl && (
            <Button 
              variant="outline" 
              onClick={handleTest}
              disabled={isTesting || isLoading}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Testando...' : 'Testar Webhook'}
            </Button>
          )}
          
          {testResult !== null && (
            <div className="flex items-center gap-1">
              {testResult ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 text-sm">Online</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 text-sm">Offline</span>
                </>
              )}
            </div>
          )}
        </div>

        {currentWebhookUrl && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Informações do Webhook</h4>
            <p className="text-sm text-blue-700 mb-2">
              Todas as interações dos widgets enviarão dados JSON para este endpoint:
            </p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Criação e edição de colaboradores</li>
              <li>• Mudanças de status do WhatsApp</li>
              <li>• Atualizações do Agente AI</li>
              <li>• Eventos do sistema de administração</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
