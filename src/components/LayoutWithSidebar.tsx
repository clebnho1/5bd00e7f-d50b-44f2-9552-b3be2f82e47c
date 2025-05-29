
import React from 'react';
import { CustomSidebar } from '@/components/CustomSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface LayoutWithSidebarProps {
  children: React.ReactNode;
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CustomSidebar activeWidget="" setActiveWidget={() => {}} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
