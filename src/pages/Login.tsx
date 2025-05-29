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
    console.log('Login useEffect - Auth state:', { user: !!user, authLoading, initialized });
    if (initialized && !authLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, initialized, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Login form submitted with:', { email: formData.email, senha: '***' });
    console.log('Current route before validation:', window.location.pathname);
    
    if (!validateForm()) {
      console.log('Form validation failed, staying on login page');
      return;
    }
    
    setIsLoading(true);
    console.log('Loading state set, current route:', window.location.pathname);
    
    try {
      console.log('About to call signIn function...');
      await signIn(formData.email.trim(), formData.senha);
      console.log('SignIn function completed successfully');
      console.log('Current route after signIn:', window.location.pathname);
      console.log('=== LOGIN ATTEMPT SUCCESS ===');
    } catch (error: any) {
      console.error('=== LOGIN ATTEMPT FAILED ===');
      console.error('Login error:', error);
      console.log('Current route after error:', window.location.pathname);
      
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
      console.log('Setting loading to false, current route:', window.location.pathname);
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
    console.log('User is logged in, not rendering login form');
    return null;
  }

  console.log('Rendering login form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/')}
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    onClick={() => setShowPassword(!showPassword)}
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
                  variant="link" 
                  className="p-0 h-auto text-sm text-whatsapp"
                  onClick={() => navigate('/esqueci-senha')}
                  disabled={isLoading}
                >
                  Esqueci minha senha?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full whatsapp-gradient text-white"
                disabled={isLoading}
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
                  variant="link" 
                  className="p-0 h-auto text-whatsapp" 
                  onClick={() => navigate('/cadastro')}
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
