
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];

export function useColaboradores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [colaboradores, setColaboradores] = useState<Tables['colaboradores']['Row'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchColaboradores();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchColaboradores = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setColaboradores(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        title: "Erro ao carregar colaboradores",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveColaborador = async (data: { 
    nome: string; 
    produtos?: string[]; 
    produtos_precos?: Record<string, number>;
    horarios?: string; 
    ativo?: boolean;
    imagem_url?: string;
  }) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    if (!data.nome?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do colaborador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('colaboradores')
        .insert({
          user_id: user.id,
          nome: data.nome.trim(),
          produtos: data.produtos || [],
          produtos_precos: data.produtos_precos || {},
          horarios: data.horarios || '09:00 - 18:00',
          ativo: data.ativo ?? true,
          imagem_url: data.imagem_url || null,
        });

      if (error) throw error;

      toast({
        title: "Colaborador adicionado",
        description: "Novo colaborador foi adicionado com sucesso.",
      });

      fetchColaboradores();
    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      toast({
        title: "Erro ao salvar colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const updateColaborador = async (id: string, data: Partial<Tables['colaboradores']['Update']>) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('colaboradores')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Colaborador atualizado",
        description: "Informações atualizadas com sucesso.",
      });

      fetchColaboradores();
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error);
      toast({
        title: "Erro ao atualizar colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return { colaboradores, loading, saveColaborador, updateColaborador, refetch: fetchColaboradores };
}
