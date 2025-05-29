
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Settings, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QrCodeDisplay from '@/components/QrCodeDisplay';
import { WhatsAppConnectionForm } from './WhatsApp/WhatsAppConnectionForm';
import { WhatsAppActions } from './WhatsApp/WhatsAppActions';
import { useWhatsAppAPI } from '@/hooks/useWhatsAppAPI';
import { useAuth } from '@/hooks/useAuth';

export function WhatsAppWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [nomeCliente, setNomeCliente] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const {
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
  } = useWhatsAppAPI();

  // Carregar dados salvos do localStorage específicos do usuário
  useEffect(() => {
    if (!user?.id) return;
    
    const userKey = `whatsapp_${user.id}`;
    const savedInstanceId = localStorage.getItem(`${userKey}_instance_id`);
    const savedNomeCliente = localStorage.getItem(`${userKey}_cliente_nome`);
    
    if (savedInstanceId) {
      setInstanceId(savedInstanceId);
    }
    if (savedNomeCliente) {
      setNomeCliente(savedNomeCliente);
    }
  }, [user?.id]);

  // Auto-verificação quando o nome da instância muda
  useEffect(() => {
    if (nomeCliente.trim().length > 2) {
      const timer = setTimeout(() => {
        handleCheckStatus();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [nomeCliente]);

  // Verificar status da conexão periodicamente quando tiver instância
  useEffect(() => {
    const targetInstance = instanceId || nomeCliente.trim();
    
    if (targetInstance && user?.id) {
      console.log(`🎯 Iniciando monitoramento para usuário ${user.email}: ${targetInstance}`);
      startPeriodicCheck(targetInstance);
    } else {
      stopPeriodicCheck();
    }
    
    return () => stopPeriodicCheck();
  }, [instanceId, nomeCliente, user?.id]);

  const handleCheckStatus = async () => {
    const targetInstance = instanceId || nomeCliente.trim();
    if (!targetInstance) return;

    setIsCheckingStatus(true);
    try {
      await checkConnectionStatus(targetInstance);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCreateInstance = async () => {
    setIsCreatingInstance(true);
    try {
      const newInstanceId = await createInstance(nomeCliente);
      setInstanceId(newInstanceId);
      
      if (user?.id) {
        const userKey = `whatsapp_${user.id}`;
        localStorage.setItem(`${userKey}_instance_id`, newInstanceId);
        localStorage.setItem(`${userKey}_cliente_nome`, nomeCliente.trim());
      }
      
      setTimeout(() => handleCheckStatus(), 2000);
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const handleConnect = async () => {
    // Usar instanceId se disponível, senão usar nomeCliente
    const targetInstance = instanceId || nomeCliente.trim();
    setIsConnecting(true);
    try {
      await connectWhatsApp(targetInstance);
      setTimeout(() => handleCheckStatus(), 5000);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const targetInstance = instanceId || nomeCliente.trim();
    setIsDisconnecting(true);
    try {
      await disconnect(targetInstance);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleDelete = async () => {
    const targetInstance = instanceId || nomeCliente.trim();
    setIsDeleting(true);
    try {
      await deleteInstance(targetInstance);
      setInstanceId('');
      setNomeCliente('');
      
      if (user?.id) {
        const userKey = `whatsapp_${user.id}`;
        localStorage.removeItem(`${userKey}_instance_id`);
        localStorage.removeItem(`${userKey}_cliente_nome`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-800">Seu WhatsApp Pessoal</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          <User className="h-4 w-4" />
          {user.email}
        </div>
      </div>

      {/* Card Principal */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Settings className="h-5 w-5" />
            Sua Instância WhatsApp Privada
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure e gerencie sua instância WhatsApp pessoal. Cada usuário tem sua própria instância isolada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WhatsAppConnectionForm
            nomeCliente={nomeCliente}
            setNomeCliente={setNomeCliente}
            instanceId={instanceId}
            statusConexao={statusConexao}
            statusMessage={statusMessage}
            isCreatingInstance={isCreatingInstance}
            isCheckingStatus={isCheckingStatus}
            onCreateInstance={handleCreateInstance}
            onCheckStatus={handleCheckStatus}
          />

          {instanceId && (
            <div className="space-y-2">
              <Label htmlFor="instanceId" className="text-gray-700 font-medium">
                ID da Sua Instância
              </Label>
              <Input
                id="instanceId"
                value={instanceId}
                readOnly
                className="bg-gray-50 text-gray-600 font-mono text-xs"
              />
              <p className="text-xs text-gray-500">
                Esta é sua instância privada, isolada de outros usuários
              </p>
            </div>
          )}

          <WhatsAppActions
            isConnecting={isConnecting}
            isDisconnecting={isDisconnecting}
            isDeleting={isDeleting}
            instanceId={instanceId}
            nomeCliente={nomeCliente}
            statusConexao={statusConexao}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <QrCode className="h-5 w-5" />
            QR Code para Conexão
          </CardTitle>
          <CardDescription className="text-gray-600">
            {statusConexao === 'open' 
              ? 'Seu WhatsApp está conectado! Não é necessário escanear o QR Code.'
              : 'Escaneie o código QR com seu WhatsApp para conectar sua instância privada'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QrCodeDisplay 
            qrCodeData={qrCode} 
            isLoading={isConnecting} 
            error={error}
            message={statusConexao === 'open' ? 'Seu WhatsApp conectado com sucesso! ✅' : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
