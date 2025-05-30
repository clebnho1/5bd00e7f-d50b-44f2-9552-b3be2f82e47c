
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsersList } from '@/hooks/useUsersList';
import { useUserManagement } from '@/hooks/useUserManagement';
import { usePlanManagement } from '@/hooks/usePlanManagement';
import { usePasswordManagement } from '@/hooks/usePasswordManagement';
import { AdminStatistics } from './AdminStatistics';
import { UserManagementTable } from './UserManagementTable';
import { EditUserDialog } from './EditUserDialog';
import { EditPlanDialog } from './EditPlanDialog';
import { PasswordDialog } from './PasswordDialog';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

export function AdministracaoWidget() {
  const { isAdmin } = useAuth();
  const { users, loading, refetch } = useUsersList();
  const { updateUser, toggleUserStatus } = useUserManagement();
  const { updateUserPlan } = usePlanManagement();
  const { resetUserPassword, generateTemporaryPassword } = usePasswordManagement();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState<string>('');

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
          <p className="text-gray-600">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditPlan = (user: User) => {
    setEditingUser(user);
    setIsPlanDialogOpen(true);
  };

  const handlePasswordDialog = (user: User) => {
    setEditingUser(user);
    setTempPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handleResetPassword = async (user: User) => {
    if (confirm(`Tem certeza que deseja enviar um email de reset de senha para ${user.email}?`)) {
      await resetUserPassword(user.email);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const action = user.active ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} o usuário ${user.email}?`)) {
      const success = await toggleUserStatus(user.id, user.active);
      if (success) {
        refetch();
      }
    }
  };

  const handleGeneratePassword = async () => {
    if (!editingUser) return;
    
    if (confirm(`Tem certeza que deseja gerar uma nova senha temporária para ${editingUser.email}?`)) {
      const newPassword = await generateTemporaryPassword(editingUser.id, editingUser.email);
      if (newPassword) {
        setTempPassword(newPassword);
      }
    }
  };

  const handleSaveUser = async (data: { name: string; email: string }) => {
    if (!editingUser) return;
    
    const success = await updateUser(editingUser.id, data);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingUser(null);
      refetch();
    }
  };

  const handleSavePlan = async (data: { plano: string; expirationDate: string }) => {
    if (!editingUser) return;
    
    const expirationDate = data.expirationDate ? new Date(data.expirationDate).toISOString() : undefined;
    const success = await updateUserPlan(editingUser.id, data.plano, expirationDate);
    if (success) {
      setIsPlanDialogOpen(false);
      setEditingUser(null);
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-whatsapp" />
        <h2 className="text-2xl font-bold">Administração do Sistema</h2>
      </div>

      <AdminStatistics users={users} />

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Visualize e edite informações dos usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-600">Não há usuários cadastrados no sistema.</p>
            </div>
          ) : (
            <UserManagementTable
              users={users}
              onEditUser={handleEditUser}
              onEditPlan={handleEditPlan}
              onResetPassword={handleResetPassword}
              onGeneratePassword={handlePasswordDialog}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </CardContent>
      </Card>

      <EditUserDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveUser}
      />

      <EditPlanDialog
        user={editingUser}
        open={isPlanDialogOpen}
        onOpenChange={setIsPlanDialogOpen}
        onSave={handleSavePlan}
      />

      <PasswordDialog
        user={editingUser}
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        tempPassword={tempPassword}
        onGeneratePassword={handleGeneratePassword}
      />
    </div>
  );
}
