
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export function useSelectOptions() {
  const [areasAtuacao, setAreasAtuacao] = useState<Tables['areas_atuacao']['Row'][]>([]);
  const [estilosComportamento, setEstilosComportamento] = useState<Tables['estilos_comportamento']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAreasAtuacao(),
      fetchEstilosComportamento()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchAreasAtuacao = async () => {
    try {
      const { data, error } = await supabase
        .from('areas_atuacao')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setAreasAtuacao(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar áreas de atuação:', error);
    }
  };

  const fetchEstilosComportamento = async () => {
    try {
      const { data, error } = await supabase
        .from('estilos_comportamento')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setEstilosComportamento(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar estilos de comportamento:', error);
    }
  };

  return { 
    areasAtuacao, 
    estilosComportamento, 
    loading 
  };
}
