
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';

interface IdentidadeAgenteProps {
  formData: {
    nome: string;
    sexo: string;
    area_atuacao: string;
  };
  areasAtuacao: Array<{ id: string; nome: string; }>;
  onInputChange: (field: string, value: string) => void;
}

export const IdentidadeAgente = memo(function IdentidadeAgente({ 
  formData, 
  areasAtuacao, 
  onInputChange 
}: IdentidadeAgenteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Identidade do Agente
        </CardTitle>
        <CardDescription>
          Defina as características básicas do seu agente virtual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Agente AI *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => onInputChange('nome', e.target.value)}
            placeholder="Ex: Clara"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sexo">Sexo *</Label>
          <Select value={formData.sexo} onValueChange={(value) => onInputChange('sexo', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Feminino">Feminino</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area_atuacao">Área de Atuação *</Label>
          <Select value={formData.area_atuacao} onValueChange={(value) => onInputChange('area_atuacao', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              {areasAtuacao.map((area) => (
                <SelectItem key={area.id} value={area.nome}>
                  {area.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});
