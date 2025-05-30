
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface WhatsAppConnectionFormProps {
  nomeCliente: string;
  setNomeCliente: (value: string) => void;
  instanceId: string;
  statusConexao: 'open' | 'closed' | 'error' | 'connecting' | 'unknown';
  statusMessage: string;
  isCreatingInstance: boolean;
  isCheckingStatus: boolean;
  onCreateInstance: () => void;
  onCheckStatus: () => void;
}

export function WhatsAppConnectionForm({
  nomeCliente,
  setNomeCliente,
  instanceId,
  statusConexao,
  statusMessage,
  isCreatingInstance,
  isCheckingStatus,
  onCreateInstance,
  onCheckStatus
}: WhatsAppConnectionFormProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="nomeCliente" className="text-gray-700 font-medium">
          Nome do Cliente
        </Label>
        <div className="flex gap-3">
          <Input
            id="nomeCliente"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            placeholder="Digite o nome do cliente (ex: João Silva)"
            className="flex-1"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onCheckStatus} 
            disabled={isCheckingStatus || (!instanceId && !nomeCliente.trim())}
            title="Verificar status da conexão"
          >
            <RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
          </Button>
          {!instanceId && (
            <Button
              onClick={onCreateInstance}
              disabled={isCreatingInstance || !nomeCliente.trim()}
              className="min-w-[150px]"
            >
              {isCreatingInstance ? "Criando..." : "Criar Instância"}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {instanceId 
            ? `Instância criada para: ${nomeCliente}` 
            : "Use um nome único para identificar este cliente"
          }
        </p>
      </div>

      {statusConexao !== 'unknown' && (
        <StatusBadge status={statusConexao} message={statusMessage} />
      )}
    </div>
  );
}
