
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = 'https://apiwhats.lifecombr.com.br';
const API_KEY = '0417bf43b0a8669bd6635bcb49d783df';

type ConnectionStatus = 'open' | 'closed' | 'error' | 'connecting' | 'unknown';

export function useWhatsAppAPI() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statusConexao, setStatusConexao] = useState<ConnectionStatus>('unknown');
  const [statusMessage, setStatusMessage] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gerar nome único da instância baseado no usuário
  const generateInstanceName = (baseClientName: string) => {
    if (!user?.id) return baseClientName;
    
    // Usar os primeiros 8 caracteres do ID do usuário + nome do cliente
    const userPrefix = user.id.substring(0, 8);
    return `${userPrefix}_${baseClientName.trim()}`;
  };

  const normalizeStatus = (apiStatus: string): ConnectionStatus => {
    const status = apiStatus?.toLowerCase();
    
    if (status === 'open' || status === 'connected') return 'open';
    if (status === 'connecting' || status === 'qr' || status === 'qrcode') return 'connecting';
    if (status === 'closed' || status === 'disconnected' || status === 'close') return 'closed';
    if (status === 'error' || status === 'failed') return 'error';
    
    return 'unknown';
  };

  const checkConnectionStatus = async (baseInstanceName: string) => {
    if (!baseInstanceName || !user?.id) return;

    const instanceName = generateInstanceName(baseInstanceName);

    try {
      console.log(`🔍 Verificando status da instância do usuário ${user.email}: ${instanceName}`);
      
      const response = await fetch(`${API_BASE}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        const apiStatus = data.instance?.state || data.state || 'unknown';
        const normalizedStatus = normalizeStatus(apiStatus);
        
        console.log(`📊 Status atual para ${user.email}: ${apiStatus} -> ${normalizedStatus}`);
        
        // Só atualiza se o status mudou
        if (statusConexao !== normalizedStatus) {
          setStatusConexao(normalizedStatus);
          
          if (normalizedStatus === 'open') {
            setStatusMessage('WhatsApp conectado e funcionando');
            setError(undefined);
            setQrCode('');
            toast({
              title: "WhatsApp Conectado! 🎉",
              description: "Sua instância do WhatsApp está conectada e funcionando.",
            });
          } else if (normalizedStatus === 'connecting') {
            setStatusMessage('Aguardando leitura do QR Code');
          } else if (normalizedStatus === 'closed') {
            setStatusMessage('WhatsApp desconectado');
            setQrCode('');
          } else if (normalizedStatus === 'error') {
            setStatusMessage('Erro na conexão com WhatsApp');
            setError('Problemas na conexão com WhatsApp');
          } else {
            setStatusMessage('Status desconhecido');
          }
        }
      } else if (response.status === 404) {
        if (statusConexao !== 'closed') {
          setStatusConexao('closed');
          setStatusMessage('Instância não encontrada');
          setError(undefined);
          setQrCode('');
        }
      } else {
        throw new Error(`API respondeu com status ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Erro ao verificar status:', err);
      if (statusConexao !== 'error') {
        setStatusConexao('error');
        setStatusMessage('Erro ao verificar conexão');
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    }
  };

  const createInstance = async (nomeCliente: string) => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      throw new Error("Usuário não autenticado");
    }

    const nomeClienteTrimmed = nomeCliente.trim();
    
    if (!nomeClienteTrimmed) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do cliente para criar a instância.",
        variant: "destructive",
      });
      throw new Error("Nome obrigatório");
    }

    const instanceName = generateInstanceName(nomeClienteTrimmed);
    setError(undefined);
    
    try {
      console.log(`🔨 Criando instância para ${user.email}: ${instanceName}`);
      
      const requestBody = {
        instanceName: instanceName,
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

      const response = await fetch(`${API_BASE}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message?.includes('already in use') || errorData.message?.includes('já existe')) {
            toast({
              title: "Instância já existe",
              description: `Conectando à sua instância existente.`,
            });
            return instanceName;
          }
          
          throw new Error(errorData.message || `Erro na API: ${response.status}`);
        } catch {
          throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      
      toast({
        title: "Instância criada",
        description: `Sua instância foi criada com sucesso.`,
      });
      
      return instanceName;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao criar instância",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const connectWhatsApp = async (baseInstanceName: string) => {
    if (!baseInstanceName || !user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou instância inválida.",
        variant: "destructive",
      });
      throw new Error("Usuário não autenticado ou instância inválida");
    }

    const instanceName = generateInstanceName(baseInstanceName);
    setQrCode('');
    setError(undefined);
    
    try {
      console.log(`🔗 Conectando instância do usuário ${user.email}: ${instanceName}`);
      
      const response = await fetch(`${API_BASE}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      const responseText = await response.text();
      
      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          throw new Error(`Resposta inválida da API: ${responseText}`);
        }
        
        let qrCodeData = data.qrcode || data.qr || data.base64;
        
        if (qrCodeData) {
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
          
          return qrCodeData;
        } else if (data.message && (data.message.includes('já está conectada') || data.message.includes('already connected'))) {
          toast({
            title: "Já conectado",
            description: "Seu WhatsApp já está conectado.",
          });
          setStatusConexao('open');
          setStatusMessage('WhatsApp já está conectado');
          return null;
        } else {
          throw new Error(`QR Code não foi gerado. Resposta da API: ${JSON.stringify(data)}`);
        }
      } else {
        throw new Error(`Erro na API: ${response.status} - ${responseText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao conectar",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const disconnect = async (baseInstanceName: string) => {
    if (!baseInstanceName || !user?.id) return;
    
    const instanceName = generateInstanceName(baseInstanceName);
    
    try {
      console.log(`🔌 Desconectando instância do usuário ${user.email}: ${instanceName}`);
      
      const response = await fetch(`${API_BASE}/instance/logout/${instanceName}`, {
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
          description: "Sua instância foi desconectada com sucesso.",
        });
      } else {
        throw new Error(`Erro na API: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao desconectar",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteInstance = async (baseInstanceName: string) => {
    if (!baseInstanceName || !user?.id) return;
    
    const instanceName = generateInstanceName(baseInstanceName);
    
    try {
      console.log(`🗑️ Excluindo instância do usuário ${user.email}: ${instanceName}`);
      
      const response = await fetch(`${API_BASE}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY
        }
      });

      if (response.ok) {
        setQrCode('');
        setStatusConexao('unknown');
        setStatusMessage('');
        setError(undefined);
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        toast({
          title: "Instância excluída",
          description: "Sua instância foi excluída com sucesso.",
        });
      } else {
        throw new Error(`Erro na API: ${response.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao excluir",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const startPeriodicCheck = (baseInstanceName: string) => {
    if (!user?.id) return;
    
    console.log(`🔄 Iniciando verificação periódica para usuário ${user.email}: ${baseInstanceName}`);
    
    // Limpa qualquer intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Verifica imediatamente
    checkConnectionStatus(baseInstanceName);
    
    // Configura verificação a cada 5 segundos quando conectando, 15 segundos quando conectado
    const getInterval = () => statusConexao === 'connecting' ? 5000 : 15000;
    
    intervalRef.current = setInterval(() => {
      checkConnectionStatus(baseInstanceName);
    }, getInterval());
  };

  const stopPeriodicCheck = () => {
    console.log('⏹️ Parando verificação periódica');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    statusConexao,
    statusMessage,
    qrCode,
    error,
    checkConnectionStatus,
    createInstance,
    connectWhatsApp,
    disconnect,
    deleteInstance,
    startPeriodicCheck,
    stopPeriodicCheck
  };
}
