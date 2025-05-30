
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { sendWebhookSafe } from '@/utils/webhook';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Notification = Tables['notifications']['Row'];

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Enviar webhook para nova notificação
          sendWebhookSafe(user.id, 'notification_received', {
            notification_id: newNotification.id,
            user_id: user.id,
            user_email: user.email,
            notification_title: newNotification.title,
            notification_message: newNotification.message,
            notification_type: newNotification.type,
            timestamp: new Date().toISOString()
          }, {
            action: 'notification_received',
            widget: 'notifications'
          }).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Enviar webhook para notificação lida
      sendWebhookSafe(user.id, 'notification_read', {
        notification_id: notificationId,
        user_id: user.id,
        user_email: user.email,
        timestamp: new Date().toISOString()
      }, {
        action: 'notification_read',
        widget: 'notifications'
      }).catch(console.error);

    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      // Enviar webhook para todas as notificações lidas
      sendWebhookSafe(user.id, 'all_notifications_read', {
        user_id: user.id,
        user_email: user.email,
        timestamp: new Date().toISOString()
      }, {
        action: 'all_notifications_read',
        widget: 'notifications'
      }).catch(console.error);

    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Enviar webhook para notificação deletada
      sendWebhookSafe(user.id, 'notification_deleted', {
        notification_id: notificationId,
        user_id: user.id,
        user_email: user.email,
        deleted_notification: notificationToDelete,
        timestamp: new Date().toISOString()
      }, {
        action: 'notification_deleted',
        widget: 'notifications'
      }).catch(console.error);

    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
}
