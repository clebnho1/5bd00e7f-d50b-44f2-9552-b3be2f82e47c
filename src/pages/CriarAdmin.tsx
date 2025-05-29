
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';

const CriarAdmin = () => {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading, initialized } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && !authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, initialized, navigate]);

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      console.log('🚀 Iniciando criação de usuário admin...');
      console.log('📧 Email:', 'clebermosmann@gmail.com');
      console.log('👤 Nome:', 'Cleber Mosmann');
      console.log('📋 Plano:', 'profissional');
      console.log('🔄 Estado atual do Supabase auth:', { user, initialized, authLoading });
      
      // Verificar se o hook useAuth está funcionando
      if (!signUp) {
        throw new Error('Hook useAuth não disponível ou signUp não definido');
      }
      
      console.log('✅ Hook useAuth disponível, iniciando signUp...');
      
      // Usar a função signUp do hook useAuth
      const result = await signUp(
        'clebermosmann@gmail.com',
        '123456',
        'Cleber Mosmann',
        'profissional'
      );
      
      console.log('📊 Resultado do signUp:', result);
      console.log('✅ Admin criado com sucesso no Supabase!');
      setSuccess(true);
      
      // Aguardar um pouco antes de redirecionar
      setTimeout(() => {
        console.log('🔄 Redirecionando para login...');
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Erro ao criar admin:', error);
      console.error('📄 Tipo do erro:', typeof error);
      console.error('📋 Propriedades do erro:', Object.keys(error || {}));
      console.error('💬 Mensagem:', error?.message);
      console.error('🔢 Código:', error?.code);
      console.error('📊 Status:', error?.status);
      console.error('🔍 Stack:', error?.stack);
      
      let errorMessage = 'Erro desconhecido ao criar usuário';
      
      if (error.message?.includes('User already registered') || 
          error.message?.includes('já está cadastrado') ||
          error.message?.includes('duplicate key') ||
          error.message?.includes('duplicate')) {
        errorMessage = 'Este email já possui uma conta. Tente fazer login ou use outro email.';
        console.log('🔍 Erro identificado: Usuário já existe');
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email necessita confirmação';
        console.log('🔍 Erro identificado: Email não confirmado');
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido';
        console.log('🔍 Erro identificado: Email inválido');
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Problema com a senha';
        console.log('🔍 Erro identificado: Problema com senha');
      } else {
        errorMessage = error.message || 'Erro ao criar usuário admin';
        console.log('🔍 Erro não identificado, usando mensagem padrão');
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialized || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <UserPlus className="h-8 w-8 text-whatsapp" />
            </div>
            <CardTitle className="text-2xl">Criar Usuário Admin</CardTitle>
            <CardDescription>
              Criação do usuário administrador no Supabase
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Email:</Label>
                <p className="text-gray-700 font-mono">clebermosmann@gmail.com</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Nome:</Label>
                <p className="text-gray-700">Cleber Mosmann</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Plano:</Label>
                <p className="text-gray-700">Profissional</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Senha:</Label>
                <p className="text-gray-700 font-mono">123456</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-lg">❌</span>
                  <div>
                    <p className="text-sm font-medium text-red-800">Erro:</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                    <p className="text-xs text-red-500 mt-2">
                      Verifique o console do navegador para mais detalhes
                    </p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✅</span>
                  <div>
                    <p className="text-sm font-medium text-green-800">Sucesso!</p>
                    <p className="text-sm text-green-600 mt-1">
                      Usuário admin criado com sucesso no Supabase! 
                      Redirecionando para login em 3 segundos...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateAdmin}
              className="w-full whatsapp-gradient text-white"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando no Supabase...
                </>
              ) : success ? (
                "✅ Usuário criado!"
              ) : (
                "🚀 Criar Usuário Admin"
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button 
                variant="link" 
                onClick={() => navigate('/login')}
                disabled={isLoading}
                className="text-sm"
              >
                ← Voltar para Login
              </Button>
              
              <div className="text-xs text-gray-500 mt-4">
                <p>📊 Abra o Console do navegador (F12) para ver logs detalhados</p>
                <p>🔍 Verifique se o usuário foi criado no Supabase Auth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CriarAdmin;
