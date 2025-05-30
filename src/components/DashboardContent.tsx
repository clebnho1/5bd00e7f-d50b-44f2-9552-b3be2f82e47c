import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Users, MessageCircle, Settings, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardContentProps {
  activeWidget: string;
}

interface Widget {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ activeWidget }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const userWidgets: Widget[] = [
    {
      id: 'agente-ai',
      title: 'Agente AI',
      description: 'Configure seu assistente virtual',
      icon: Bot,
      route: '/agenteai',
    },
    {
      id: 'colaboradores',
      title: 'Colaboradores',
      description: 'Gerencie sua equipe',
      icon: Users,
      route: '/colaboradores',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Configure sua instância',
      icon: MessageCircle,
      route: '/whatsapp',
    },
  ];

  const adminWidgets: Widget[] = [
    {
      id: 'configuracoes',
      title: 'Configurações',
      description: 'Ajustes do sistema',
      icon: Settings,
      route: '/configuracoes',
    },
    {
      id: 'administracao',
      title: 'Administração',
      description: 'Relatórios e logs',
      icon: BarChart,
      route: '/administracao',
    },
  ];

  const availableWidgets = isAdmin() ? [...userWidgets, ...adminWidgets] : userWidgets;

  const handleWidgetClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo, {user?.user_metadata?.name || user?.email}!
          {isAdmin() && <span className="text-blue-600 font-medium"> (Administrador)</span>}
        </p>
      </div>

      {/* Cards dos Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableWidgets.map((widget) => (
          <Card key={widget.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <widget.icon className="h-5 w-5 text-primary" />
                {widget.title}
              </CardTitle>
              <CardDescription>{widget.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleWidgetClick(widget.route)}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
