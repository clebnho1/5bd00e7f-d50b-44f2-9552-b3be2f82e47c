
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading, initialized } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Redirect if already logged in - but only after auth is initialized
  useEffect(() => {
    if (initialized && !authLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, initialized, navigate]);

  // Debug form after it's actually rendered
  useEffect(() => {
    if (initialized && !authLoading && !user) {
      console.log('🔍 DEBUGGING FORM AFTER RENDER');
      const formElement = document.querySelector('form');
      if (formElement) {
        console.log('✅ FORM ELEMENT FOUND:', formElement);
        console.log('🔍 Form onSubmit handler:', formElement.onsubmit);
        console.log('🔍 Form action:', formElement.action);
        console.log('🔍 Form method:', formElement.method);
      } else {
        console.log('❌ FORM ELEMENT STILL NOT FOUND AFTER RENDER');
      }
    }
  }, [initialized, authLoading, user, formData]);

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 Input changed - ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    console.log('🔍 Validating form...');
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('✅ Form validation result:', isValid);
    return isValid;
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== FORGOT PASSWORD BUTTON CLICKED ===');
    navigate('/esqueci-senha');
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== BACK BUTTON CLICKED ===');
    navigate('/');
  };

  const handleCreateAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== CREATE ACCOUNT BUTTON CLICKED ===');
    navigate('/cadastro');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 === HANDLE SUBMIT FUNCTION CALLED ===');
    console.log('🚀 Event object:', e);
    console.log('🚀 Event type:', e.type);
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 preventDefault() and stopPropagation() called');
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Login form submitted with:', { email: formData.email, senha: '***' });
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }
    
    if (!validateForm()) {
      console.log('Form validation failed, staying on login page');
      return;
    }
    
    setIsLoading(true);
    console.log('Loading state set, attempting sign in...');
    
    try {
      console.log('About to call signIn function...');
      await signIn(formData.email.trim(), formData.senha);
      console.log('SignIn function completed successfully');
      console.log('=== LOGIN ATTEMPT SUCCESS ===');
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

  // Show loading if auth is still initializing
  if (!initialized || authLoading) {
    console.log('Showing loading state - initialized:', initialized, 'authLoading:', authLoading);
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

  console.log('🎨 Rendering login form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            type="button"
            variant="ghost"
            className="mb-4"
            onClick={handleBackClick}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-8 w-8 text-whatsapp" />
            <span className="text-2xl font-bold text-gray-900">ChatWhatsApp</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Entrar</h1>
          <p className="text-gray-600 mt-2">Acesse sua conta e continue automatizando</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Bem-vindo de volta!</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={(e) => {
                console.log('📋 FORM onSubmit TRIGGERED - Raw event:', e);
                handleSubmit(e);
              }}
              className="space-y-4" 
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="login-senha"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={errors.senha ? 'border-red-500' : ''}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => {
                      console.log('👁️ PASSWORD VISIBILITY TOGGLE CLICKED');
                      setShowPassword(!showPassword);
                    }}
                    disabled={isLoading}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.senha && (
                  <p className="text-sm text-red-500">{errors.senha}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  type="button"
                  variant="link" 
                  className="p-0 h-auto text-sm text-whatsapp"
                  onClick={handleForgotPasswordClick}
                  disabled={isLoading}
                >
                  Esqueci minha senha?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full whatsapp-gradient text-white"
                disabled={isLoading}
                onClick={(e) => {
                  console.log('🔴 SUBMIT BUTTON CLICKED - Raw event:', e);
                  console.log('🔴 Button type:', e.currentTarget.type);
                  console.log('🔴 Form element:', e.currentTarget.form);
                  // Don't prevent default here, let the form handle it
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Button 
                  type="button"
                  variant="link" 
                  className="p-0 h-auto text-whatsapp" 
                  onClick={handleCreateAccountClick}
                  disabled={isLoading}
                >
                  Criar conta gratuita
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
