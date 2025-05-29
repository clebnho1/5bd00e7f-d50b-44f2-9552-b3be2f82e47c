
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Só redirecionar se a autenticação estiver totalmente inicializada
    // e não houver usuário autenticado
    if (initialized && !loading && !user) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, initialized, navigate]);

  // Mostrar loading enquanto a autenticação não estiver inicializada
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-whatsapp" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não renderizar filhos se não houver usuário (vai redirecionar)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
