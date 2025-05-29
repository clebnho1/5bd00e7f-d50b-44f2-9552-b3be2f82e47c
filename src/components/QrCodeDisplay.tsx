
import { QrCode, RefreshCw } from 'lucide-react';

interface QrCodeDisplayProps {
  qrCodeData: string | null;
  isLoading: boolean;
  error?: string;
  message?: string;
}

const QrCodeDisplay = ({ qrCodeData, isLoading, error, message }: QrCodeDisplayProps) => {
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center border border-dashed border-gray-300">
        <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600 text-lg mb-2">Gerando QR Code...</p>
        <p className="text-gray-500 text-sm">Aguarde um momento</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-12 text-center border border-red-200">
        <QrCode className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 text-lg mb-2">Erro ao gerar QR Code</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="bg-green-50 rounded-lg p-12 text-center border border-green-200">
        <QrCode className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <p className="text-green-600 text-lg mb-2">WhatsApp Conectado</p>
        <p className="text-green-500 text-sm">{message}</p>
      </div>
    );
  }

  if (qrCodeData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center border">
        <img
          src={qrCodeData}
          alt="QR Code WhatsApp"
          className="w-64 h-64 mx-auto border border-gray-200 rounded-lg shadow-sm"
        />
        <p className="text-gray-600 mt-4 text-sm">
          Escaneie este código com seu WhatsApp para conectar
        </p>
        <p className="text-orange-600 text-xs mt-2">
          ⚠️ O QR Code tem tempo limitado. Se expirar, clique em "Conectar WhatsApp" novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-12 text-center border border-dashed border-gray-300">
      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 text-lg mb-2">Nenhum QR Code gerado</p>
      <p className="text-gray-500 text-sm">
        Clique em "Conectar WhatsApp" para gerar o QR Code
      </p>
    </div>
  );
};

export default QrCodeDisplay;
