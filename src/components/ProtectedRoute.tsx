
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

  console.log('🛡️ [DEBUG] ProtectedRoute render:', {
    user: !!user,
    loading,
    timestamp: new Date().toISOString(),
    pathname: window.location.pathname
  });

  useEffect(() => {
    console.log('🔄 [DEBUG] ProtectedRoute useEffect:', {
      user: !!user,
      loading,
      willRedirect: !loading && !user
    });

    if (!loading && !user) {
      console.log('❌ [DEBUG] Usuário não autenticado, redirecionando para login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('⏳ [DEBUG] Mostrando tela de carregamento');
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
    console.log('🚫 [DEBUG] Usuário não existe, retornando null (vai redirecionar)');
    return null;
  }

  console.log('✅ [DEBUG] Usuário autenticado, renderizando conteúdo protegido');
  return <>{children}</>;
}
