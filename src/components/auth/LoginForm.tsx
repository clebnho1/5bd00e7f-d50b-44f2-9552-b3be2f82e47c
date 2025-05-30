
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading: boolean;
  errors: {[key: string]: string};
}

export const LoginForm = ({ onSubmit, isLoading, errors }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    console.log(`📝 [LOGIN_FORM] Input changed - ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('🚀 [LOGIN_FORM] handleSubmit chamado');
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) {
      console.log('⏳ [LOGIN_FORM] Já está carregando, ignorando submit');
      return;
    }
    
    console.log('📤 [LOGIN_FORM] Chamando onSubmit com:', { email: formData.email });
    onSubmit(formData.email, formData.senha);
  };

  console.log('🎨 [LOGIN_FORM] Renderizando formulário');

  return (
    <form 
      onSubmit={handleSubmit}
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
            className={errors.senha ? 'border-red-500 pr-10' : 'pr-10'}
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
              console.log('👁️ [LOGIN_FORM] Alternando visibilidade da senha');
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

      <Button
        type="submit"
        className="w-full whatsapp-gradient text-white"
        disabled={isLoading || !formData.email.trim() || !formData.senha.trim()}
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
  );
};
