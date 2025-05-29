
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Brain } from 'lucide-react';

interface ComportamentoAgenteProps {
  formData: {
    estilo_comportamento: string;
    usar_emotion: boolean;
  };
  estilosComportamento: Array<{ id: string; nome: string; }>;
  onInputChange: (field: string, value: string | boolean) => void;
}

export const ComportamentoAgente = memo(function ComportamentoAgente({ 
  formData, 
  estilosComportamento, 
  onInputChange 
}: ComportamentoAgenteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Estilo de Comportamento
        </CardTitle>
        <CardDescription>
          Configure como seu agente se comporta e interage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="estilo_comportamento">Estilo de Comportamento *</Label>
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
});
