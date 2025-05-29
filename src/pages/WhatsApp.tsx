
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WhatsAppWidget } from '@/components/widgets/WhatsAppWidget';
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';

const WhatsApp = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <LayoutWithSidebar>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-8 px-4">
          <WhatsAppWidget key="whatsapp-widget" />
        </div>
      </div>
    </LayoutWithSidebar>
  );
};

export default WhatsApp;
