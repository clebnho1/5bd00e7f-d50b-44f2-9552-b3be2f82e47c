
import React from 'react';
import { Button } from '@/components/ui/button';

interface LoginActionsProps {
  onForgotPasswordClick: () => void;
  onCreateAccountClick: () => void;
  isLoading: boolean;
}

export const LoginActions = ({ onForgotPasswordClick, onCreateAccountClick, isLoading }: LoginActionsProps) => {
  return (
    <>
      <div className="flex justify-end">
        <Button 
          type="button"
          variant="link" 
          className="p-0 h-auto text-sm text-whatsapp"
          onClick={onForgotPasswordClick}
          disabled={isLoading}
        >
          Esqueci minha senha?
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Button 
            type="button"
            variant="link" 
            className="p-0 h-auto text-whatsapp" 
            onClick={onCreateAccountClick}
            disabled={isLoading}
          >
            Criar conta gratuita
          </Button>
        </p>
      </div>
    </>
  );
};
