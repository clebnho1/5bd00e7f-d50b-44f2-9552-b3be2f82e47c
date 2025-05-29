
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface ObservacoesProps {
  formData: {
    observacoes?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function Observacoes({ formData, onInputChange }: ObservacoesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Observações
        </CardTitle>
        <CardDescription>
          Anotações adicionais sobre comportamento ou instruções especiais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes || ''}
            onChange={(e) => onInputChange('observacoes', e.target.value)}
            placeholder="Digite aqui observações ou instruções especiais para o agente..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
