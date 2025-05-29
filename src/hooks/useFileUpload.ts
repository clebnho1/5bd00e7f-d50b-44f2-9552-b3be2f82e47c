
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useFileUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File, folder: string = 'general') => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive",
      });
      return null;
    }

    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Selecione um arquivo para fazer upload",
        variant: "destructive",
      });
      return null;
    }

    // Validar tamanho do arquivo (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      setUploadProgress(100);

      toast({
        title: "Upload concluído",
        description: "Arquivo enviado com sucesso!",
      });

      return {
        path: data.path,
        publicUrl,
        fullPath: data.fullPath
      };

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.storage
        .from('uploads')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Arquivo removido",
        description: "Arquivo deletado com sucesso!",
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao deletar arquivo:', error);
      toast({
        title: "Erro ao deletar",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  };

  const listFiles = async (folder: string = '') => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .list(`${user.id}/${folder}`, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  };

  return {
    uploadFile,
    deleteFile,
    listFiles,
    uploading,
    uploadProgress
  };
}
