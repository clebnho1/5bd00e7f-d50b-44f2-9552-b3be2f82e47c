
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'open' | 'closed' | 'error' | 'connecting' | 'unknown';
  message?: string;
}

const StatusBadge = ({ status, message }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
      case 'connected':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          text: 'Conectado'
        };
      case 'connecting':
      case 'qr':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Conectando'
        };
      case 'closed':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Desconectado'
        };
      case 'error':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          text: 'Erro'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          text: 'Desconhecido'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex flex-col items-end gap-1">
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
      {message && (
        <p className="text-xs text-gray-500 max-w-xs text-right">{message}</p>
      )}
    </div>
  );
};

export default StatusBadge;
