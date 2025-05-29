
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardContent } from '@/components/DashboardContent';

const Dashboard = () => {
  const [activeWidget, setActiveWidget] = useState('agente-ai');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeWidget={activeWidget} onWidgetChange={setActiveWidget} />
        <main className="flex-1 overflow-auto">
          <DashboardContent activeWidget={activeWidget} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
