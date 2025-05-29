
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Webhook, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { useUserSettings } from '@/hooks/useSupabaseData';

export function ConfiguracoesWidget() {
  const { settings, loading, saveSettings } = useUserSettings();
  
  const [webhookConfig, setWebhookConfig] = useState({
    url: 'https://n8n.exemplo.com/webhook/chatwhatsapp',
    ultimoTeste: '',
    ultimoStatus: 'pending' // 'success', 'error', 'pending'
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setWebhookConfig(prev => ({
        ...prev,
        url: settings.webhook_url || 'https://n8n.exemplo.com/webhook/chatwhatsapp'
      }));
    }
  }, [settings]);

  const handleWebhookChange = (value: string) => {
    setWebhookConfig(prev => ({ ...prev, url: value }));
  };

  const testarWebhook = async () => {
    if (!webhookConfig.url.trim()) return;

    setIsTesting(true);
    
    try {
      // Simular teste de webhook
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso (80% de chance)
      const success = Math.random() > 0.2;
      
      setWebhookConfig(prev => ({
        ...prev,
        ultimoTeste: new Date().toLocaleString('pt-BR'),
        ultimoStatus: success ? 'success' : 'error'
      }));
    } finally {
      setIsTesting(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setIsSaving(true);
    
    try {
      await saveSettings({
        webhook_url: webhookConfig.url
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = () => {
    switch (webhookConfig.ultimoStatus) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Funcionando
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Com Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Não Testado
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-whatsapp" />
        <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuração de Webhook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Configuração de Webhook
            </CardTitle>
            <CardDescription>
              Configure a URL do webhook para integração com n8n ou outras ferramentas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL do Webhook</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={webhookConfig.url}
                onChange={(e) => handleWebhookChange(e.target.value)}
                placeholder="https://n8n.exemplo.com/webhook/chatwhatsapp"
              />
              <p className="text-xs text-gray-600">
                Todas as interações dos widgets serão enviadas para esta URL
              </p>
            </div>

            <div className="space-y-2">
              <Label>Status da Conexão</Label>
              <div className="flex items-center justify-between">
                {getStatusBadge()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testarWebhook}
                  disabled={isTesting}
                >
                  <TestTube className={`h-4 w-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testando...' : 'Testar Webhook'}
                </Button>
              </div>
              {webhookConfig.ultimoTeste && (
                <p className="text-xs text-gray-600">
                  Último teste: {webhookConfig.ultimoTeste}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formato dos Dados */}
        <Card>
          <CardHeader>
            <CardTitle>Formato dos Dados Enviados</CardTitle>
            <CardDescription>
              Estrutura JSON que será enviada para o webhook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              rows={12}
              className="font-mono text-xs"
              value={`{
  "timestamp": "2024-01-15T14:30:00.000Z",
  "event": "widget_interaction",
  "widget": "agente-ai | colaboradores | whatsapp",
  "user_id": "uuid-do-usuario",
  "action": "create | update | delete",
  "data": {
    // Dados específicos do widget
    "id": "item-id",
    "changes": { ... },
    "metadata": { ... }
  },
  "source": "chatwhatsapp_saas"
}`}
            />
          </CardContent>
        </Card>

        {/* Eventos Monitorados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Eventos Monitorados</CardTitle>
            <CardDescription>
              Lista de eventos que são automaticamente enviados para o webhook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Agente AI</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Atualização de configurações</li>
                  <li>• Adição/remoção de funções</li>
                  <li>• Alteração de dados da empresa</li>
                  <li>• Mudanças de personalidade</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Colaboradores</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Criação de novo colaborador</li>
                  <li>• Atualização de dados</li>
                  <li>• Ativação/desativação</li>
                  <li>• Alteração de produtos/horários</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">WhatsApp</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Conexão/desconexão</li>
                  <li>• Criação de instância</li>
                  <li>• Mudança de status</li>
                  <li>• Recebimento de mensagens</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Sistema</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Login/logout de usuários</li>
                  <li>• Alterações de configuração</li>
                  <li>• Testes de webhook</li>
                  <li>• Erros e alertas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={salvarConfiguracoes}
          disabled={isSaving}
          className="whatsapp-gradient text-white"
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
