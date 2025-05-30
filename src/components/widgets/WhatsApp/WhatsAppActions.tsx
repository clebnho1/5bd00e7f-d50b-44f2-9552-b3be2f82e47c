
import { Button } from '@/components/ui/button';
import { MessageCircle, LogOut, Trash2 } from 'lucide-react';

interface WhatsAppActionsProps {
  isConnecting: boolean;
  isDisconnecting: boolean;
  isDeleting: boolean;
  instanceId: string;
  nomeCliente: string;
  statusConexao: 'open' | 'closed' | 'error' | 'connecting' | 'unknown';
  onConnect: () => void;
  onDisconnect: () => void;
  onDelete: () => void;
}

export function WhatsAppActions({
  isConnecting,
  isDisconnecting,
  isDeleting,
  instanceId,
  nomeCliente,
  statusConexao,
  onConnect,
  onDisconnect,
  onDelete
}: WhatsAppActionsProps) {
  const hasInstance = instanceId || nomeCliente.trim();

  return (
    <div className="flex gap-3 pt-4">
      <Button
        onClick={onConnect}
        disabled={isConnecting || !hasInstance || statusConexao === 'open'}
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {isConnecting ? "Conectando..." : "Conectar WhatsApp"}
      </Button>
      
      <Button
        onClick={onDisconnect}
        disabled={isDisconnecting || !hasInstance || statusConexao !== 'open'}
        variant="outline"
        className="flex-1"
      >
        <LogOut className="h-4 w-4 mr-2" />
        {isDisconnecting ? "Desconectando..." : "Desconectar"}
      </Button>
      
      <Button
        onClick={onDelete}
        disabled={isDeleting || !hasInstance}
        variant="destructive"
        className="flex-1"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? "Excluindo..." : "Excluir Instância"}
      </Button>
    </div>
  );
}
