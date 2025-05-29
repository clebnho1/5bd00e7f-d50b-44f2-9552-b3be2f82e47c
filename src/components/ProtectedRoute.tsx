
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('🛡️ [PROTECTED_ROUTE] Estado:', {
    user: !!user,
    loading,
    pathname: window.location.pathname
  });

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔄 [REDIRECT] Usuário não autenticado, redirecionando para login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('⏳ [LOADING] Mostrando tela de carregamento');
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
    console.log('🚫 [NO_USER] Usuário não autenticado, não renderizando conteúdo');
    return null;
  }

  console.log('✅ [AUTHENTICATED] Renderizando conteúdo protegido');
  return <>{children}</>;
}
