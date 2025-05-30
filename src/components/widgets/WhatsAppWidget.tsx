
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Settings, ArrowLeft, User, AlertTriangle, Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QrCodeDisplay from '@/components/QrCodeDisplay';
import { WhatsAppConnectionForm } from './WhatsApp/WhatsAppConnectionForm';
import { WhatsAppActions } from './WhatsApp/WhatsAppActions';
import { useWhatsAppAPI } from '@/hooks/useWhatsAppAPI';
import { useWhatsAppState } from '@/hooks/useWhatsAppState';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function WhatsAppWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
    connecting,
    apiStatus,
    checkApiHealth
  } = useWhatsAppAPI();

  const {
    nomeCliente,
    setNomeCliente,
    instanceId,
    setInstanceId,
    saveToLocalStorage,
    clearLocalStorage
  } = useWhatsAppState();

  // Mapear os dados da instância para compatibilidade
  const statusConexao = instance?.status === 'conectado' ? 'open' : 
                       instance?.status === 'conectando' ? 'connecting' :
                       instance?.status === 'erro' ? 'error' : 'closed';
  
  const getStatusMessage = () => {
    if (!instance) return 'Nenhuma instância encontrada';
    
    const baseMessage = `Cliente: ${instance.nome_empresa}`;
    
    switch (instance.status) {
      case 'conectado':
        return `✅ Conectado | ${baseMessage}`;
      case 'conectando':
        return `🔄 Conectando | ${baseMessage} | Aguardando scan do QR Code`;
      case 'erro':
        return `❌ Erro na conexão | ${baseMessage}`;
      case 'desconectado':
        return `⚪ Desconectado | ${baseMessage}`;
      default:
        return `Status: ${instance.status} | ${baseMessage}`;
    }
  };
  
  const qrCode = instance?.qr_code || '';
  const error = instance?.status === 'erro' ? 'Erro na conexão' : null;

  // Sincronizar dados da instância com o estado local
  useEffect(() => {
    if (instance) {
      console.log('🔄 Sincronizando dados da instância:', instance);
      
      if (instance.id !== instanceId) {
        setInstanceId(instance.id);
      }
      
      if (instance.nome_empresa && instance.nome_empresa !== nomeCliente) {
        console.log('📝 Atualizando nome do cliente para:', instance.nome_empresa);
        setNomeCliente(instance.nome_empresa);
      }
    }
  }, [instance, instanceId, nomeCliente, setInstanceId, setNomeCliente]);

  const handleCheckStatus = async () => {
    console.log('🔍 Verificando status da instância...');
    setIsCheckingStatus(true);
    try {
      await Promise.all([
        refetch(),
        checkApiHealth()
      ]);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCreateInstance = async () => {
    if (!nomeCliente.trim()) {
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

    console.log('📱 Iniciando processo de conexão para:', instance.nome_empresa);
    setIsConnecting(true);
    try {
      const result = await connectWhatsApp();
      if (result) {
        console.log('✅ Processo de conexão iniciado - QR Code será gerado');
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
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
        <h1 className="text-2xl font-bold text-gray-800">WhatsApp Pessoal</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          <User className="h-4 w-4" />
          {user.email}
        </div>
        
        {/* Status da API com botão de refresh */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full ${
            apiStatus === 'online' ? 'bg-green-100 text-green-800' : 
            apiStatus === 'offline' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {apiStatus === 'online' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            API {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Verificando...'}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkApiHealth}
            className="h-6 w-6 p-0"
            title="Verificar API"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Alert da API Offline */}
      {apiStatus === 'offline' && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-medium">Evolution API Temporariamente Indisponível</h3>
            </div>
            <p className="text-orange-700 text-sm mb-3">
              A API externa está offline. Você pode visualizar instâncias existentes, mas não conectar ou criar novas até a API voltar.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkApiHealth}
              className="text-orange-800 border-orange-300 hover:bg-orange-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar API Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fluxo de Conexão Melhorado */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-blue-800 mb-4">
            <QrCode className="h-5 w-5" />
            <h3 className="font-medium">Fluxo de Conexão WhatsApp</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div className={`text-center p-3 rounded-lg transition-all ${
              !instance ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-400' : 'bg-green-100 text-green-800'
            }`}>
              <div className="font-medium">1. Criar Instância</div>
              <div className="text-xs mt-1">Nome do cliente</div>
              {!instance && <div className="text-xs mt-1 font-bold">← Você está aqui</div>}
            </div>
            <div className={`text-center p-3 rounded-lg transition-all ${
              instance && statusConexao === 'connecting' ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-400' : 
              instance ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className="font-medium">2. Conectar</div>
              <div className="text-xs mt-1">Iniciar conexão</div>
              {instance && statusConexao !== 'connecting' && statusConexao !== 'open' && (
                <div className="text-xs mt-1 font-bold">← Você está aqui</div>
              )}
            </div>
            <div className={`text-center p-3 rounded-lg transition-all ${
              statusConexao === 'connecting' && qrCode ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-400' : 
              statusConexao === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className="font-medium">3. Gerar QR</div>
              <div className="text-xs mt-1">QR Code criado</div>
              {statusConexao === 'connecting' && !qrCode && (
                <div className="text-xs mt-1 font-bold">← Gerando...</div>
              )}
            </div>
            <div className={`text-center p-3 rounded-lg transition-all ${
              statusConexao === 'connecting' && qrCode ? 'bg-yellow-200 text-yellow-900 ring-2 ring-yellow-400' : 
              statusConexao === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className="font-medium">4. Aguardar Scan</div>
              <div className="text-xs mt-1">Escaneie o QR</div>
              {statusConexao === 'connecting' && qrCode && (
                <div className="text-xs mt-1 font-bold">← Escaneie agora!</div>
              )}
            </div>
            <div className={`text-center p-3 rounded-lg transition-all ${
              statusConexao === 'open' ? 'bg-green-200 text-green-900 ring-2 ring-green-400' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className="font-medium">5. Conectado</div>
              <div className="text-xs mt-1">Pronto para usar</div>
              {statusConexao === 'open' && (
                <div className="text-xs mt-1 font-bold">✅ Concluído!</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Principal */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Settings className="h-5 w-5" />
            Configuração da Instância WhatsApp
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure e gerencie sua instância WhatsApp pessoal seguindo o fluxo: criar → conectar → QR → scan → conectado
            {apiStatus === 'offline' && <span className="text-orange-600 font-medium"> (API offline - funcionalidade limitada)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <WhatsAppConnectionForm
            nomeCliente={nomeCliente}
            setNomeCliente={setNomeCliente}
            instanceId={instanceId}
            statusConexao={statusConexao}
            statusMessage={getStatusMessage()}
            isCreatingInstance={isCreatingInstance}
            isCheckingStatus={isCheckingStatus}
            onCreateInstance={handleCreateInstance}
            onCheckStatus={handleCheckStatus}
            apiStatus={apiStatus}
          />

          {instanceId && (
            <div className="space-y-2">
              <Label htmlFor="instanceId" className="text-gray-700 font-medium">
                ID da Instância
              </Label>
              <Input
                id="instanceId"
                value={instanceId}
                readOnly
                className="bg-gray-50 text-gray-600 font-mono text-xs"
              />
              <p className="text-xs text-gray-500">
                Instância para o cliente: {instance?.nome_empresa || nomeCliente}
                {apiStatus === 'offline' && <span className="text-orange-600"> (API offline)</span>}
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
            apiStatus={apiStatus}
          />
        </CardContent>
      </Card>

      {/* Card do QR Code Melhorado */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <QrCode className="h-5 w-5" />
            QR Code para Conexão
            {statusConexao === 'connecting' && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            )}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {apiStatus === 'offline' ? 
              'API offline - QR Code não disponível no momento.' :
              statusConexao === 'connecting' && qrCode
                ? '📱 QR Code gerado! Abra o WhatsApp, vá em "Dispositivos conectados" e escaneie este código.'
                : statusConexao === 'open'
                ? '✅ WhatsApp conectado! Para reconectar, desconecte primeiro e conecte novamente.'
                : statusConexao === 'connecting'
                ? '🔄 Gerando QR Code... aguarde alguns segundos.'
                : 'Clique em "Conectar WhatsApp" para gerar o QR Code'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QrCodeDisplay 
            qrCodeData={qrCode} 
            isLoading={isConnecting || connecting || (statusConexao === 'connecting' && !qrCode)} 
            error={error || (apiStatus === 'offline' ? 'API offline - QR Code indisponível' : undefined)}
            message={statusConexao === 'open' ? 'WhatsApp conectado com sucesso! 🎉' : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
