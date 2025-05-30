
import { Card, CardContent } from '@/components/ui/card';
import { Users as UsersIcon, UserCheck, Star, Shield, Building2, Settings } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface AdminStatisticsProps {
  users: User[];
}

export function AdminStatistics({ users }: AdminStatisticsProps) {
  return (
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
                {users.filter(u => u.active && u.plano_active).length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
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
  );
}
