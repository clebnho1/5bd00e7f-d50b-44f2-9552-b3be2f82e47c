
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

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateForm = (email: string, senha: string): boolean => {
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
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (email: string, senha: string) => {
    setErrors({});
    
    if (isLoading) return;
    
    if (!validateForm(email, senha)) return;
    
    setIsLoading(true);
    
    try {
      await signIn(email.trim(), senha);
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro no login';
      
      if (errorMessage.includes('Email') || errorMessage.includes('incorretos') || errorMessage.includes('Invalid login credentials')) {
        setErrors({ 
          email: 'Email ou senha incorretos',
          senha: 'Email ou senha incorretos'
        });
      } else if (errorMessage.includes('confirmado') || errorMessage.includes('Email not confirmed')) {
        setErrors({ email: 'Email não confirmado. Verifique sua caixa de entrada' });
      } else if (errorMessage.includes('tentativas')) {
        setErrors({ email: 'Muitas tentativas. Aguarde alguns minutos' });
      } else {
        setErrors({ 
          email: 'Erro no login. Tente novamente.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    navigate('/esqueci-senha');
  };

  const handleBackClick = () => {
    navigate('/cadastro');
  };

  const handleCreateAccountClick = () => {
    navigate('/cadastro');
  };

  if (authLoading) {
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
