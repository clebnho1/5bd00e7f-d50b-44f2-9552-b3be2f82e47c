
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';
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
    email?: string;
    telefone?: string;
    cargo?: string;
    unidade?: string;
    produtos?: string[]; 
    produtos_precos?: Record<string, number>;
    produtos_detalhados?: Array<{
      nome: string;
      comissao: number;
      preco: number;
      descricao: string;
      imagem: string;
    }>;
    horarios?: string;
    horarios_detalhados?: Array<{
      dia: string;
      inicio: string;
      fim: string;
    }>;
    ativo?: boolean;
    imagem_url?: string;
  }) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return false;
    }

    if (!data.nome?.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do colaborador é obrigatório",
        variant: "destructive",
      });
      return false;
    }

    try {
      const colaboradorData = {
        user_id: user.id,
        nome: data.nome.trim(),
        email: data.email?.trim() || null,
        telefone: data.telefone?.trim() || null,
        cargo: data.cargo?.trim() || null,
        unidade: data.unidade?.trim() || null,
        produtos: data.produtos || [],
        produtos_precos: data.produtos_precos || {},
        produtos_detalhados: data.produtos_detalhados || [],
        horarios: data.horarios || '09:00 - 18:00',
        horarios_detalhados: data.horarios_detalhados || [],
        ativo: data.ativo ?? true,
        imagem_url: data.imagem_url || null,
      };

      const { error } = await supabase
        .from('colaboradores')
        .insert(colaboradorData);

      if (error) throw error;

      toast({
        title: "Colaborador adicionado",
        description: "Novo colaborador foi adicionado com sucesso.",
      });

      // Enviar webhook
      await sendWebhookSafe(user.id, 'colaborador_created', {
        nome: colaboradorData.nome,
        email: colaboradorData.email,
        telefone: colaboradorData.telefone,
        cargo: colaboradorData.cargo,
        unidade: colaboradorData.unidade,
        produtos: colaboradorData.produtos,
        produtos_precos: colaboradorData.produtos_precos,
        produtos_detalhados: colaboradorData.produtos_detalhados,
        horarios: colaboradorData.horarios,
        horarios_detalhados: colaboradorData.horarios_detalhados,
        ativo: colaboradorData.ativo,
        imagem_url: colaboradorData.imagem_url
      }, {
        action: 'create',
        total_colaboradores: colaboradores.length + 1
      });

      await fetchColaboradores();
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar colaborador:', error);
      toast({
        title: "Erro ao salvar colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateColaborador = async (id: string, data: Partial<Tables['colaboradores']['Update']>) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Buscar dados antigos para enviar no webhook
      const colaboradorAnterior = colaboradores.find(c => c.id === id);

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

      // Enviar webhook
      await sendWebhookSafe(user.id, 'colaborador_updated', data, {
        action: 'update',
        colaborador_id: id,
        previous_data: colaboradorAnterior
      });

      await fetchColaboradores();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error);
      toast({
        title: "Erro ao atualizar colaborador",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  return { colaboradores, loading, saveColaborador, updateColaborador, refetch: fetchColaboradores };
}
