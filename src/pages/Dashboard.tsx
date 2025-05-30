
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CustomSidebar } from '@/components/CustomSidebar';
import { DashboardContent } from '@/components/DashboardContent';
import { SidebarProvider } from '@/components/ui/sidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeWidget, setActiveWidget] = useState('whatsapp');

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CustomSidebar 
          activeWidget={activeWidget} 
          setActiveWidget={setActiveWidget} 
        />
        <main className="flex-1">
          <DashboardContent activeWidget={activeWidget} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
