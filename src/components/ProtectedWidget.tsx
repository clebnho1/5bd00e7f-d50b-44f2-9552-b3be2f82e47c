
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface ProtectedWidgetProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  widgetName: string;
}

export function ProtectedWidget({ children, requiredRole = 'user', widgetName }: ProtectedWidgetProps) {
  const { user, isAdmin } = useAuth();

  // Se requer admin e usuário não é admin, mostrar acesso negado
  if (requiredRole === 'admin' && !isAdmin()) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Acesso Restrito</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar o widget "{widgetName}".
            Este recurso é exclusivo para administradores.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500">
            Entre em contato com o administrador do sistema se precisar de acesso.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Se chegou até aqui, tem permissão
  return <>{children}</>;
}
