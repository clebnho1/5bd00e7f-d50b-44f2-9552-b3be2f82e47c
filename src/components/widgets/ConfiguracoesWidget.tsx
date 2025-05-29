
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Webhook, Save } from 'lucide-react';
import { useState } from 'react';
import { useUserSettings } from '@/hooks/useSupabaseData';
import { ProtectedWidget } from '@/components/ProtectedWidget';

export function ConfiguracoesWidget() {
  const { settings, loading, saveSettings } = useUserSettings();
  const [webhookUrl, setWebhookUrl] = useState(settings?.webhook_url || '');

  const handleSave = async () => {
    await saveSettings({ webhook_url: webhookUrl });
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
              Configure the webhook URL for receiving notifications and updates.
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
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProtectedWidget>
  );
}
