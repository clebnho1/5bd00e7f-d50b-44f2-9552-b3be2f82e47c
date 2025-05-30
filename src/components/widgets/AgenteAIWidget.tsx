
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useAgenteAI } from '@/hooks/useAgenteAI';
import { useSelectOptions } from '@/hooks/useSelectOptions';
import { IdentidadeAgente } from './AgenteAI/IdentidadeAgente';
import { FuncoesAgente } from './AgenteAI/FuncoesAgente';
import { ComportamentoAgente } from './AgenteAI/ComportamentoAgente';
import { ConfiguracaoEmpresa } from './AgenteAI/ConfiguracaoEmpresa';
import { RedesSociais } from './AgenteAI/RedesSociais';
import { Observacoes } from './AgenteAI/Observacoes';
import { useAgenteForm } from './AgenteAI/useAgenteForm';

export const AgenteAIWidget = memo(function AgenteAIWidget() {
  console.log('🤖 [AGENTE_AI_WIDGET] Renderizando AgenteAIWidget');
  
  const { agente, loading, saveAgente } = useAgenteAI();
  const { areasAtuacao, estilosComportamento, loading: optionsLoading } = useSelectOptions();
  const { formData, handleInputChange, prepareDataForSave } = useAgenteForm(agente);

  console.log('🤖 [AGENTE_AI_WIDGET] Estado:', { 
    agente: agente?.nome, 
    loading, 
    optionsLoading,
    areasAtuacao: areasAtuacao?.length,
    estilosComportamento: estilosComportamento?.length
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🤖 [AGENTE_AI_WIDGET] Salvando agente...');
    const dataToSave = prepareDataForSave();
    console.log('🤖 [AGENTE_AI_WIDGET] Dados para salvar:', dataToSave);
    await saveAgente(dataToSave);
  };

  if (loading || optionsLoading) {
    console.log('🤖 [AGENTE_AI_WIDGET] Carregando...');
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp"></div>
      </div>
    );
  }

  console.log('🤖 [AGENTE_AI_WIDGET] Renderizando formulário');

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Botão Salvar - Parte de Cima */}
        <div className="flex justify-end">
          <Button type="submit" className="whatsapp-gradient text-white">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        {/* 1. Identidade do Agente */}
        <IdentidadeAgente
          formData={formData}
          areasAtuacao={areasAtuacao}
          onInputChange={handleInputChange}
        />

        {/* 2. Funções */}
        <FuncoesAgente
          formData={formData}
          onInputChange={handleInputChange}
        />

        {/* 3. Comportamento */}
        <ComportamentoAgente
          formData={formData}
          estilosComportamento={estilosComportamento}
          onInputChange={handleInputChange}
        />

        {/* 4. Configuração da Empresa */}
        <ConfiguracaoEmpresa
          formData={formData}
          onInputChange={handleInputChange}
        />

        {/* 5. Redes Sociais */}
        <RedesSociais
          formData={formData}
          onInputChange={handleInputChange}
        />

        {/* 6. Observações */}
        <Observacoes
          formData={formData}
          onInputChange={handleInputChange}
        />

        {/* Botão Salvar - Parte de Baixo */}
        <Button type="submit" className="w-full whatsapp-gradient text-white">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </form>
    </div>
  );
});
