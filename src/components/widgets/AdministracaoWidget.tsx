import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Edit, Key, Users as UsersIcon, Shield, Eye, Calendar, Building2, Star } from 'lucide-react';
import { useAdministracao } from '@/hooks/useAdministracao';
import { useAuth } from '@/hooks/useAuth';

export function AdministracaoWidget() {
  const { isAdmin } = useAuth();
  const { users, loading, updateUser, updateUserPlan, resetUserPassword, generateTemporaryPassword } = useAdministracao();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [planData, setPlanData] = useState({
    plano: '',
    expirationDate: ''
  });

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
          <p className="text-gray-600">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlanChange = (field: string, value: string) => {
    setPlanData(prev => ({ ...prev, [field]: value }));
  };

  const openEditDialog = (user: any) => {
    console.log('Opening edit dialog for user:', user);
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || ''
    });
    setIsEditDialogOpen(true);
  };

  const openPlanDialog = (user: any) => {
    console.log('Opening plan dialog for user:', user);
    setEditingUser(user);
    setPlanData({
      plano: user.plano || '',
      expirationDate: user.plano_expires_at ? new Date(user.plano_expires_at).toISOString().split('T')[0] : 
                      user.trial_expires_at ? new Date(user.trial_expires_at).toISOString().split('T')[0] : ''
    });
    setIsPlanDialogOpen(true);
  };

  const openPasswordDialog = (user: any) => {
    setEditingUser(user);
    setTempPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handleSubmit = async () => {
    console.log('Submitting user update:', { editingUser, formData });
    
    if (!editingUser?.id) {
      console.error('No user selected for editing');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      console.error('Name and email are required');
      return;
    }

    try {
      await updateUser(editingUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim()
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handlePlanSubmit = async () => {
    console.log('Submitting plan update:', { editingUser, planData });
    
    if (!editingUser?.id) {
      console.error('No user selected for plan update');
      return;
    }

    if (!planData.plano) {
      console.error('Plan is required');
      return;
    }

    try {
      const expirationDate = planData.expirationDate ? new Date(planData.expirationDate).toISOString() : undefined;
      
      await updateUserPlan(editingUser.id, planData.plano, expirationDate);
      setIsPlanDialogOpen(false);
      setEditingUser(null);
      setPlanData({ plano: '', expirationDate: '' });
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const handleResetPassword = async (user: any) => {
    if (confirm(`Tem certeza que deseja enviar um email de reset de senha para ${user.email}?`)) {
      await resetUserPassword(user.email);
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

      {/* Estatísticas */}
      <div className="grid md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-whatsapp" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.plano_active).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plano Gratuito</p>
                <p className="text-2xl font-bold text-orange-600">
                  {users.filter(u => u.plano === 'gratuito').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plano Profissional</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.plano === 'profissional').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plano Empresarial</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.plano === 'empresarial').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Visualize e edite informações dos usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <Badge variant={user.plano_active ? 'default' : 'secondary'}>
                        {user.plano_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    {user.plano_expires_at && (
                      <span className="ml-4">
                        Expira em: {new Date(user.plano_expires_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {user.trial_expires_at && (
                      <span className="ml-4">
                        Trial expira em: {new Date(user.trial_expires_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                    title="Editar usuário"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPlanDialog(user)}
                    title="Alterar plano"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetPassword(user)}
                    title="Reset senha por email"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPasswordDialog(user)}
                    title="Gerar senha temporária"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-600">Não há usuários cadastrados no sistema.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário selecionado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite o email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="whatsapp-gradient text-white"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Plano */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Alterar Plano do Usuário</DialogTitle>
            <DialogDescription>
              Atualize o plano e data de expiração do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plano">Plano</Label>
              <Select value={planData.plano} onValueChange={(value) => handlePlanChange('plano', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gratuito">Gratuito</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="empresarial">Empresarial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Data de Expiração</Label>
              <Input
                id="expirationDate"
                type="date"
                value={planData.expirationDate}
                onChange={(e) => handlePlanChange('expirationDate', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Deixe em branco para usar o padrão (7 dias para gratuito, 30 dias para pagos)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePlanSubmit} 
              className="whatsapp-gradient text-white"
            >
              Atualizar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Senha Temporária */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Gerar Senha Temporária</DialogTitle>
            <DialogDescription>
              Gere uma nova senha temporária para o usuário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {tempPassword ? (
              <div className="space-y-2">
                <Label>Senha Temporária Gerada:</Label>
                <div className="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
                  {tempPassword}
                </div>
                <p className="text-xs text-gray-500">
                  Copie esta senha e forneça ao usuário. Por segurança, esta senha não será mostrada novamente.
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Clique no botão abaixo para gerar uma nova senha temporária para {editingUser?.email}
                </p>
                <Button onClick={handleGeneratePassword} className="whatsapp-gradient text-white">
                  Gerar Senha Temporária
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
