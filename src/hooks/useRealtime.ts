
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type Message = Database['public']['Tables']['messages']['Row'];
type RealtimeChannel = ReturnType<typeof supabase.channel>;

export function useRealtime(roomId: string = 'general') {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar mensagens iniciais
  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, roomId]);

  // Configurar realtime
  useEffect(() => {
    if (!user) return;

    const newChannel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        const users = Object.keys(state).map(key => state[key][0]);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Usuário entrou:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Usuário saiu:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await newChannel.track({
            user_id: user.id,
            user_name: user.user_metadata?.name || user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [user, roomId]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content: content.trim(),
          room_id: roomId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }, [user, roomId]);

  return {
    messages,
    onlineUsers,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
}
