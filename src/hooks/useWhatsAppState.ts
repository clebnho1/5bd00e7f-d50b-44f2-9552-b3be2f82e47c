
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from './useDebounce';

export function useWhatsAppState() {
  const { user } = useAuth();
  const [nomeCliente, setNomeCliente] = useState('');
  const [instanceId, setInstanceId] = useState('');

  // Carregar dados salvos do localStorage específicos do usuário
  useEffect(() => {
    if (!user?.id) return;
    
    const userKey = `whatsapp_${user.id}`;
    const savedInstanceId = localStorage.getItem(`${userKey}_instance_id`);
    const savedNomeCliente = localStorage.getItem(`${userKey}_cliente_nome`);
    
    if (savedInstanceId) {
      setInstanceId(savedInstanceId);
    }
    if (savedNomeCliente) {
      setNomeCliente(savedNomeCliente);
    }
  }, [user?.id]);

  const saveToLocalStorage = (newInstanceId: string, newNomeCliente: string) => {
    if (user?.id) {
      const userKey = `whatsapp_${user.id}`;
      localStorage.setItem(`${userKey}_instance_id`, newInstanceId);
      localStorage.setItem(`${userKey}_cliente_nome`, newNomeCliente);
    }
  };

  const clearLocalStorage = () => {
    if (user?.id) {
      const userKey = `whatsapp_${user.id}`;
      localStorage.removeItem(`${userKey}_instance_id`);
      localStorage.removeItem(`${userKey}_cliente_nome`);
    }
  };

  // Debounced function para verificação de status
  const debouncedStatusCheck = useDebounce((callback: () => void) => {
    console.log(`🔍 Verificação de status para ${user?.email}: ${nomeCliente}`);
    callback();
  }, 1000);

  return {
    nomeCliente,
    setNomeCliente,
    instanceId,
    setInstanceId,
    saveToLocalStorage,
    clearLocalStorage,
    debouncedStatusCheck
  };
}
