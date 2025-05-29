
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

  console.log('🛡️ [PROTECTED_ROUTE] Render:', {
    user: !!user,
    loading,
    timestamp: new Date().toISOString(),
    pathname: window.location.pathname,
    shouldShowLoading: loading,
    shouldRedirect: !loading && !user,
    shouldRenderChildren: !loading && !!user
  });

  useEffect(() => {
    console.log('🔄 [PROTECTED_ROUTE] useEffect executado:', {
      user: !!user,
      loading,
      willRedirect: !loading && !user
    });

    // Só redireciona se não estiver carregando E não tiver usuário
    if (!loading && !user) {
      console.log('❌ [REDIRECT] Redirecionando para login - usuário não autenticado');
      navigate('/login', { replace: true });
    } else if (!loading && user) {
      console.log('✅ [AUTHENTICATED] Usuário autenticado na rota protegida');
    } else if (loading) {
      console.log('⏳ [LOADING] Ainda carregando autenticação...');
    }
  }, [user, loading, navigate]); // Dependências corretas

  // Condição de renderização simplificada e clara
  if (loading) {
    console.log('⏳ [RENDER] Mostrando tela de carregamento');
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
    console.log('🚫 [NO_USER] Usuário não existe, retornando null (redirecionamento em andamento)');
    return null;
  }

  console.log('✅ [RENDER_CHILDREN] Renderizando conteúdo protegido');
  return <>{children}</>;
}
