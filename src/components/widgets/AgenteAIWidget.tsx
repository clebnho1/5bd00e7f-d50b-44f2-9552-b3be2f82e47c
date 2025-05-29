
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Save } from 'lucide-react';
import { useAgenteAI } from '@/hooks/useAgenteAI';
import { useSelectOptions } from '@/hooks/useSelectOptions';
import { AgenteBasicInfo } from './AgenteAI/AgenteBasicInfo';
import { EmpresaInfo } from './AgenteAI/EmpresaInfo';
import { useAgenteForm } from './AgenteAI/useAgenteForm';

export function AgenteAIWidget() {
  const { agentData, loading, saveAgenteAI } = useAgenteAI();
  const { areasAtuacao, estilosComportamento, loading: optionsLoading } = useSelectOptions();
  const { formData, handleInputChange, prepareDataForSave } = useAgenteForm(agentData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = prepareDataForSave();
    await saveAgenteAI(dataToSave);
  };

  if (loading || optionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-whatsapp" />
        <h2 className="text-2xl font-bold">Configuração do Agente AI</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AgenteBasicInfo
          formData={formData}
          areasAtuacao={areasAtuacao}
          estilosComportamento={estilosComportamento}
          onInputChange={handleInputChange}
        />

        <EmpresaInfo
          formData={formData}
          onInputChange={handleInputChange}
        />

        <Button type="submit" className="w-full whatsapp-gradient text-white">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </form>
    </div>
  );
}
