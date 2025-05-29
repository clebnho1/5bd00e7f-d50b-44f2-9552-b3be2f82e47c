
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft } from 'lucide-react';

interface LoginHeaderProps {
  onBackClick: () => void;
  isLoading: boolean;
}

export const LoginHeader = ({ onBackClick, isLoading }: LoginHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <Button
        type="button"
        variant="ghost"
        className="mb-4"
        onClick={onBackClick}
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <div className="flex items-center justify-center gap-2 mb-4">
        <MessageCircle className="h-8 w-8 text-whatsapp" />
        <span className="text-2xl font-bold text-gray-900">ChatWhatsApp</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Entrar</h1>
      <p className="text-gray-600 mt-2">Acesse sua conta e continue automatizando</p>
    </div>
  );
};
