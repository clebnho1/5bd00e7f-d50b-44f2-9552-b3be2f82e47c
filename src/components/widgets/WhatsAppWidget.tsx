
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, QrCode, Settings, ArrowLeft } from 'lucide-react';
import { useWhatsAppInstance } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function WhatsAppWidget() {
  const { instance, loading, saveInstance } = useWhatsAppInstance();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [instanceName, setInstanceName] = useState('');

  useEffect(() => {
    if (instance) {
      setInstanceName(instance.nome_empresa);
    }
  }, [instance]);

  const criarInstancia = async () => {
    if (!instanceName.trim()) {
      return;
    }

    setIsCreating(true);
    
    try {
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

      await saveInstance({
        nome_empresa: instanceName.trim(),
        status: 'criado',
        qr_code: null
      });

      toast({
        title: "Instância criada",
        description: "Instância WhatsApp criada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast({
        title: "Erro ao criar instância",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const gerarQRCode = async () => {
    if (!instance) return;

    setIsGeneratingQR(true);
    
    try {
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
      
      await saveInstance({
        nome_empresa: instance.nome_empresa,
        status: 'aguardando_conexao',
        qr_code: apiData.qrCode || apiData.qr_code || apiData.base64 || null,
        ultima_verificacao: new Date().toISOString()
      });

      toast({
        title: "QR Code gerado",
        description: "QR Code gerado com sucesso. Escaneie com seu WhatsApp.",
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-800">WhatsApp</h1>
      </div>

      <p className="text-gray-600 mb-8">Gerencie sua conexão com WhatsApp</p>

      {/* Card de Configuração */}
      <Card className="bg-green-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5" />
            Configuração
          </CardTitle>
          <CardDescription className="text-green-100">
            Configure sua instância do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instanceName" className="text-white">Nome da Instância</Label>
            <div className="flex gap-2">
              <Input
                id="instanceName"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="Digite o nome da sua instância"
                className="bg-white text-gray-900 border-0 flex-1"
                disabled={!!instance}
              />
              {!instance ? (
                <Button
                  onClick={criarInstancia}
                  disabled={isCreating || !instanceName.trim()}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8"
                >
                  {isCreating ? "Criando..." : "Salvar"}
                </Button>
              ) : (
                <Button
                  onClick={gerarQRCode}
                  disabled={isGeneratingQR}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8"
                >
                  {isGeneratingQR ? "Gerando..." : "Gerar QR Code"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card do QR Code */}
      <Card className="bg-green-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <QrCode className="h-5 w-5" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {instance?.qr_code ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <img
                src={instance.qr_code}
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
                {!instance 
                  ? 'Crie uma instância primeiro para gerar o QR Code'
                  : 'Clique em "Gerar QR Code" para conectar sua instância'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
