
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signIn(formData.email.trim(), formData.password);
        navigate('/dashboard');
      } else {
        await signUp(formData.email.trim(), formData.password, formData.name.trim(), 'gratuito');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Tratamento específico de erros
      if (error.message?.includes('Email') || error.message?.includes('incorretos')) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Email ou senha incorretos',
          password: 'Email ou senha incorretos'
        }));
      } else if (error.message?.includes('confirmado')) {
        setErrors(prev => ({ ...prev, email: 'Email não confirmado' }));
      } else if (error.message?.includes('tentativas')) {
        setErrors(prev => ({ ...prev, email: 'Muitas tentativas. Aguarde alguns minutos' }));
      } else if (error.message?.includes('já cadastrado')) {
        setErrors(prev => ({ ...prev, email: 'Este email já está cadastrado' }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Erro na autenticação. Tente novamente.' 
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-8 w-8 text-whatsapp" />
            <span className="text-2xl font-bold text-gray-900">ChatWhatsApp</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Acesse sua conta e continue automatizando' : 'Crie sua conta gratuita e comece agora'}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{isLogin ? 'Bem-vindo de volta!' : 'Começar gratuitamente'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Entre com suas credenciais para acessar sua conta'
                : 'Preencha os dados para criar sua conta gratuita'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="auth-name">Nome</Label>
                  <Input
                    id="auth-name"
                    name="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    disabled={isLoading}
                    autoComplete="name"
                    required={!isLogin}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-red-500" role="alert">{errors.name}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-red-500" role="alert">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                    disabled={isLoading}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-500" role="alert">{errors.password}</p>
                )}
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <Button 
                    type="button"
                    variant="link" 
                    className="p-0 h-auto text-sm text-whatsapp"
                    onClick={() => navigate('/esqueci-senha')}
                    disabled={isLoading}
                  >
                    Esqueci minha senha?
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full whatsapp-gradient text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Entrando..." : "Cadastrando..."}
                  </>
                ) : (
                  isLogin ? "Entrar" : "Criar Conta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
                <Button 
                  type="button"
                  variant="link" 
                  className="p-0 h-auto text-whatsapp" 
                  onClick={() => setIsLogin(!isLogin)}
                  disabled={isLoading}
                >
                  {isLogin ? "Criar conta gratuita" : "Entrar"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
