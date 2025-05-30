
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Webhook, Save, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useWebhookValidation } from '@/hooks/useWebhookValidation';
import { useWebhookTest } from '@/hooks/useWebhookTest';

interface WebhookFormProps {
  currentWebhookUrl?: string;
  loading: boolean;
  onSave: (webhookUrl: string) => Promise<void>;
}

export function WebhookForm({ currentWebhookUrl, loading, onSave }: WebhookFormProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const { isValidUrl, validateWebhookUrl } = useWebhookValidation();
  const { isTesting, testResult, testWebhook } = useWebhookTest();

  useEffect(() => {
    if (currentWebhookUrl) {
      setWebhookUrl(currentWebhookUrl);
      validateWebhookUrl(currentWebhookUrl);
    }
  }, [currentWebhookUrl, validateWebhookUrl]);

  const handleUrlChange = (value: string) => {
    setWebhookUrl(value);
    validateWebhookUrl(value);
  };

  const handleSave = async () => {
    if (!isValidUrl && webhookUrl.trim()) {
      return;
    }
    await onSave(webhookUrl);
  };

  const handleTest = async () => {
    if (!isValidUrl) return;
    await testWebhook(webhookUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Configuration
        </CardTitle>
        <CardDescription>
          Configure the webhook URL for receiving notifications and updates from all widgets interactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://seu-dominio.com/webhook"
            value={webhookUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={loading}
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
              Webhook salvo: {currentWebhookUrl}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={handleSave} 
            disabled={loading || (webhookUrl.trim() && !isValidUrl)}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          
          {isValidUrl && (
            <Button 
              variant="outline" 
              onClick={handleTest}
              disabled={isTesting || loading}
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
