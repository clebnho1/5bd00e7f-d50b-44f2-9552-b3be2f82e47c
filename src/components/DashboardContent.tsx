
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Bot, Users, MessageCircle, Settings, BarChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ColaboradoresWidget } from './widgets/ColaboradoresWidget';
import { WhatsAppWidget } from './widgets/WhatsAppWidget';
import { ConfiguracoesWidget } from './widgets/ConfiguracoesWidget';
import { AdministracaoWidget } from './widgets/AdministracaoWidget';

interface DashboardContentProps {
  activeWidget: string;
}

interface Widget {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  hasOwnPage?: boolean;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ activeWidget }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const userWidgets: Widget[] = [
    {
      id: 'agente-ai',
      title: 'Agente AI',
      description: 'Configure seu assistente virtual',
      icon: Bot,
      hasOwnPage: true,
    },
    {
      id: 'colaboradores',
      title: 'Colaboradores',
      description: 'Gerencie sua equipe',
      icon: Users,
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Configure sua instância',
      icon: MessageCircle,
    },
  ];

  const adminWidgets: Widget[] = [
    {
      id: 'configuracoes',
      title: 'Configurações',
      description: 'Ajustes do sistema',
      icon: Settings,
    },
    {
      id: 'administracao',
      title: 'Administração',
      description: 'Relatórios e logs',
      icon: BarChart,
      hasOwnPage: true,
    },
  ];

  const availableWidgets = isAdmin() ? [...userWidgets, ...adminWidgets] : userWidgets;

  const handleWidgetClick = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    
    if (widget?.hasOwnPage) {
      if (widgetId === 'agente-ai') {
        navigate('/agenteai');
        return;
      }
      if (widgetId === 'administracao') {
        navigate('/administracao');
        return;
      }
    }
    
    // Para widgets sem página própria, abre como widget interno
    setSelectedWidget(widgetId);
  };

  const renderWidget = () => {
    const widgetToRender = selectedWidget || activeWidget;
    
    // Se for widget com página própria, não renderiza aqui
    if (['agente-ai', 'administracao'].includes(widgetToRender)) {
      return null;
    }
    
    // Verificar se o usuário tem permissão para acessar este widget
    if (!isAdmin() && ['configuracoes', 'administracao'].includes(widgetToRender)) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
          <p className="text-gray-600">Você não tem permissão para acessar este widget.</p>
        </div>
      );
    }
    
    switch (widgetToRender) {
      case 'colaboradores':
        return <ColaboradoresWidget />;
      case 'whatsapp':
        return <WhatsAppWidget />;
      case 'configuracoes':
        return <ConfiguracoesWidget />;
      default:
        return null;
    }
  };

  const displayWidget = selectedWidget || activeWidget;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo, {user?.user_metadata?.name || user?.email}!
          {isAdmin() && <span className="text-blue-600 font-medium"> (Administrador)</span>}
        </p>
        
        {isAdmin() && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => window.open('/admin', '_blank')}
              className="flex items-center gap-2"
            >
              <Crown className="h-4 w-4" />
              Admin Dashboard
            </Button>
          </div>
        )}
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
                onClick={() => handleWidgetClick(widget.id)}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widget Ativo (apenas para widgets sem página própria) */}
      {displayWidget && !['agente-ai', 'administracao'].includes(displayWidget) && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {availableWidgets.find(w => w.id === displayWidget)?.title}
            </h2>
            <Button 
              variant="outline" 
              onClick={() => setSelectedWidget(null)}
            >
              Fechar
            </Button>
          </div>
          {renderWidget()}
        </div>
      )}
    </div>
  );
};
