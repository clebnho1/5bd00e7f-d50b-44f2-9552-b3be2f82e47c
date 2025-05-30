
import { Settings } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { ProtectedWidget } from '@/components/ProtectedWidget';
import { WebhookForm } from '@/components/widgets/WebhookForm';

export function ConfiguracoesWidget() {
  const { settings, loading, saveSettings } = useUserSettings();

  const handleSaveWebhook = async (webhookUrl: string) => {
    await saveSettings({ webhook_url: webhookUrl });
  };

  return (
    <ProtectedWidget requiredRole="admin" widgetName="Configurações">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-whatsapp" />
          <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
        </div>

        <WebhookForm
          currentWebhookUrl={settings?.webhook_url}
          loading={loading}
          onSave={handleSaveWebhook}
        />
      </div>
    </ProtectedWidget>
  );
}
