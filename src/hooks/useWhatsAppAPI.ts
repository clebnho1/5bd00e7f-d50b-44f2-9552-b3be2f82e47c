
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_BASE = 'https://apiwhats.lifecombr.com.br';
const API_KEY = '0417bf43b0a8669bd6635bcb49d783df';

type ConnectionStatus = 'open' | 'closed' | 'error' | 'connecting' | 'unknown';

export function useWhatsAppAPI() {
  const { toast } = useToast();
  const [statusConexao, setStatusConexao] = useState<ConnectionStatus>('unknown');
  const [statusMessage, setStatusMessage] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const normalizeStatus = (apiStatus: string): ConnectionStatus => {
    const status = apiStatus?.toLowerCase();
    
    if (status === 'open' || status === 'connected') return 'open';
    if (status === 'connecting' || status === 'qr' || status === 'qrcode') return 'connecting';
    if (status === 'closed' || status === 'disconnected') return 'closed';
    if (status === 'error' || status === 'failed') return 'error';
    
    return 'unknown';
  };

  const checkConnectionStatus = async (targetInstance: string) => {
    if (!targetInstance) return;

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
        const apiStatus = data.instance?.state || data.state || 'unknown';
        const normalizedStatus = normalizeStatus(apiStatus);
        
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
        setStatusConexao('closed');
        setStatusMessage('Instância não encontrada');
        setError(undefined);
      } else {
        throw new Error(`API respondeu com status ${response.status}`);
      }
    } catch (err) {
      setStatusConexao('error');
      setStatusMessage('Erro ao verificar conexão');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const createInstance = async (nomeCliente: string) => {
    const nomeClienteTrimmed = nomeCliente.trim();
    
    if (!nomeClienteTrimmed) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do cliente para criar a instância.",
        variant: "destructive",
      });
      throw new Error("Nome obrigatório");
    }

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
              description: `Conectando à instância existente: ${nomeClienteTrimmed}`,
            });
            return nomeClienteTrimmed;
          }
          
          throw new Error(errorData.message || `Erro na API: ${response.status}`);
        } catch {
          throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      const newInstanceId = data.instance?.instanceName || data.instance || data.instanceName || nomeClienteTrimmed;
      
      toast({
        title: "Instância criada",
        description: `Instância criada com sucesso. ID: ${newInstanceId}`,
      });
      
      return newInstanceId;
      
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

  const connectWhatsApp = async (targetInstance: string) => {
    if (!targetInstance) {
      toast({
        title: "Instância necessária",
        description: "Crie uma instância primeiro ou digite um nome válido.",
        variant: "destructive",
      });
      throw new Error("Instância necessária");
    }

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
            description: data.message,
          });
          setStatusConexao('open');
          setStatusMessage('Conectado');
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

  const disconnect = async (targetInstance: string) => {
    if (!targetInstance) return;
    
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

  const deleteInstance = async (targetInstance: string) => {
    if (!targetInstance) return;
    
    try {
      const response = await fetch(`${API_BASE}/instance/delete/${targetInstance}`, {
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
          description: "A instância foi excluída com sucesso.",
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

  const startPeriodicCheck = (instanceId: string) => {
    if (instanceId && statusConexao === 'open') {
      intervalRef.current = setInterval(() => checkConnectionStatus(instanceId), 10000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stopPeriodicCheck = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
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
