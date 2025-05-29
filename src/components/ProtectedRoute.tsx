
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-whatsapp" />
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
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
