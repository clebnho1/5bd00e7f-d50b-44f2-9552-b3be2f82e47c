
import React from 'react';
import { Button } from '@/components/ui/button';

interface CadastroActionsProps {
  onLoginClick: () => void;
  isLoading: boolean;
}

export const CadastroActions = ({ onLoginClick, isLoading }: CadastroActionsProps) => {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-600">
        Já tem uma conta?{' '}
        <Button 
          variant="link" 
          className="p-0 h-auto text-whatsapp" 
          onClick={onLoginClick}
          disabled={isLoading}
        >
          Fazer login
        </Button>
      </p>
    </div>
  );
};
