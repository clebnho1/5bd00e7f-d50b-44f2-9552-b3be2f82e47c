
import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

interface FormData {
  nome: string;
  sexo: string;
  area_atuacao: string;
  estilo_comportamento: string;
  usar_emotion: boolean;
  nome_empresa: string;
  telefone_empresa: string;
  email_empresa: string;
  website_empresa: string;
  endereco_empresa: string;
  funcoes: string;
  instagram_empresa?: string;
  facebook_empresa?: string;
  observacoes?: string;
}

export function useAgenteForm(agentData: Tables['agentes_ai']['Row'] | null) {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    sexo: '',
    area_atuacao: '',
    estilo_comportamento: '',
    usar_emotion: true,
    nome_empresa: '',
    telefone_empresa: '',
    email_empresa: '',
    website_empresa: '',
    endereco_empresa: '',
    funcoes: '',
    instagram_empresa: '',
    facebook_empresa: '',
    observacoes: ''
  });

  // Memoizar a função de mudança para evitar re-criações
  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Debounce para campos de texto longos
  const debouncedInputChange = useMemo(
    () => debounce(handleInputChange, 300),
    [handleInputChange]
  );

  // Função específica para campos que precisam de debounce
  const handleDebouncedChange = useCallback((field: string, value: string) => {
    debouncedInputChange(field, value);
  }, [debouncedInputChange]);

  useEffect(() => {
    if (agentData) {
      setFormData({
        nome: agentData.nome || '',
        sexo: agentData.sexo || '',
        area_atuacao: agentData.area_atuacao || '',
        estilo_comportamento: agentData.estilo_comportamento || '',
        usar_emotion: agentData.usar_emotion ?? true,
        nome_empresa: agentData.nome_empresa || '',
        telefone_empresa: agentData.telefone_empresa || '',
        email_empresa: agentData.email_empresa || '',
        website_empresa: agentData.website_empresa || '',
        endereco_empresa: agentData.endereco_empresa || '',
        funcoes: Array.isArray(agentData.funcoes) ? agentData.funcoes.join('\n') : (agentData.funcoes || ''),
        instagram_empresa: (agentData as any).instagram_empresa || '',
        facebook_empresa: (agentData as any).facebook_empresa || '',
        observacoes: (agentData as any).observacoes || ''
      });
    }
  }, [agentData]);

  const prepareDataForSave = useCallback(() => {
    const funcoesArray = formData.funcoes 
      ? formData.funcoes.split('\n').filter(f => f.trim()).map(f => f.trim())
      : [];
    
    return {
      ...formData,
      funcoes: funcoesArray
    };
  }, [formData]);

  return {
    formData,
    handleInputChange,
    handleDebouncedChange,
    prepareDataForSave
  };
}
