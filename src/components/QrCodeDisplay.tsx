
import { QrCode, RefreshCw, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrCodeDisplayProps {
  qrCodeData: string | null;
  isLoading: boolean;
  error?: string;
  message?: string;
  onCancel?: () => void;
}

const QrCodeDisplay = ({ qrCodeData, isLoading, error, message, onCancel }: QrCodeDisplayProps) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-12 text-center border border-blue-200">
        <RefreshCw className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
        <p className="text-blue-700 text-lg mb-2 font-medium">Gerando QR Code...</p>
        <p className="text-blue-600 text-sm">Aguarde um momento enquanto conectamos</p>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="mt-4">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-12 text-center border border-red-200">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 text-lg mb-2 font-medium">Erro ao gerar QR Code</p>
        <p className="text-red-600 text-sm">{error}</p>
        <p className="text-red-500 text-xs mt-2">Tente novamente em alguns segundos</p>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="mt-4">
            <X className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
      </div>
    );
  }

  if (message) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-12 text-center border border-green-200">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <p className="text-green-700 text-lg mb-2 font-medium">WhatsApp Conectado</p>
        <p className="text-green-600 text-sm">{message}</p>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="mt-4">
            <X className="h-4 w-4 mr-2" />
            Continuar
          </Button>
        )}
      </div>
    );
  }

  if (qrCodeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          {onCancel && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Conectar WhatsApp</h2>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-100 mb-6">
            <img
              src={qrCodeData}
              alt="QR Code WhatsApp"
              className="w-64 h-64 mx-auto rounded-lg"
            />
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700 font-medium">
              Escaneie este código com seu WhatsApp
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-700 text-sm space-y-2">
                <p className="font-medium">📱 Como conectar:</p>
                <ol className="text-left space-y-1 text-xs">
                  <li>1. Abra o WhatsApp no seu celular</li>
                  <li>2. Toque nos três pontos (⋮) → "Dispositivos conectados"</li>
                  <li>3. Toque em "Conectar um dispositivo"</li>
                  <li>4. Aponte a câmera para este QR Code</li>
                </ol>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-700 text-xs flex items-center justify-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                O QR Code expira em alguns minutos. Se não funcionar, gere um novo.
              </p>
            </div>

            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="w-full mt-4">
                <X className="h-4 w-4 mr-2" />
                Cancelar Conexão
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-12 text-center border border-dashed border-gray-300">
      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 text-lg mb-2">Nenhum QR Code gerado</p>
      <p className="text-gray-500 text-sm">
        Clique em "Conectar WhatsApp" para gerar o QR Code
      </p>
      {onCancel && (
        <Button variant="outline" onClick={onCancel} className="mt-4">
          <X className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      )}
    </div>
  );
};

export default QrCodeDisplay;
