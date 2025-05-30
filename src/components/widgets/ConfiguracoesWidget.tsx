
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Webhook, Save, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { ProtectedWidget } from '@/components/ProtectedWidget';

export function ConfiguracoesWidget() {
  const { settings, loading, saveSettings, testWebhook } = useUserSettings();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    if (settings?.webhook_url) {
      setWebhookUrl(settings.webhook_url);
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings({ webhook_url: webhookUrl });
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    const result = await testWebhook(webhookUrl);
    setTestResult(result);
    
    setIsTesting(false);
  };

  return (
    <ProtectedWidget requiredRole="admin" widgetName="Configurações">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-whatsapp" />
          <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        </div>

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
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={loading}
              />
              {settings?.webhook_url && (
                <p className="text-sm text-gray-500">
                  Webhook salvo: {settings.webhook_url}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
              
              {webhookUrl.trim() && (
                <Button 
                  variant="outline" 
                  onClick={handleTestWebhook}
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

            {settings?.webhook_url && (
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
      </div>
    </ProtectedWidget>
  );
}
