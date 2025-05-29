
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';

interface AgenteBasicInfoProps {
  formData: {
    nome: string;
    sexo: string;
    area_atuacao: string;
    estilo_comportamento: string;
    usar_emotion: boolean;
  };
  areasAtuacao: Array<{ id: string; nome: string; }>;
  estilosComportamento: Array<{ id: string; nome: string; }>;
  onInputChange: (field: string, value: string | boolean) => void;
}

export function AgenteBasicInfo({ 
  formData, 
  areasAtuacao, 
  estilosComportamento, 
  onInputChange 
}: AgenteBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Dados do Agente
        </CardTitle>
        <CardDescription>
          Configure as características básicas do seu assistente virtual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Agente *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => onInputChange('nome', e.target.value)}
              placeholder="Ex: Maria Assistente"
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
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="neutro">Neutro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="area_atuacao">Área de Atuação *</Label>
            <Select value={formData.area_atuacao} onValueChange={(value) => onInputChange('area_atuacao', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a área de atuação" />
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
          <div className="space-y-2">
            <Label htmlFor="estilo_comportamento">Estilo e Tom de Comportamento *</Label>
            <Select value={formData.estilo_comportamento} onValueChange={(value) => onInputChange('estilo_comportamento', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                {estilosComportamento.map((estilo) => (
                  <SelectItem key={estilo.id} value={estilo.nome}>
                    {estilo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="usar_emotion"
            checked={formData.usar_emotion}
            onCheckedChange={(checked) => onInputChange('usar_emotion', checked)}
          />
          <Label htmlFor="usar_emotion">Usar detecção de emoções nas respostas</Label>
        </div>
      </CardContent>
    </Card>
  );
}
