
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type AreasAtuacao = Tables['areas_atuacao']['Row'];
type EstilosComportamento = Tables['estilos_comportamento']['Row'];

export function useSelectOptions() {
  const [areasAtuacao, setAreasAtuacao] = useState<AreasAtuacao[]>([]);
  const [estilosComportamento, setEstilosComportamento] = useState<EstilosComportamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreasAtuacao = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('areas_atuacao')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao carregar áreas de atuação:', error);
        setError('Erro ao carregar áreas de atuação');
        return;
      }
      
      setAreasAtuacao(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar áreas de atuação:', error);
      setError('Erro ao carregar áreas de atuação');
    }
  }, []);

  const fetchEstilosComportamento = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('estilos_comportamento')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao carregar estilos de comportamento:', error);
        setError('Erro ao carregar estilos de comportamento');
        return;
      }
      
      setEstilosComportamento(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar estilos de comportamento:', error);
      setError('Erro ao carregar estilos de comportamento');
    }
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAreasAtuacao(),
      fetchEstilosComportamento()
    ]).finally(() => setLoading(false));
  }, [fetchAreasAtuacao, fetchEstilosComportamento]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { 
    areasAtuacao, 
    estilosComportamento, 
    loading,
    error,
    refetch
  };
}
