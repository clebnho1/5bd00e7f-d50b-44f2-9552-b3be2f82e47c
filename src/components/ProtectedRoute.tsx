
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  renderCount.current += 1;

  // ===== DEBUG LOGS EXTREMAMENTE DETALHADOS =====
  const logDetailedProtectedRoute = (location: string, extraData?: any) => {
    const currentTime = Date.now();
    const debugInfo = {
      location,
      timestamp: new Date().toISOString(),
      renderCount: renderCount.current,
      timeFromStart: currentTime - startTime.current + 'ms',
      user: user ? { id: user.id, email: user.email } : null,
      loading,
      pathname: window.location.pathname,
      shouldShowLoading: loading,
      shouldRedirect: !loading && !user,
      shouldRenderChildren: !loading && !!user,
      ...extraData
    };
    console.log(`🛡️ [PROTECTED_ROUTE] ${location}:`, JSON.stringify(debugInfo, null, 2));
  };

  console.log('🛡️ [RENDER] ProtectedRoute render #' + renderCount.current + ':', {
    user: !!user,
    loading,
    timestamp: new Date().toISOString(),
    pathname: window.location.pathname,
    timeFromStart: Date.now() - startTime.current + 'ms'
  });

  logDetailedProtectedRoute('RENDER_START');

  useEffect(() => {
    console.log('🔄 [EFFECT] ProtectedRoute useEffect executado:', {
      user: !!user,
      loading,
      willRedirect: !loading && !user,
      renderCount: renderCount.current
    });

    logDetailedProtectedRoute('EFFECT_EXECUTED', {
      willRedirect: !loading && !user
    });

    if (!loading && !user) {
      console.log('❌ [REDIRECT] Usuário não autenticado, redirecionando para login');
      logDetailedProtectedRoute('REDIRECTING_TO_LOGIN');
      navigate('/login', { replace: true });
    } else if (!loading && user) {
      console.log('✅ [AUTHENTICATED] Usuário autenticado, permanecendo na rota protegida');
      logDetailedProtectedRoute('USER_AUTHENTICATED');
    } else if (loading) {
      console.log('⏳ [LOADING] Ainda carregando, aguardando...');
      logDetailedProtectedRoute('STILL_LOADING');
    }
  }, [user, loading, navigate]);

  // Log das decisões de renderização
  if (loading) {
    console.log('⏳ [LOADING_SCREEN] Mostrando tela de carregamento');
    logDetailedProtectedRoute('SHOWING_LOADING_SCREEN');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-whatsapp" />
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
          <div className="text-xs text-gray-400 mt-2">
            Render #{renderCount.current} | Loading: {loading.toString()} | User: {user ? 'exists' : 'null'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 [NO_USER] Usuário não existe, retornando null (vai redirecionar)');
    logDetailedProtectedRoute('NO_USER_RETURNING_NULL');
    return null;
  }

  console.log('✅ [RENDER_CHILDREN] Usuário autenticado, renderizando conteúdo protegido');
  logDetailedProtectedRoute('RENDERING_PROTECTED_CONTENT');
  return <>{children}</>;
}
