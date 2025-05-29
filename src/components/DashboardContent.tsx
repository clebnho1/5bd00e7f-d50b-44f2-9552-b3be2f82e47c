
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Bot, Users, MessageCircle, Settings, BarChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AgenteAIWidget } from './widgets/AgenteAIWidget';
import { ColaboradoresWidget } from './widgets/ColaboradoresWidget';
import { WhatsAppWidget } from './widgets/WhatsAppWidget';
import { ConfiguracoesWidget } from './widgets/ConfiguracoesWidget';
import { AdministracaoWidget } from './widgets/AdministracaoWidget';

interface DashboardContentProps {
  activeWidget: string;
}

const widgets = [
  {
    id: 'agente-ai',
    title: 'Agente AI',
    description: 'Configure seu assistente virtual',
    icon: Bot,
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
  },
];

export const DashboardContent: React.FC<DashboardContentProps> = ({ activeWidget }) => {
  const { user } = useAuth();
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const renderWidget = () => {
    const widgetToRender = selectedWidget || activeWidget;
    
    switch (widgetToRender) {
      case 'agente-ai':
        return <AgenteAIWidget />;
      case 'colaboradores':
        return <ColaboradoresWidget />;
      case 'whatsapp':
        return <WhatsAppWidget />;
      case 'configuracoes':
        return <ConfiguracoesWidget />;
      case 'administracao':
        return <AdministracaoWidget />;
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
        </p>
        
        {/* Link para Admin Dashboard se for admin */}
        {user?.user_metadata?.role === 'admin' && (
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
        {widgets.map((widget) => (
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
                onClick={() => setSelectedWidget(widget.id)}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widget Ativo */}
      {displayWidget && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {widgets.find(w => w.id === displayWidget)?.title}
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
