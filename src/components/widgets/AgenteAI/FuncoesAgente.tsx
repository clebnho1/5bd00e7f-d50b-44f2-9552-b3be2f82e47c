
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';

interface FuncoesAgenteProps {
  formData: {
    funcoes: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function FuncoesAgente({ formData, onInputChange }: FuncoesAgenteProps) {
  const [novaFuncao, setNovaFuncao] = useState('');
  
  // Funções padrão
  const funcoesComuns = [
    'Lidar com a agenda',
    'Responder perguntas sobre procedimentos'
  ];

  // Funções atuais do formulário
  const funcoesAtuais = formData.funcoes 
    ? formData.funcoes.split('\n').filter(f => f.trim())
    : [];

  const handleFuncaoComumChange = (funcao: string, checked: boolean) => {
    let novasFuncoes = [...funcoesAtuais];
    
    if (checked) {
      if (!novasFuncoes.includes(funcao)) {
        novasFuncoes.push(funcao);
      }
    } else {
      novasFuncoes = novasFuncoes.filter(f => f !== funcao);
    }
    
    onInputChange('funcoes', novasFuncoes.join('\n'));
  };

  const adicionarFuncao = () => {
    if (novaFuncao.trim() && !funcoesAtuais.includes(novaFuncao.trim())) {
      const novasFuncoes = [...funcoesAtuais, novaFuncao.trim()];
      onInputChange('funcoes', novasFuncoes.join('\n'));
      setNovaFuncao('');
    }
  };

  const removerFuncao = (funcao: string) => {
    const novasFuncoes = funcoesAtuais.filter(f => f !== funcao);
    onInputChange('funcoes', novasFuncoes.join('\n'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funções</CardTitle>
        <CardDescription>
          Defina as funções que seu agente pode executar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Funções Comuns */}
        <div className="space-y-3">
          <Label>Funções Típicas</Label>
          {funcoesComuns.map((funcao) => (
            <div key={funcao} className="flex items-center space-x-2">
              <Checkbox
                id={`funcao-${funcao}`}
                checked={funcoesAtuais.includes(funcao)}
                onCheckedChange={(checked) => handleFuncaoComumChange(funcao, checked as boolean)}
              />
              <Label htmlFor={`funcao-${funcao}`}>{funcao}</Label>
            </div>
          ))}
        </div>

        {/* Adicionar Nova Função */}
        <div className="space-y-2">
          <Label htmlFor="nova_funcao">Adicionar Função</Label>
          <div className="flex gap-2">
            <Input
              id="nova_funcao"
              value={novaFuncao}
              onChange={(e) => setNovaFuncao(e.target.value)}
              placeholder="Digite uma nova função"
              onKeyPress={(e) => e.key === 'Enter' && adicionarFuncao()}
            />
            <Button type="button" onClick={adicionarFuncao} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de Funções Personalizadas */}
        {funcoesAtuais.filter(f => !funcoesComuns.includes(f)).length > 0 && (
          <div className="space-y-2">
            <Label>Funções Personalizadas</Label>
            <div className="space-y-2">
              {funcoesAtuais
                .filter(f => !funcoesComuns.includes(f))
                .map((funcao, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{funcao}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerFuncao(funcao)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
