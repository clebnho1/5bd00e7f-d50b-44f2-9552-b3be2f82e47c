
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type AgenteAI = Tables['agentes_ai']['Row'];

interface AgenteFormData {
  nome: string;
  sexo: string;
  area_atuacao: string;
  funcoes: string[];
  estilo_comportamento: string;
  nome_empresa: string;
  email_empresa: string;
  telefone_empresa: string;
  website_empresa: string;
  endereco_empresa: string;
  usar_emotion: boolean;
}

export function useAgenteForm(agente: AgenteAI | null) {
  const defaultFormData: AgenteFormData = useMemo(() => ({
    nome: 'Sofia',
    sexo: 'feminino',
    area_atuacao: 'Atendimento ao Cliente',
    funcoes: ['Responder dúvidas sobre produtos', 'Agendar atendimentos', 'Fornecer informações de contato'],
    estilo_comportamento: 'Amigável e profissional',
    nome_empresa: 'Minha Empresa',
    email_empresa: '',
    telefone_empresa: '',
    website_empresa: '',
    endereco_empresa: '',
    usar_emotion: true
  }), []);

  const [formData, setFormData] = useState<AgenteFormData>(defaultFormData);

  useEffect(() => {
    if (agente) {
      setFormData({
        nome: agente.nome || defaultFormData.nome,
        sexo: agente.sexo || defaultFormData.sexo,
        area_atuacao: agente.area_atuacao || defaultFormData.area_atuacao,
        funcoes: agente.funcoes || defaultFormData.funcoes,
        estilo_comportamento: agente.estilo_comportamento || defaultFormData.estilo_comportamento,
        nome_empresa: agente.nome_empresa || defaultFormData.nome_empresa,
        email_empresa: agente.email_empresa || defaultFormData.email_empresa,
        telefone_empresa: agente.telefone_empresa || defaultFormData.telefone_empresa,
        website_empresa: agente.website_empresa || defaultFormData.website_empresa,
        endereco_empresa: agente.endereco_empresa || defaultFormData.endereco_empresa,
        usar_emotion: agente.usar_emotion ?? defaultFormData.usar_emotion
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [agente, defaultFormData]);

  const handleInputChange = useCallback((field: keyof AgenteFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const prepareDataForSave = useCallback(() => {
    return {
      nome: formData.nome,
      sexo: formData.sexo,
      area_atuacao: formData.area_atuacao,
      funcoes: formData.funcoes,
      estilo_comportamento: formData.estilo_comportamento,
      nome_empresa: formData.nome_empresa,
      email_empresa: formData.email_empresa || null,
      telefone_empresa: formData.telefone_empresa || null,
      website_empresa: formData.website_empresa || null,
      endereco_empresa: formData.endereco_empresa || null,
      usar_emotion: formData.usar_emotion
    };
  }, [formData]);

  return {
    formData,
    handleInputChange,
    prepareDataForSave
  };
}
