import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CadastroHeader } from '@/components/auth/CadastroHeader';
import { CadastroForm } from '@/components/auth/CadastroForm';
import { CadastroActions } from '@/components/auth/CadastroActions';

const Cadastro = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    plano: searchParams.get('plan') || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const planos = [
    { id: 'gratuito', name: 'Gratuito - R$ 0/mês (7 dias trial)' },
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
      // Redirect to login following the flow
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

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <CadastroHeader 
          onBackClick={() => navigate('/')}
          isLoading={isLoading}
        />
        
        <CadastroForm 
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          errors={errors}
          isLoading={isLoading}
          planos={planos}
        />

        <CadastroActions 
          onLoginClick={() => navigate('/login')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Cadastro;
