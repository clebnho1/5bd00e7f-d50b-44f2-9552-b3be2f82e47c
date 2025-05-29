
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface CadastroFormData {
  nomeCompleto: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  plano: string;
}

interface CadastroFormProps {
  formData: CadastroFormData;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors: {[key: string]: string};
  isLoading: boolean;
  planos: Array<{ id: string; name: string }>;
}

export const CadastroForm = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  errors, 
  isLoading, 
  planos 
}: CadastroFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Dados pessoais</CardTitle>
        <CardDescription>
          Preencha seus dados para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cadastro-nome">Nome Completo</Label>
            <Input
              id="cadastro-nome"
              name="fullname"
              type="text"
              placeholder="Digite seu nome completo"
              value={formData.nomeCompleto}
              onChange={(e) => onInputChange('nomeCompleto', e.target.value)}
              className={errors.nomeCompleto ? 'border-red-500' : ''}
              disabled={isLoading}
              autoComplete="name"
              required
            />
            {errors.nomeCompleto && (
              <p className="text-sm text-red-500">{errors.nomeCompleto}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cadastro-email">Email</Label>
            <Input
              id="cadastro-email"
              name="email"
              type="email"
              placeholder="Digite seu email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
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
            <Label htmlFor="cadastro-senha">Senha</Label>
            <div className="relative">
              <Input
                id="cadastro-senha"
                name="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={formData.senha}
                onChange={(e) => onInputChange('senha', e.target.value)}
                className={errors.senha ? 'border-red-500' : ''}
                disabled={isLoading}
                autoComplete="new-password"
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

          <div className="space-y-2">
            <Label htmlFor="cadastro-confirmar-senha">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="cadastro-confirmar-senha"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                value={formData.confirmarSenha}
                onChange={(e) => onInputChange('confirmarSenha', e.target.value)}
                className={errors.confirmarSenha ? 'border-red-500' : ''}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
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
            <Label htmlFor="cadastro-plano">Plano *</Label>
            <Select 
              value={formData.plano} 
              onValueChange={(value) => onInputChange('plano', value)}
              disabled={isLoading}
              name="plan"
            >
              <SelectTrigger 
                id="cadastro-plano"
                className={errors.plano ? 'border-red-500' : ''}
              >
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
      </CardContent>
    </Card>
  );
};
