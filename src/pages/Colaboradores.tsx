
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ColaboradoresWidget } from '@/components/widgets/ColaboradoresWidget';
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';

const Colaboradores = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <LayoutWithSidebar>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-8 px-4">
          <ColaboradoresWidget />
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default Colaboradores;
