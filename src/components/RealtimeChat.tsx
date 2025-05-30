import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Users } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';
import { useAuth } from '@/contexts/AuthContext';

export function RealtimeChat({ roomId = 'general' }: { roomId?: string }) {
  const { user } = useAuth();
  const { messages, onlineUsers, loading, sendMessage } = useRealtime(roomId);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando chat...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chat em Tempo Real</CardTitle>
            <CardDescription>Sala: {roomId}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Badge variant="secondary">
              {onlineUsers.length} online
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 min-h-0">
        {/* Lista de usuários online */}
        <div className="mb-4 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-1">Usuários online:</p>
          <div className="flex flex-wrap gap-1">
            {onlineUsers.map((user, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {user.user_name || 'Anônimo'}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((message) => {
            const isOwnMessage = message.user_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de nova mensagem */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            maxLength={500}
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
