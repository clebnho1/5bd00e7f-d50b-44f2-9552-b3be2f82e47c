
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AgenteAIWidget } from '@/components/widgets/AgenteAIWidget';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AgenteAI = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Editar Configurações do Agente AI</h1>
            <p className="text-gray-600 mt-2">
              Configure seu assistente virtual personalizado
            </p>
          </div>
        </div>
        
        <AgenteAIWidget />
      </div>
    </div>
  );
};

export default AgenteAI;
