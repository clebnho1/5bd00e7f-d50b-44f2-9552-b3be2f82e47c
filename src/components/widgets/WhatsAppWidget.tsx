
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Settings, ArrowLeft, User, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QrCodeDisplay from '@/components/QrCodeDisplay';
import { WhatsAppConnectionForm } from './WhatsApp/WhatsAppConnectionForm';
import { WhatsAppActions } from './WhatsApp/WhatsAppActions';
import { useWhatsAppAPI } from '@/hooks/useWhatsAppAPI';
import { useWhatsAppState } from '@/hooks/useWhatsAppState';
import { useAuth } from '@/contexts/AuthContext';

export function WhatsAppWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const {
    instance,
    createInstance,
    connectWhatsApp,
    disconnectWhatsApp,
    deleteInstance,
    refetch,
    loading,
    connecting
  } = useWhatsAppAPI();

  const {
    nomeCliente,
    setNomeCliente,
    instanceId,
    setInstanceId,
    saveToLocalStorage,
    clearLocalStorage,
    debouncedStatusCheck
  } = useWhatsAppState();

  // Mapear os dados da instância para compatibilidade com os componentes
  const statusConexao = instance?.status === 'conectado' ? 'open' : 
                       instance?.status === 'conectando' ? 'connecting' :
                       instance?.status === 'erro' ? 'error' : 'closed';
  
  const statusMessage = instance ? 
    `Status: ${instance.status} | Nome: ${instance.nome_empresa}` : 
    'Nenhuma instância encontrada';
  
  const qrCode = instance?.qr_code || '';
  const error = instance?.status === 'erro' ? 'Erro na conexão' : null;
  const isAPIHealthy = true;

  // Sincronizar dados da instância com o estado local
  useEffect(() => {
    if (instance) {
      console.log('🔄 Sincronizando dados da instância:', instance);
      
      // Atualizar instanceId se diferente
      if (instance.id !== instanceId) {
        setInstanceId(instance.id);
      }
      
      // Atualizar nome do cliente com o nome salvo na instância
      if (instance.nome_empresa && instance.nome_empresa !== nomeCliente) {
        console.log('📝 Atualizando nome do cliente de', nomeCliente, 'para', instance.nome_empresa);
        setNomeCliente(instance.nome_empresa);
      }
    }
  }, [instance, instanceId, nomeCliente, setInstanceId, setNomeCliente]);

  const handleCheckStatus = async () => {
    console.log('🔍 Verificando status da instância...');
    setIsCheckingStatus(true);
    try {
      await refetch();
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCreateInstance = async () => {
    if (!nomeCliente.trim()) {
      console.error('❌ Nome do cliente é obrigatório');
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite o nome do cliente",
        variant: "destructive",
      });
      return;
    }

    console.log('🏗️ Criando instância para o cliente:', nomeCliente.trim());
    setIsCreatingInstance(true);
    try {
      const newInstance = await createInstance(nomeCliente.trim());
      if (newInstance) {
        console.log('✅ Instância criada com sucesso para:', newInstance.nome_empresa);
        setInstanceId(newInstance.id);
        saveToLocalStorage(newInstance.id, newInstance.nome_empresa);
        setTimeout(() => handleCheckStatus(), 2000);
      }
    } finally {
      setIsCreatingInstance(false);
    }
  };

  const handleConnect = async () => {
    if (!instance) {
      console.error('❌ Nenhuma instância para conectar');
      return;
    }

    console.log('📱 Iniciando conexão WhatsApp para cliente:', instance.nome_empresa);
    setIsConnecting(true);
    try {
      const result = await connectWhatsApp();
      if (result) {
        console.log('✅ Processo de conexão iniciado com sucesso');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    console.log('🔌 Desconectando WhatsApp para:', instance?.nome_empresa);
    setIsDisconnecting(true);
    try {
      const result = await disconnectWhatsApp();
      if (result) {
        console.log('✅ WhatsApp desconectado');
        // Não limpar os dados, apenas desconectar
        setTimeout(() => handleCheckStatus(), 1000);
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleDelete = async () => {
    console.log('🗑️ Deletando instância do cliente:', instance?.nome_empresa);
    setIsDeleting(true);
    try {
      const result = await deleteInstance();
      if (result) {
        // Limpar tudo após deletar
        setInstanceId('');
        setNomeCliente('');
        clearLocalStorage();
        console.log('✅ Instância deletada e estado limpo');
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

      {/* Status da API */}
      {!isAPIHealthy && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">Servidor temporariamente com problemas</p>
            </div>
            <p className="text-orange-700 text-sm mt-1">
              O servidor do WhatsApp está com instabilidade. As verificações foram reduzidas automaticamente.
            </p>
          </CardContent>
        </Card>
      )}

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
                Esta é sua instância privada, isolada de outros usuários: {instance?.nome_empresa || nomeCliente}
              </p>
            </div>
          )}

          <WhatsAppActions
            isConnecting={isConnecting || connecting}
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
            {statusConexao === 'connecting'
              ? 'QR Code gerado! Escaneie com seu WhatsApp para conectar.'
              : statusConexao === 'open'
              ? 'WhatsApp conectado! Para reconectar, desconecte primeiro e conecte novamente.'
              : 'Clique em "Conectar WhatsApp" para gerar o QR Code'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QrCodeDisplay 
            qrCodeData={qrCode} 
            isLoading={isConnecting || connecting} 
            error={error}
            message={statusConexao === 'open' ? 'Seu WhatsApp conectado com sucesso! ✅' : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
