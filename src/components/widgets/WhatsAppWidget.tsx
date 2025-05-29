
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, QrCode, CheckCircle, XCircle, RefreshCw, Zap, Power, Plus } from 'lucide-react';
import { useWhatsAppInstance } from '@/hooks/useSupabaseData';

export function WhatsAppWidget() {
  const { instance, loading, saveInstance, disconnectInstance } = useWhatsAppInstance();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [instanceName, setInstanceName] = useState('');

  const criarInstancia = async () => {
    if (!instanceName.trim()) {
      return;
    }

    setIsCreating(true);
    
    try {
      // Primeiro criar a instância na Evolution API
      const response = await fetch(`https://apiwhats.lifecombr.com.br/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0417bf43b0a8669bd6635bcb49d783df'
        },
        body: JSON.stringify({
          instanceName: instanceName.trim(),
          token: instanceName.trim(),
          qrcode: true,
          chatwoot_account_id: null,
          chatwoot_token: null,
          chatwoot_url: null,
          chatwoot_sign_msg: false,
          chatwoot_reopen_conversation: false,
          chatwoot_conversation_pending: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      // Salvar no Supabase
      await saveInstance({
        nome_empresa: instanceName.trim(),
        status: 'criado',
        qr_code: null
      });
      setInstanceName('');
    } catch (error) {
      console.error('Erro ao criar instância:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const gerarQRCode = async () => {
    if (!instance) return;

    setIsGeneratingQR(true);
    
    try {
      // Usar GET para buscar o QR Code
      const response = await fetch(`https://apiwhats.lifecombr.com.br/instance/connect/${instance.nome_empresa}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0417bf43b0a8669bd6635bcb49d783df'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const apiData = await response.json();
      
      // Atualizar a instância com o QR Code
      await saveInstance({
        nome_empresa: instance.nome_empresa,
        status: 'aguardando_conexao',
        qr_code: apiData.qrCode || apiData.qr_code || apiData.base64 || null,
        ultima_verificacao: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const verificarStatus = async () => {
    setIsChecking(true);
    
    try {
      const response = await fetch(`https://apiwhats.lifecombr.com.br/instance/connectionState/${instance?.nome_empresa}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0417bf43b0a8669bd6635bcb49d783df'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const statusData = await response.json();
      
      let newStatus = 'desconectado';
      if (statusData.instance?.state === 'open') {
        newStatus = 'conectado';
      } else if (statusData.instance?.state === 'connecting') {
        newStatus = 'aguardando_conexao';
      }
      
      await saveInstance({
        nome_empresa: instance?.nome_empresa,
        status: newStatus,
        qr_code: newStatus === 'conectado' ? null : instance?.qr_code,
        ultima_verificacao: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDisconnect = async () => {
    if (!instance) return;

    setIsDisconnecting(true);
    try {
      // Tentar desconectar via API da Evolution
      const response = await fetch(`https://apiwhats.lifecombr.com.br/instance/logout/${instance.nome_empresa}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0417bf43b0a8669bd6635bcb49d783df'
        }
      });

      // Atualizar o status local independentemente da resposta da API
      await saveInstance({
        nome_empresa: instance.nome_empresa,
        status: 'desconectado',
        qr_code: null,
        ultima_verificacao: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao desconectar instância:', error);
      // Mesmo com erro, atualizar status local
      await saveInstance({
        nome_empresa: instance.nome_empresa,
        status: 'desconectado',
        qr_code: null,
        ultima_verificacao: new Date().toISOString()
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const getStatusInfo = () => {
    const status = instance?.status || 'desconectado';
    switch (status) {
      case 'conectado':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          text: 'Conectado',
          description: 'WhatsApp ativo e funcionando'
        };
      case 'aguardando_conexao':
        return {
          color: 'bg-yellow-500',
          icon: QrCode,
          text: 'Aguardando Conexão',
          description: 'Escaneie o QR Code para conectar'
        };
      case 'criado':
        return {
          color: 'bg-blue-500',
          icon: Zap,
          text: 'Instância Criada',
          description: 'Gere o QR Code para conectar'
        };
      default:
        return {
          color: 'bg-red-500',
          icon: XCircle,
          text: 'Desconectado',
          description: 'WhatsApp não está conectado'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp"></div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-whatsapp" />
        <h2 className="text-2xl font-bold">Configuração WhatsApp</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuração da Instância */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Integração Evolution API
            </CardTitle>
            <CardDescription>
              Configure sua instância WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!instance ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="instanceName">Nome da Instância</Label>
                  <Input
                    id="instanceName"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    placeholder="Digite o nome da sua instância WhatsApp"
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600">
                    Escolha um nome único para identificar sua instância WhatsApp
                  </p>
                </div>

                <Button
                  onClick={criarInstancia}
                  disabled={isCreating || !instanceName.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? "Criando instância..." : "Criar Instância"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Nome da Instância</Label>
                  <Input
                    value={instance.nome_empresa}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-600">
                    Instância configurada: {instance.nome_empresa}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Status da Conexão</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusInfo.color}`} />
                    <Badge variant="outline" className="flex items-center gap-2">
                      <statusInfo.icon className="h-3 w-3" />
                      {statusInfo.text}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                  {instance?.ultima_verificacao && (
                    <p className="text-sm font-medium">
                      Última verificação: {new Date(instance.ultima_verificacao).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {(instance.status === 'desconectado' || instance.status === 'criado') && (
                    <Button
                      onClick={gerarQRCode}
                      disabled={isGeneratingQR}
                      className="w-full whatsapp-gradient text-white"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      {isGeneratingQR ? "Gerando QR Code..." : "Gerar QR Code"}
                    </Button>
                  )}

                  {(instance.status === 'aguardando_conexao' || instance.status === 'conectado') && (
                    <div className="space-y-2">
                      <Button
                        onClick={verificarStatus}
                        disabled={isChecking}
                        className="w-full"
                        variant="outline"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                        Verificar Status
                      </Button>
                      
                      <Button
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="w-full"
                        variant="destructive"
                      >
                        <Power className={`h-4 w-4 mr-2 ${isDisconnecting ? 'animate-spin' : ''}`} />
                        {isDisconnecting ? 'Desconectando...' : 'Desconectar WhatsApp'}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🔗 Integração Evolution API</h4>
              <p className="text-sm text-blue-700 mb-1">
                <strong>Endpoint:</strong> https://apiwhats.lifecombr.com.br
              </p>
              <p className="text-sm text-blue-700 mb-1">
                <strong>API Key:</strong> 0417bf43b0a8669bd6635bcb49d783df
              </p>
              <p className="text-sm text-blue-600">
                {!instance 
                  ? "Digite um nome e crie sua instância primeiro."
                  : "Use o botão 'Gerar QR Code' para conectar."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code de Conexão</CardTitle>
            <CardDescription>
              Escaneie este código com seu WhatsApp para conectar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instance?.qr_code ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <img
                    src={instance.qr_code}
                    alt="QR Code WhatsApp"
                    className="w-48 h-48 border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Como conectar:</p>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Abra o WhatsApp no seu celular</li>
                    <li>2. Vá em Menu ⋮ → Dispositivos conectados</li>
                    <li>3. Toque em "Conectar um dispositivo"</li>
                    <li>4. Escaneie este QR Code</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {instance?.status === 'conectado' 
                    ? 'WhatsApp Conectado!' 
                    : 'QR Code não disponível'
                  }
                </h3>
                <p className="text-gray-600">
                  {instance?.status === 'conectado'
                    ? 'Sua instância está ativa e funcionando perfeitamente.'
                    : !instance 
                      ? 'Crie uma instância primeiro para poder gerar o QR Code.'
                      : 'Clique em "Gerar QR Code" para conectar sua instância.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações da Integração */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Integração Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✅ Recursos Ativos</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Criação de instância na Evolution API</li>
                <li>• Nome personalizado pelo usuário</li>
                <li>• Geração de QR Code via GET</li>
                <li>• Verificação de status em tempo real</li>
                <li>• Desconexão de instância</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔧 Configurações Técnicas</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• API: Evolution WhatsApp</li>
                <li>• Endpoint: apiwhats.lifecombr.com.br</li>
                <li>• Criação: POST /instance/create</li>
                <li>• QR Code: GET /instance/connect/{name}</li>
                <li>• Desconectar: DELETE /instance/logout/{name}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
