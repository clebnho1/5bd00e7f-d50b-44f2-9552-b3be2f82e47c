
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AgenteAIWidget } from '@/components/widgets/AgenteAIWidget';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AgenteAI = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
        
        <AgenteAIWidget />
      </div>
    </div>
  );
};

export default AgenteAI;
