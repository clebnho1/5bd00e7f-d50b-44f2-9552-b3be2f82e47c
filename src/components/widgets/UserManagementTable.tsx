
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Key, Eye, Calendar, UserCheck, UserX } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface UserManagementTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onEditPlan: (user: User) => void;
  onResetPassword: (user: User) => void;
  onGeneratePassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export function UserManagementTable({
  users,
  onEditUser,
  onEditPlan,
  onResetPassword,
  onGeneratePassword,
  onToggleStatus
}: UserManagementTableProps) {
  const getExpirationText = (user: User) => {
    if (user.plano === 'gratuito' && user.trial_expires_at) {
      return `Trial expira em: ${new Date(user.trial_expires_at).toLocaleDateString('pt-BR')}`;
    } else if ((user.plano === 'profissional' || user.plano === 'empresarial') && user.plano_expires_at) {
      return `Plano expira em: ${new Date(user.plano_expires_at).toLocaleDateString('pt-BR')}`;
    } else {
      return 'Plano sem data de expiração';
    }
  };

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                  {user.role === 'admin' ? 'Admin' : 'Usuário'}
                </Badge>
                <Badge variant={user.plano_active ? 'default' : 'secondary'}>
                  {user.plano}
                </Badge>
                <Badge variant={user.active ? 'default' : 'destructive'}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant={user.plano_active ? 'default' : 'secondary'}>
                  {user.plano_active ? 'Plano Ativo' : 'Plano Inativo'}
                </Badge>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
              <span className="ml-4">
                {getExpirationText(user)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={user.active ? "destructive" : "default"}
              size="sm"
              onClick={() => onToggleStatus(user)}
              title={user.active ? "Desativar usuário" : "Ativar usuário"}
            >
              {user.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditUser(user)}
              title="Editar usuário"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditPlan(user)}
              title="Alterar plano"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResetPassword(user)}
              title="Reset senha por email"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGeneratePassword(user)}
              title="Gerar senha temporária"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
