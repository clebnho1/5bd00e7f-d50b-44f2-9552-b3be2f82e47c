
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/AppSidebar';
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
        <AppSidebar 
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
