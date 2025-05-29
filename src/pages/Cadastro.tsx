import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Cadastro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, user, loading: authLoading, initialized } = useAuth();
  
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    plano: searchParams.get('plan') || ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Redirect if already logged in - but only after auth is initialized
  useEffect(() => {
    if (initialized && !authLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, initialized, navigate]);

  const planos = [
    { id: 'gratuito', name: 'Gratuito - R$ 0/mês' },
    { id: 'profissional', name: 'Profissional - R$ 399/mês' },
    { id: 'empresarial', name: 'Empresarial - R$ 699/mês' }
  ];

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      const validPlans = ['gratuito', 'profissional', 'empresarial'];
      const mappedPlan = planParam === 'free' ? 'gratuito' : 
                        planParam === 'professional' ? 'profissional' :
                        planParam === 'enterprise' ? 'empresarial' : planParam;
      
      if (validPlans.includes(mappedPlan)) {
        setFormData(prev => ({ ...prev, plano: mappedPlan }));
      }
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    } else if (formData.nomeCompleto.trim().length < 2) {
      newErrors.nomeCompleto = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    if (!formData.plano) {
      newErrors.plano = 'Selecione um plano';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Submitting registration form for:', formData.email);
      await signUp(
        formData.email.trim(), 
        formData.senha, 
        formData.nomeCompleto.trim(), 
        formData.plano
      );
      
      console.log('Registration successful, redirecting to login');
      // Small delay to show success message before redirect
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Tratamento específico para email já cadastrado
      if (error.message?.includes('já está cadastrado')) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Este email já possui uma conta. Tente fazer login.' 
        }));
        return;
      }
      
      // Tratamento para outros erros
      if (error.message?.includes('Email')) {
        setErrors(prev => ({ ...prev, email: error.message }));
      } else if (error.message?.includes('senha')) {
        setErrors(prev => ({ ...prev, senha: error.message }));
      } else {
        // Erro genérico
        setErrors(prev => ({ 
          ...prev, 
          email: 'Erro ao criar conta. Tente novamente.' 
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if auth is still initializing
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

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null;
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-2">Comece sua jornada de automação hoje</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
            <CardDescription>
              Preencha seus dados para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto">Nome Completo</Label>
                <Input
                  id="nomeCompleto"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  className={errors.nomeCompleto ? 'border-red-500' : ''}
                  disabled={isLoading}
                  required
                />
                {errors.nomeCompleto && (
                  <p className="text-sm text-red-500">{errors.nomeCompleto}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    className={errors.senha ? 'border-red-500' : ''}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
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

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                    className={errors.confirmarSenha ? 'border-red-500' : ''}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmarSenha && (
                  <p className="text-sm text-red-500">{errors.confirmarSenha}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plano">Plano *</Label>
                <Select 
                  value={formData.plano} 
                  onValueChange={(value) => handleInputChange('plano', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.plano ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {planos.map((plano) => (
                      <SelectItem key={plano.id} value={plano.id}>
                        {plano.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.plano && (
                  <p className="text-sm text-red-500">{errors.plano}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full whatsapp-gradient text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-whatsapp" 
                  onClick={() => navigate('/login')}
                  disabled={isLoading}
                >
                  Fazer login
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cadastro;
