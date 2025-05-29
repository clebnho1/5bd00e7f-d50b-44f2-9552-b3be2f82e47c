
import { QrCode, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface QrCodeDisplayProps {
  qrCodeData: string | null;
  isLoading: boolean;
  error?: string;
  message?: string;
}

const QrCodeDisplay = ({ qrCodeData, isLoading, error, message }: QrCodeDisplayProps) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-12 text-center border border-blue-200">
        <RefreshCw className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
        <p className="text-blue-700 text-lg mb-2 font-medium">Gerando QR Code...</p>
        <p className="text-blue-600 text-sm">Aguarde um momento enquanto conectamos</p>
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
      </div>
    );
  }

  if (message) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-12 text-center border border-green-200">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <p className="text-green-700 text-lg mb-2 font-medium">WhatsApp Conectado</p>
        <p className="text-green-600 text-sm">{message}</p>
      </div>
    );
  }

  if (qrCodeData) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-6 text-center border border-gray-200">
        <div className="bg-white p-4 rounded-lg shadow-sm inline-block">
          <img
            src={qrCodeData}
            alt="QR Code WhatsApp"
            className="w-64 h-64 mx-auto rounded-lg"
          />
        </div>
        <p className="text-gray-700 mt-4 text-sm font-medium">
          Escaneie este código com seu WhatsApp para conectar
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
          <p className="text-orange-700 text-xs flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            O QR Code expira em alguns minutos. Se não funcionar, gere um novo.
          </p>
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
    </div>
  );
};

export default QrCodeDisplay;
