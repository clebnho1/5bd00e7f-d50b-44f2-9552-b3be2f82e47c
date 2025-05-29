
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, QrCode, Settings, ArrowLeft, Trash2, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function WhatsAppWidget() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [nomeCliente, setNomeCliente] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [statusConexao, setStatusConexao] = useState('Desconectado');
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE = 'https://apiwhats.lifecombr.com.br';
  const API_KEY = '0417bf43b0a8669bd6635bcb49d783df';

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedInstanceId = localStorage.getItem('whatsapp_instance_id');
    const savedNomeCliente = localStorage.getItem('whatsapp_cliente_nome');
    
    if (savedInstanceId) {
      setInstanceId(savedInstanceId);
    }
    if (savedNomeCliente) {
      setNomeCliente(savedNomeCliente);
    }
  }, []);

  // Verificar status da conexão periodicamente
  useEffect(() => {
    if (instanceId) {
      checkConnectionStatus();
      intervalRef.current = setInterval(checkConnectionStatus, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [instanceId]);

  const checkConnectionStatus = async () => {
    if (!instanceId) return;

    try {
      const response = await fetch(`${API_BASE}/instance/connectionState/${instanceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatusConexao(data.state || 'Desconectado');
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
    }
  };

  const criarInstancia = async () => {
    if (!nomeCliente.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do cliente para criar a instância.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingInstance(true);
    
    try {
      const response = await fetch(`${API_BASE}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        },
        body: JSON.stringify({
          name: nomeCliente.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const newInstanceId = data.instance_id || data.instanceId || data.name;
      
      setInstanceId(newInstanceId);
      
      // Salvar no localStorage
      localStorage.setItem('whatsapp_instance_id', newInstanceId);
      localStorage.setItem('whatsapp_cliente_nome', nomeCliente.trim());

      toast({
        title: "Instância criada",
        description: `Instância criada com sucesso. ID: ${newInstanceId}`,
      });
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast({
        title: "Erro ao criar instância",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const conectarWhatsApp = async () => {
    if (!instanceId) return;

    setIsConnecting(true);
    setQrCode('');
    
    try {
      const response = await fetch(`${API_BASE}/instance/connect/${instanceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const qrCodeData = data.qrCode || data.qr_code || data.base64;
      
      if (qrCodeData) {
        setQrCode(qrCodeData);
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        });
      }
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast({
        title: "Erro ao conectar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const desconectar = async () => {
    if (!instanceId) return;

    setIsDisconnecting(true);
    
    try {
      const response = await fetch(`${API_BASE}/instance/logout/${instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (response.ok) {
        setQrCode('');
        setStatusConexao('Desconectado');
        toast({
          title: "WhatsApp desconectado",
          description: "A instância foi desconectada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const excluirInstancia = async () => {
    if (!instanceId) return;

    setIsDeleting(true);
    
    try {
      const response = await fetch(`${API_BASE}/instance/delete/${instanceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (response.ok) {
        // Limpar todos os dados
        setInstanceId('');
        setNomeCliente('');
        setQrCode('');
        setStatusConexao('Desconectado');
        
        // Limpar localStorage
        localStorage.removeItem('whatsapp_instance_id');
        localStorage.removeItem('whatsapp_cliente_nome');
        
        // Parar verificação de status
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        toast({
          title: "Instância excluída",
          description: "A instância foi excluída com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir instância:', error);
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = () => {
    if (statusConexao === 'open' || statusConexao === 'connected') return 'text-green-600';
    if (statusConexao === 'connecting' || statusConexao === 'qr') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar WhatsApp do Cliente</h1>
      </div>

      {/* Card de Configuração */}
      <Card className="bg-green-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5" />
            Configuração da Instância
          </CardTitle>
          <CardDescription className="text-green-100">
            Configure a instância WhatsApp para o cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCliente" className="text-white">Nome do Cliente</Label>
            <div className="flex gap-2">
              <Input
                id="nomeCliente"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Digite o nome do cliente"
                className="bg-white text-gray-900 border-0 flex-1"
                disabled={!!instanceId}
              />
              {!instanceId && (
                <Button
                  onClick={criarInstancia}
                  disabled={isCreatingInstance || !nomeCliente.trim()}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8"
                >
                  {isCreatingInstance ? "Criando..." : "Criar Instância"}
                </Button>
              )}
            </div>
          </div>

          {instanceId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="instanceId" className="text-white">ID da Instância</Label>
                <Input
                  id="instanceId"
                  value={instanceId}
                  readOnly
                  className="bg-gray-100 text-gray-700 border-0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Status da Conexão</Label>
                <div className={`font-semibold ${getStatusColor()}`}>
                  {statusConexao}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={conectarWhatsApp}
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {isConnecting ? "Conectando..." : "Conectar WhatsApp"}
                </Button>
                
                <Button
                  onClick={desconectar}
                  disabled={isDisconnecting}
                  variant="outline"
                  className="bg-white text-gray-800 hover:bg-gray-100 flex-1"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isDisconnecting ? "Desconectando..." : "Desconectar"}
                </Button>
                
                <Button
                  onClick={excluirInstancia}
                  disabled={isDeleting}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Excluindo..." : ""}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Card do QR Code */}
      {instanceId && (
        <Card className="bg-green-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {qrCode ? (
              <div className="bg-white rounded-lg p-6 text-center">
                <img
                  src={qrCode}
                  alt="QR Code WhatsApp"
                  className="w-64 h-64 mx-auto border border-gray-200 rounded-lg"
                />
                <p className="text-gray-600 mt-4 text-sm">
                  Escaneie este código com seu WhatsApp para conectar
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Clique em "Conectar WhatsApp" para gerar o QR Code
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
