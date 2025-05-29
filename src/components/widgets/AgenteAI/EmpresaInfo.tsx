
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface EmpresaInfoProps {
  formData: {
    nome_empresa: string;
    telefone_empresa: string;
    email_empresa: string;
    website_empresa: string;
    endereco_empresa: string;
    funcoes: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function EmpresaInfo({ formData, onInputChange }: EmpresaInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Dados da Empresa
        </CardTitle>
        <CardDescription>
          Informações sobre sua empresa que o agente poderá usar nas conversas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
          <Input
            id="nome_empresa"
            value={formData.nome_empresa}
            onChange={(e) => onInputChange('nome_empresa', e.target.value)}
            placeholder="Nome da sua empresa"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefone_empresa">
              <Phone className="inline h-4 w-4 mr-1" />
              Telefone
            </Label>
            <Input
              id="telefone_empresa"
              value={formData.telefone_empresa}
              onChange={(e) => onInputChange('telefone_empresa', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email_empresa">
              <Mail className="inline h-4 w-4 mr-1" />
              Email
            </Label>
            <Input
              id="email_empresa"
              type="email"
              value={formData.email_empresa}
              onChange={(e) => onInputChange('email_empresa', e.target.value)}
              placeholder="contato@empresa.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website_empresa">
              <Globe className="inline h-4 w-4 mr-1" />
              Website
            </Label>
            <Input
              id="website_empresa"
              value={formData.website_empresa}
              onChange={(e) => onInputChange('website_empresa', e.target.value)}
              placeholder="https://www.empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco_empresa">
              <MapPin className="inline h-4 w-4 mr-1" />
              Endereço
            </Label>
            <Input
              id="endereco_empresa"
              value={formData.endereco_empresa}
              onChange={(e) => onInputChange('endereco_empresa', e.target.value)}
              placeholder="Rua, número, bairro, cidade"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="funcoes">Funções e Responsabilidades</Label>
          <Textarea
            id="funcoes"
            value={formData.funcoes}
            onChange={(e) => onInputChange('funcoes', e.target.value)}
            placeholder="Digite uma função por linha:&#10;Responder dúvidas sobre produtos&#10;Agendar atendimentos&#10;Fornecer informações de contato"
            rows={4}
          />
          <p className="text-sm text-gray-500">Digite uma função por linha</p>
        </div>
      </CardContent>
    </Card>
  );
}
