
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ConfiguracoesWidget } from '@/components/widgets/ConfiguracoesWidget';
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';

const Configuracoes = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <LayoutWithSidebar>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-8 px-4">
          <ConfiguracoesWidget />
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default Configuracoes;
