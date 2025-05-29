
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Star } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';

const plans = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    price: 'R$ 0',
    description: 'Ideal para começar',
    features: [
      'Até 100 mensagens/mês',
      '1 agente AI',
      'Suporte básico'
    ]
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 'R$ 49',
    description: 'Para pequenas empresas',
    features: [
      'Até 5.000 mensagens/mês',
      '5 agentes AI',
      'Suporte prioritário',
      'Análises avançadas'
    ]
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    price: 'R$ 149',
    description: 'Para grandes empresas',
    features: [
      'Mensagens ilimitadas',
      'Agentes AI ilimitados',
      'Suporte 24/7',
      'API personalizada',
      'Integrações avançadas'
    ]
  }
];

export function SubscriptionManager() {
  const { currentSubscription, loading, updateSubscription } = useSubscriptions();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando assinatura...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSubscription ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold capitalize">
                  {currentSubscription.plan}
                </h3>
                <p className="text-gray-600">
                  Status: <Badge variant="secondary">{currentSubscription.status}</Badge>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Desde: {new Date(currentSubscription.started_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {plans.find(p => p.id === currentSubscription.plan)?.price || 'R$ 0'}
                </p>
                <p className="text-sm text-gray-500">/mês</p>
              </div>
            </div>
          ) : (
            <p>Nenhuma assinatura encontrada</p>
          )}
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan === plan.id;
          const isUpgrade = currentSubscription && plans.findIndex(p => p.id === currentSubscription.plan) < plans.findIndex(p => p.id === plan.id);
          
          return (
            <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
              {plan.id === 'profissional' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : isUpgrade ? "default" : "outline"}
                  disabled={isCurrentPlan}
                  onClick={() => updateSubscription(plan.id)}
                >
                  {isCurrentPlan ? 'Plano Atual' : isUpgrade ? 'Fazer Upgrade' : 'Fazer Downgrade'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
