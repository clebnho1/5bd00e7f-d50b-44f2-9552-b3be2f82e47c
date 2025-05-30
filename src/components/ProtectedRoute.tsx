
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('🛡️ [PROTECTED_ROUTE] Estado:', { user: user?.email, loading });
    
    if (!loading && !user) {
      console.log('🚫 [PROTECTED_ROUTE] Redirecionando para login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('⏳ [PROTECTED_ROUTE] Carregando autenticação...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-lg">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-800">Verificando acesso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ [PROTECTED_ROUTE] Usuário não autenticado');
    return null;
  }

  console.log('✅ [PROTECTED_ROUTE] Usuário autenticado, renderizando children');
  return <>{children}</>;
}
