
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginHeader } from '@/components/auth/LoginHeader';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginActions } from '@/components/auth/LoginActions';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateForm = (email: string, senha: string) => {
    console.log('🔍 Validating form...');
    const newErrors: {[key: string]: string} = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Email inválido';
    }

    if (!senha) {
      newErrors.senha = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('✅ Form validation result:', isValid);
    return isValid;
  };

  const handleFormSubmit = async (email: string, senha: string) => {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Login form submitted with:', { email, senha: '***' });
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }
    
    if (!validateForm(email, senha)) {
      console.log('Form validation failed, staying on login page');
      return;
    }
    
    setIsLoading(true);
    console.log('Loading state set, attempting sign in...');
    
    try {
      console.log('About to call signIn function...');
      await signIn(email.trim(), senha);
      console.log('SignIn function completed successfully');
      console.log('=== LOGIN ATTEMPT SUCCESS ===');
      // After successful login, redirect to dashboard (final step in flow)
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('=== LOGIN ATTEMPT FAILED ===');
      console.error('Login error:', error);
      
      // Tratamento específico de erros de login
      if (error.message?.includes('Email') || error.message?.includes('incorretos')) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Email ou senha incorretos',
          senha: 'Email ou senha incorretos'
        }));
      } else if (error.message?.includes('confirmado')) {
        setErrors(prev => ({ ...prev, email: 'Email não confirmado' }));
      } else if (error.message?.includes('tentativas')) {
        setErrors(prev => ({ ...prev, email: 'Muitas tentativas. Aguarde alguns minutos' }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Erro no login. Tente novamente.' 
        }));
      }
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
      console.log('=== LOGIN ATTEMPT END ===');
    }
  };

  const handleForgotPasswordClick = () => {
    console.log('=== FORGOT PASSWORD BUTTON CLICKED ===');
    navigate('/esqueci-senha');
  };

  const handleBackClick = () => {
    console.log('=== BACK BUTTON CLICKED ===');
    navigate('/cadastro'); // Go back to cadastro in the flow
  };

  const handleCreateAccountClick = () => {
    console.log('=== CREATE ACCOUNT BUTTON CLICKED ===');
    navigate('/cadastro');
  };

  // Show loading if auth is still initializing
  if (authLoading) {
    console.log('Showing loading state - authLoading:', authLoading);
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null;
  }

  console.log('🎨 Rendering login page');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginHeader 
          onBackClick={handleBackClick}
          isLoading={isLoading}
        />

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Bem-vindo de volta!</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              errors={errors}
            />
            
            <LoginActions
              onForgotPasswordClick={handleForgotPasswordClick}
              onCreateAccountClick={handleCreateAccountClick}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
