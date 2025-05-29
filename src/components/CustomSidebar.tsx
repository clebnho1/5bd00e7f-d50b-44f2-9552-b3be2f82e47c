
import React from 'react';
import { Bot, Users, MessageCircle, Settings, Users as AdminIcon, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface CustomSidebarProps {
  activeWidget: string;
  setActiveWidget: (widget: string) => void;
}

export const CustomSidebar: React.FC<CustomSidebarProps> = ({ activeWidget, setActiveWidget }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, isAdmin } = useAuth();

  const userItems = [
    {
      id: 'agente-ai',
      title: 'Agente AI',
      icon: Bot,
      description: 'Configure seus agentes inteligentes',
      route: '/agenteai'
    },
    {
      id: 'colaboradores',
      title: 'Colaboradores',
      icon: Users,
      description: 'Gerencie sua equipe',
      route: '/colaboradores'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      icon: MessageCircle,
      description: 'Configurações de instância',
      route: '/whatsapp'
    },
  ];

  const adminItems = [
    {
      id: 'configuracoes',
      title: 'Configurações',
      icon: Settings,
      description: 'Webhooks e integrações',
      route: '/configuracoes'
    },
    {
      id: 'administracao',
      title: 'Administração',
      icon: AdminIcon,
      description: 'Gerenciar usuários e logs',
      route: '/administracao'
    },
  ];

  const handleItemClick = (item: any) => {
    navigate(item.route);
  };

  const isActiveRoute = (route: string) => {
    return location.pathname === route;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-whatsapp" />
          <span className="font-bold text-lg">ChatWhatsApp</span>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Olá, {user?.user_metadata?.name || user?.email}
          {isAdmin() && <span className="text-blue-600 font-medium"> (Admin)</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Widgets Principais</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={isActiveRoute(item.route)}
                    onClick={() => handleItemClick(item)}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin() && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActiveRoute(item.route)}
                      onClick={() => handleItemClick(item)}
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
