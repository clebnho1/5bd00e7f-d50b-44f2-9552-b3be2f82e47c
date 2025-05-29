
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AgenteAIWidget } from './widgets/AgenteAIWidget';
import { ColaboradoresWidget } from './widgets/ColaboradoresWidget';
import { WhatsAppWidget } from './widgets/WhatsAppWidget';
import { ConfiguracoesWidget } from './widgets/ConfiguracoesWidget';
import { AdministracaoWidget } from './widgets/AdministracaoWidget';

interface DashboardContentProps {
  activeWidget: string;
}

export function DashboardContent({ activeWidget }: DashboardContentProps) {
  const renderWidget = () => {
    switch (activeWidget) {
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
        return <AgenteAIWidget />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      {renderWidget()}
    </div>
  );
}
