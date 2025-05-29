
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, QrCode, Settings, ArrowLeft, Trash2, LogOut, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import QrCodeDisplay from '@/components/QrCodeDisplay';
import StatusBadge from '@/components/StatusBadge';

export function WhatsAppWidget() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [nomeCliente, setNomeCliente] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [statusConexao, setStatusConexao] = useState<'open' | 'closed' | 'error' | 'connecting' | 'unknown'>('unknown');
  const [statusMessage, setStatusMessage] = useState('');
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE = 'https://apiwhats.lifecombr.com.br';
  const API_KEY = '0417bf43b0a8669bd6635bcb49d783df';

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedInstanceId = localStorage.getItem('whatsapp_instance_id');
    const savedNomeCliente = localStorage.getItem('whatsapp_cliente_nome');
    
    console.log('Carregando dados salvos:', { savedInstanceId, savedNomeCliente });
    
    if (savedInstanceId) {
      setInstanceId(savedInstanceId);
    }
    if (savedNomeCliente) {
      setNomeCliente(savedNomeCliente);
    }
  }, []);

  // Auto-verificação quando o nome da instância muda
  useEffect(() => {
    if (nomeCliente.trim().length > 2) {
      const timer = setTimeout(() => {
        checkConnectionStatus();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [nomeCliente]);

  // Verificar status da conexão periodicamente (a cada 5s)
  useEffect(() => {
    if (instanceId) {
      console.log('Iniciando verificação de status para:', instanceId);
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
    const targetInstance = instanceId || nomeCliente.trim();
    if (!targetInstance) return;

    setIsCheckingStatus(true);
    try {
      const response = await fetch(`${API_BASE}/instance/connectionState/${targetInstance}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Status da conexão:', data);
        const newStatus = data.state || 'unknown';
        setStatusConexao(newStatus);
        
        if (newStatus === 'open' || newStatus === 'connected') {
          setStatusMessage('Conectado e funcionando');
          setError(undefined);
        } else if (newStatus === 'connecting' || newStatus === 'qr') {
          setStatusMessage('Aguardando conexão');
        } else {
          setStatusMessage('Desconectado');
        }
      } else {
        throw new Error(`API respondeu com status ${response.status}`);
      }
    } catch (err) {
      console.error('Erro ao verificar status da conexão:', err);
      setStatusConexao('error');
      setStatusMessage('Erro ao verificar conexão');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsCheckingStatus(false);
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
    setError(undefined);
    
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
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const newInstanceId = data.instance_id || data.instanceId || data.name;
      
      console.log('Instância criada:', { data, newInstanceId });
      
      setInstanceId(newInstanceId);
      
      // Salvar no localStorage
      localStorage.setItem('whatsapp_instance_id', newInstanceId);
      localStorage.setItem('whatsapp_cliente_nome', nomeCliente.trim());

      toast({
        title: "Instância criada",
        description: `Instância criada com sucesso. ID: ${newInstanceId}`,
      });
    } catch (err) {
      console.error('Erro ao criar instância:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao criar instância",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const conectarWhatsApp = async () => {
    const targetInstance = instanceId || nomeCliente.trim();
    if (!targetInstance) {
      toast({
        title: "Instância necessária",
        description: "Crie uma instância primeiro ou digite um nome válido.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    setQrCode('');
    setError(undefined);
    
    try {
      const response = await fetch(`${API_BASE}/instance/connect/${targetInstance}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const qrCodeData = data.qrCode || data.qr_code || data.base64;
      
      console.log('Conectar WhatsApp response:', data);
      
      if (qrCodeData) {
        setQrCode(qrCodeData);
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar.",
        });
        // Auto-check status after generating QR
        setTimeout(checkConnectionStatus, 3000);
      } else if (data.message && data.message.includes('já está conectada')) {
        toast({
          title: "Já conectado",
          description: data.message,
        });
        setStatusConexao('open');
        setStatusMessage('Conectado');
      }
    } catch (err) {
      console.error('Erro ao conectar WhatsApp:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao conectar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const desconectar = async () => {
    const targetInstance = instanceId || nomeCliente.trim();
    if (!targetInstance) return;

    setIsDisconnecting(true);
    
    try {
      const response = await fetch(`${API_BASE}/instance/logout/${targetInstance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (response.ok) {
        setQrCode('');
        setStatusConexao('closed');
        setStatusMessage('Desconectado');
        setError(undefined);
        toast({
          title: "WhatsApp desconectado",
          description: "A instância foi desconectada com sucesso.",
        });
      } else {
        throw new Error(`Erro na API: ${response.status}`);
      }
    } catch (err) {
      console.error('Erro ao desconectar:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao desconectar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const excluirInstancia = async () => {
    const targetInstance = instanceId || nomeCliente.trim();
    if (!targetInstance) return;

    setIsDeleting(true);
    
    try {
      const response = await fetch(`${API_BASE}/instance/delete/${targetInstance}`, {
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
        setStatusConexao('unknown');
        setStatusMessage('');
        setError(undefined);
        
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
      } else {
        throw new Error(`Erro na API: ${response.status}`);
      }
    } catch (err) {
      console.error('Erro ao excluir instância:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao excluir",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  console.log('WhatsApp Widget State:', { 
    nomeCliente, 
    instanceId, 
    statusConexao, 
    hasQrCode: !!qrCode,
    error 
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
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

      {/* Card Principal */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Settings className="h-5 w-5" />
            Configuração da Instância WhatsApp
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure e gerencie a instância WhatsApp para o cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interface melhorada com status */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="nomeCliente" className="text-gray-700 font-medium">
                Nome do Cliente
              </Label>
              <div className="flex gap-3">
                <Input
                  id="nomeCliente"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Digite o nome do cliente (ex: joao)"
                  className="flex-1"
                  disabled={!!instanceId}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={checkConnectionStatus} 
                  disabled={isCheckingStatus || (!instanceId && !nomeCliente.trim())}
                  title="Verificar status da conexão"
                >
                  <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                </Button>
                {/* Botão Criar Instância */}
                {!instanceId && (
                  <Button
                    onClick={criarInstancia}
                    disabled={isCreatingInstance || !nomeCliente.trim()}
                    className="min-w-[150px]"
                  >
                    {isCreatingInstance ? "Criando..." : "Criar Instância"}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Use um nome único para identificar este dispositivo
              </p>
            </div>

            {/* Status Badge */}
            {statusConexao !== 'unknown' && (
              <StatusBadge status={statusConexao} message={statusMessage} />
            )}
          </div>

          {/* Campo ID da Instância */}
          <div className="space-y-2">
            <Label htmlFor="instanceId" className="text-gray-700 font-medium">
              ID da Instância
            </Label>
            <Input
              id="instanceId"
              value={instanceId || 'Nenhuma instância criada'}
              readOnly
              className="bg-gray-50 text-gray-600"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={conectarWhatsApp}
              disabled={isConnecting || (!instanceId && !nomeCliente.trim()) || statusConexao === 'open'}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {isConnecting ? "Conectando..." : "Conectar WhatsApp"}
            </Button>
            
            <Button
              onClick={desconectar}
              disabled={isDisconnecting || (!instanceId && !nomeCliente.trim()) || statusConexao !== 'open'}
              variant="outline"
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isDisconnecting ? "Desconectando..." : "Desconectar"}
            </Button>
            
            <Button
              onClick={excluirInstancia}
              disabled={isDeleting || (!instanceId && !nomeCliente.trim())}
              variant="destructive"
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Excluindo..." : "Excluir Instância"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card QR Code com componente melhorado */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <QrCode className="h-5 w-5" />
            QR Code para Conexão
          </CardTitle>
          <CardDescription className="text-gray-600">
            Escaneie o código QR com seu WhatsApp para conectar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QrCodeDisplay 
            qrCodeData={qrCode} 
            isLoading={isConnecting} 
            error={error}
            message={statusConexao === 'open' ? 'WhatsApp já está conectado! Não é necessário escanear o QR Code.' : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
