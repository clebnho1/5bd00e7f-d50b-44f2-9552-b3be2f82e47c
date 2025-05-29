
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AppSidebarProps {
  activeWidget: string;
  setActiveWidget: (widget: string) => void;
}

export function AppSidebar({ activeWidget, setActiveWidget }: AppSidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Mock user data - em produção viria do Supabase Auth
  const user = {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    role: 'admin' // ou 'user'
  };

  const commonItems = [
    {
      id: 'agente-ai',
      title: 'Agente AI',
      icon: Bot,
      description: 'Configure seus agentes inteligentes'
    },
    {
      id: 'colaboradores',
      title: 'Colaboradores',
      icon: Users,
      description: 'Gerencie sua equipe'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      icon: MessageCircle,
      description: 'Configurações de instância'
    },
  ];

  const adminItems = [
    {
      id: 'configuracoes',
      title: 'Configurações',
      icon: Settings,
      description: 'Webhooks e integrações'
    },
    {
      id: 'administracao',
      title: 'Administração',
      icon: AdminIcon,
      description: 'Gerenciar usuários e logs'
    },
  ];

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
          Olá, {user.name}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Widgets Principais</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeWidget === item.id}
                    onClick={() => setActiveWidget(item.id)}
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

        {user.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeWidget === item.id}
                      onClick={() => setActiveWidget(item.id)}
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
}
