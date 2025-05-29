
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building } from 'lucide-react';

interface ConfiguracaoEmpresaProps {
  formData: {
    nome_empresa: string;
    email_empresa: string;
    endereco_empresa: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const ConfiguracaoEmpresa = memo(function ConfiguracaoEmpresa({ formData, onInputChange }: ConfiguracaoEmpresaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Configuração da Empresa
        </CardTitle>
        <CardDescription>
          Informações da sua empresa que o agente utilizará
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome_empresa">Nome Completo *</Label>
          <Input
            id="nome_empresa"
            value={formData.nome_empresa}
            onChange={(e) => onInputChange('nome_empresa', e.target.value)}
            placeholder="Nome completo da empresa"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_empresa">Email</Label>
          <Input
            id="email_empresa"
            type="email"
            value={formData.email_empresa}
            onChange={(e) => onInputChange('email_empresa', e.target.value)}
            placeholder="contato@empresa.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endereco_empresa">Endereço Completo</Label>
          <Input
            id="endereco_empresa"
            value={formData.endereco_empresa}
            onChange={(e) => onInputChange('endereco_empresa', e.target.value)}
            placeholder="Rua, número, bairro, cidade, estado, CEP"
          />
        </div>
      </CardContent>
    </Card>
  );
});
