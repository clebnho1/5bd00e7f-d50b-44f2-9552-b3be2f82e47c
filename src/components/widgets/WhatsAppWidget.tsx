
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, QrCode, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WhatsAppWidget() {
  const { toast } = useToast();
  
  const [instancia, setInstancia] = useState({
    nomeEmpresa: 'Minha Empresa',
    status: 'disconnected', // 'connected', 'connecting', 'disconnected'
    qrCode: '',
    telefone: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setInstancia(prev => ({ ...prev, [field]: value }));
  };

  const criarInstancia = async () => {
    if (!instancia.nomeEmpresa.trim()) {
      toast({
        title: "Erro",
        description: "Nome da empresa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Simular criação de instância
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular QR Code gerado
      const fakeQrCode = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="black"/>
          <rect x="40" y="40" width="120" height="120" fill="white"/>
          <rect x="60" y="60" width="80" height="80" fill="black"/>
          <text x="100" y="105" text-anchor="middle" fill="white" font-size="12">QR CODE</text>
        </svg>
      `)}`;
      
      setInstancia(prev => ({
        ...prev,
        status: 'connecting',
        qrCode: fakeQrCode
      }));
      
      toast({
        title: "Instância criada",
        description: "Escaneie o QR Code com seu WhatsApp para conectar.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar instância",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const verificarStatus = async () => {
    setIsChecking(true);
    
    try {
      // Simular verificação de status
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular conexão bem-sucedida
      setInstancia(prev => ({
        ...prev,
        status: 'connected',
        telefone: '+55 11 99999-9999',
        qrCode: ''
      }));
      
      toast({
        title: "WhatsApp conectado!",
        description: "Sua instância está ativa e funcionando.",
      });
    } catch (error) {
      toast({
        title: "Erro ao verificar status",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const desconectar = () => {
    setInstancia(prev => ({
      ...prev,
      status: 'disconnected',
      qrCode: '',
      telefone: ''
    }));
    
    toast({
      title: "WhatsApp desconectado",
      description: "Instância foi desconectada com sucesso.",
    });
  };

  const getStatusInfo = () => {
    switch (instancia.status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          text: 'Conectado',
          description: 'WhatsApp ativo e funcionando'
        };
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          icon: QrCode,
          text: 'Aguardando Conexão',
          description: 'Escaneie o QR Code para conectar'
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
            <CardTitle>Configuração da Instância</CardTitle>
            <CardDescription>
              Configure e gerencie sua conexão com o WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input
                id="nomeEmpresa"
                value={instancia.nomeEmpresa}
                onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                placeholder="Digite o nome da sua empresa"
                disabled={instancia.status === 'connected'}
              />
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
              {instancia.telefone && (
                <p className="text-sm font-medium">Telefone: {instancia.telefone}</p>
              )}
            </div>

            <div className="space-y-2">
              {instancia.status === 'disconnected' && (
                <Button
                  onClick={criarInstancia}
                  disabled={isCreating}
                  className="w-full whatsapp-gradient text-white"
                >
                  {isCreating ? "Criando instância..." : "Criar Instância WhatsApp"}
                </Button>
              )}

              {instancia.status === 'connecting' && (
                <Button
                  onClick={verificarStatus}
                  disabled={isChecking}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                  Verificar Status
                </Button>
              )}

              {instancia.status === 'connected' && (
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
                    onClick={desconectar}
                    className="w-full"
                    variant="destructive"
                  >
                    Desconectar WhatsApp
                  </Button>
                </div>
              )}
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
            {instancia.qrCode ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <img
                    src={instancia.qrCode}
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
                  {instancia.status === 'connected' 
                    ? 'WhatsApp Conectado!' 
                    : 'QR Code não disponível'
                  }
                </h3>
                <p className="text-gray-600">
                  {instancia.status === 'connected'
                    ? 'Sua instância está ativa e funcionando perfeitamente.'
                    : 'Crie uma instância para gerar o QR Code de conexão.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">✅ Funcionalidades Ativas</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Envio e recebimento de mensagens</li>
                <li>• Integração com Agente AI</li>
                <li>• Webhook automático configurado</li>
                <li>• Logs de conversas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚠️ Observações</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Mantenha o celular conectado à internet</li>
                <li>• Não desconecte o WhatsApp manualmente</li>
                <li>• Escaneie novamente se perder conexão</li>
                <li>• Suporte 24/7 disponível</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
