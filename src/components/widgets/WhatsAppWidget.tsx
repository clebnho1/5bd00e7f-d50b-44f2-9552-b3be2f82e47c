
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
    } else {
      // Reset status when name is too short
      setStatusConexao('unknown');
      setStatusMessage('');
      setError(undefined);
    }
  }, [nomeCliente]);

  // Verificar status da conexão periodicamente (a cada 10s quando conectado)
  useEffect(() => {
    if (instanceId && statusConexao === 'open') {
      console.log('Iniciando verificação periódica de status para:', instanceId);
      intervalRef.current = setInterval(checkConnectionStatus, 10000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [instanceId, statusConexao]);

  const normalizeStatus = (apiStatus: string): 'open' | 'closed' | 'error' | 'connecting' | 'unknown' => {
    const status = apiStatus?.toLowerCase();
    
    if (status === 'open' || status === 'connected') return 'open';
    if (status === 'connecting' || status === 'qr' || status === 'qrcode') return 'connecting';
    if (status === 'closed' || status === 'disconnected') return 'closed';
    if (status === 'error' || status === 'failed') return 'error';
    
    return 'unknown';
  };

  const checkConnectionStatus = async () => {
    const targetInstance = instanceId || nomeCliente.trim();
    if (!targetInstance) return;

    setIsCheckingStatus(true);
    try {
      console.log('🔍 [CHECK_STATUS] Verificando status para:', targetInstance);
      
      const response = await fetch(`${API_BASE}/instance/connectionState/${targetInstance}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      console.log('🔍 [CHECK_STATUS] Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [CHECK_STATUS] Dados recebidos:', data);
        
        const apiStatus = data.instance?.state || data.state || 'unknown';
        const normalizedStatus = normalizeStatus(apiStatus);
        
        console.log('🔍 [CHECK_STATUS] Status API:', apiStatus, '-> Normalizado:', normalizedStatus);
        
        setStatusConexao(normalizedStatus);
        
        if (normalizedStatus === 'open') {
          setStatusMessage('Conectado e funcionando');
          setError(undefined);
          setQrCode('');
        } else if (normalizedStatus === 'connecting') {
          setStatusMessage('Aguardando leitura do QR Code');
        } else if (normalizedStatus === 'closed') {
          setStatusMessage('Desconectado');
        } else if (normalizedStatus === 'error') {
          setStatusMessage('Erro na conexão');
          setError('Problemas na conexão com WhatsApp');
        } else {
          setStatusMessage('Status desconhecido');
        }
      } else if (response.status === 404) {
        console.log('🔍 [CHECK_STATUS] Instância não encontrada (404)');
        setStatusConexao('closed');
        setStatusMessage('Instância não encontrada');
        setError(undefined);
      } else {
        throw new Error(`API respondeu com status ${response.status}`);
      }
    } catch (err) {
      console.error('🔍 [CHECK_STATUS] Erro:', err);
      setStatusConexao('error');
      setStatusMessage('Erro ao verificar conexão');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const criarInstancia = async () => {
    const nomeClienteTrimmed = nomeCliente.trim();
    
    if (!nomeClienteTrimmed) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do cliente para criar a instância.",
        variant: "destructive",
      });
      return;
    }

    console.log('🔧 [CRIAR_INSTANCIA] Iniciando criação com nome:', nomeClienteTrimmed);
    setIsCreatingInstance(true);
    setError(undefined);
    
    try {
      const requestBody = {
        instanceName: nomeClienteTrimmed,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true,
        rejectCall: true,
        msgCall: "Não aceitamos chamadas.",
        groupsIgnore: true,
        alwaysOnline: true,
        readMessages: true,
        readStatus: true,
        syncFullHistory: true
      };
      
      console.log('🔧 [CRIAR_INSTANCIA] Corpo da requisição:', requestBody);

      const response = await fetch(`${API_BASE}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🔧 [CRIAR_INSTANCIA] Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 [CRIAR_INSTANCIA] Erro da API:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message?.includes('already in use') || errorData.message?.includes('já existe')) {
            console.log('🔧 [CRIAR_INSTANCIA] Instância já existe, definindo instanceId');
            setInstanceId(nomeClienteTrimmed);
            localStorage.setItem('whatsapp_instance_id', nomeClienteTrimmed);
            localStorage.setItem('whatsapp_cliente_nome', nomeClienteTrimmed);
            
            toast({
              title: "Instância já existe",
              description: `Conectando à instância existente: ${nomeClienteTrimmed}`,
            });
            
            setTimeout(() => checkConnectionStatus(), 1000);
            return;
          }
          
          throw new Error(errorData.message || `Erro na API: ${response.status}`);
        } catch {
          throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('🔧 [CRIAR_INSTANCIA] Resposta da API:', data);
      
      const newInstanceId = data.instance?.instanceName || data.instance || data.instanceName || nomeClienteTrimmed;
      
      setInstanceId(newInstanceId);
      
      localStorage.setItem('whatsapp_instance_id', newInstanceId);
      localStorage.setItem('whatsapp_cliente_nome', nomeClienteTrimmed);

      toast({
        title: "Instância criada",
        description: `Instância criada com sucesso. ID: ${newInstanceId}`,
      });
      
      setTimeout(() => checkConnectionStatus(), 2000);
      
    } catch (err) {
      console.error('🔧 [CRIAR_INSTANCIA] Erro:', err);
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

    console.log('📱 [CONECTAR_WHATSAPP] Iniciando conexão para:', targetInstance);
    setIsConnecting(true);
    setQrCode('');
    setError(undefined);
    
    try {
      console.log('📱 [CONECTAR_WHATSAPP] Fazendo requisição para gerar QR Code...');
      const response = await fetch(`${API_BASE}/instance/connect/${targetInstance}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      console.log('📱 [CONECTAR_WHATSAPP] Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📱 [CONECTAR_WHATSAPP] Dados recebidos:', data);
        
        // SOLUÇÃO PARA O PROBLEMA IDENTIFICADO: Tratar resposta {"count": 0}
        if (data.count !== undefined && data.count === 0) {
          console.log('📱 [CONECTAR_WHATSAPP] API retornou count: 0 - Instância precisa ser recriada');
          
          toast({
            title: "Instância inválida",
            description: "A instância está corrompida. Vamos deletá-la e criar uma nova.",
            variant: "destructive",
          });
          
          // Deletar instância atual e criar nova
          await excluirInstancia();
          setTimeout(() => {
            criarInstancia();
          }, 2000);
          
          return;
        }
        
        // Verificar diferentes possíveis estruturas de resposta para QR Code
        let qrCodeData = null;
        
        if (data.qrcode) {
          qrCodeData = data.qrcode;
        } else if (data.qr) {
          qrCodeData = data.qr;
        } else if (data.base64) {
          qrCodeData = data.base64;
        }
        
        console.log('📱 [CONECTAR_WHATSAPP] QR Code extraído:', qrCodeData ? 'Encontrado' : 'Não encontrado');
        
        if (qrCodeData) {
          // Garantir que o QR code tem o prefixo correto
          if (!qrCodeData.startsWith('data:image/')) {
            qrCodeData = `data:image/png;base64,${qrCodeData}`;
          }
          
          setQrCode(qrCodeData);
          setStatusConexao('connecting');
          setStatusMessage('Escaneie o QR Code com seu WhatsApp');
          toast({
            title: "QR Code gerado",
            description: "Escaneie o QR Code com seu WhatsApp para conectar.",
          });
          
          // Verificar status após 5 segundos
          setTimeout(() => checkConnectionStatus(), 5000);
        } else if (data.message && (data.message.includes('já está conectada') || data.message.includes('already connected'))) {
          toast({
            title: "Já conectado",
            description: data.message,
          });
          setStatusConexao('open');
          setStatusMessage('Conectado');
        } else {
          console.log('📱 [CONECTAR_WHATSAPP] Verificando se já está conectado...');
          await checkConnectionStatus();
          
          if (statusConexao !== 'open') {
            throw new Error('QR Code não foi gerado. A instância pode estar corrompida.');
          }
        }
      } else {
        const errorText = await response.text();
        console.error('📱 [CONECTAR_WHATSAPP] Erro da API:', errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('📱 [CONECTAR_WHATSAPP] Erro:', err);
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
        setInstanceId('');
        setNomeCliente('');
        setQrCode('');
        setStatusConexao('unknown');
        setStatusMessage('');
        setError(undefined);
        
        localStorage.removeItem('whatsapp_instance_id');
        localStorage.removeItem('whatsapp_cliente_nome');
        
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

            {statusConexao !== 'unknown' && (
              <StatusBadge status={statusConexao} message={statusMessage} />
            )}
          </div>

          {instanceId && (
            <div className="space-y-2">
              <Label htmlFor="instanceId" className="text-gray-700 font-medium">
                ID da Instância
              </Label>
              <Input
                id="instanceId"
                value={instanceId}
                readOnly
                className="bg-gray-50 text-gray-600"
              />
            </div>
          )}

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
