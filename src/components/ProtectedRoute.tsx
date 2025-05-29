
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  
  // Tentar usar o useAuth com tratamento de erro
  let authData;
  try {
    authData = useAuth();
  } catch (error) {
    // Se useAuth falhar, significa que não estamos dentro do AuthProvider ainda
    console.log('⏳ [PROTECTED_ROUTE] AuthProvider ainda não está pronto');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-2">Inicializando aplicação...</p>
            <p className="text-sm text-gray-600">Configurando autenticação</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, loading } = authData;

  useEffect(() => {
    console.log('🛡️ [PROTECTED_ROUTE] Estado:', { user: user?.email, loading });
    
    if (!loading && !user) {
      console.log('🚫 [PROTECTED_ROUTE] Redirecionando para login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('⏳ [PROTECTED_ROUTE] Mostrando loader');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-2">Carregando aplicação...</p>
            <p className="text-sm text-gray-600">Verificando autenticação</p>
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
