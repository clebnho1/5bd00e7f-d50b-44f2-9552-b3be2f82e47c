
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Star, AlertTriangle } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';

const plans = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    price: 'R$ 0',
    period: '7 dias trial',
    description: 'Ideal para testar a plataforma',
    features: [
      'Até 100 mensagens/mês',
      '1 agente AI',
      'Suporte básico',
      'Trial de 7 dias'
    ]
  },
  {
    id: 'basico',
    name: 'Básico',
    price: 'R$ 399',
    period: '/mês',
    description: 'Para pequenas empresas',
    features: [
      'Até 5.000 mensagens/mês',
      '5 agentes AI',
      'Suporte prioritário',
      'Análises avançadas',
      'Webhook personalizado'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 699',
    period: '/mês',
    description: 'Para grandes empresas',
    features: [
      'Mensagens ilimitadas',
      'Agentes AI ilimitados',
      'Suporte 24/7',
      'API personalizada',
      'Integrações avançadas',
      'Relatórios detalhados'
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

  const isExpired = currentSubscription && 
    ((currentSubscription.plan === 'gratuito' && currentSubscription.trial_expires_at && new Date(currentSubscription.trial_expires_at) < new Date()) ||
     (currentSubscription.plan !== 'gratuito' && currentSubscription.plano_expires_at && new Date(currentSubscription.plano_expires_at) < new Date()));

  const isExpiringSoon = currentSubscription && 
    ((currentSubscription.plan === 'gratuito' && currentSubscription.trial_expires_at && 
      new Date(currentSubscription.trial_expires_at) > new Date() && 
      new Date(currentSubscription.trial_expires_at) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)) ||
     (currentSubscription.plan !== 'gratuito' && currentSubscription.plano_expires_at && 
      new Date(currentSubscription.plano_expires_at) > new Date() && 
      new Date(currentSubscription.plano_expires_at) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)));

  return (
    <div className="space-y-6">
      {/* Alertas de Vencimento */}
      {isExpired && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Plano Vencido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              Seu plano venceu. Renove agora para continuar usando todas as funcionalidades.
            </p>
          </CardContent>
        </Card>
      )}

      {isExpiringSoon && !isExpired && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Plano Vencendo em Breve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600">
              Seu plano vence em 2 dias. Renove agora para evitar interrupções no serviço.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Plano Atual */}
      <Card className={isExpired ? 'border-red-500' : ''}>
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
                <h3 className={`text-lg font-semibold capitalize ${isExpired ? 'text-red-600' : ''}`}>
                  {currentSubscription.plan}
                  {isExpired && ' (Vencido)'}
                </h3>
                <p className="text-gray-600">
                  Status: <Badge variant={isExpired ? "destructive" : currentSubscription.plano_active ? "default" : "secondary"}>
                    {isExpired ? 'Vencido' : currentSubscription.plano_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Desde: {new Date(currentSubscription.started_at).toLocaleDateString('pt-BR')}
                </p>
                {currentSubscription.plan === 'gratuito' && currentSubscription.trial_expires_at && (
                  <p className="text-sm text-gray-500">
                    Trial expira em: {new Date(currentSubscription.trial_expires_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
                {currentSubscription.plano_expires_at && (
                  <p className="text-sm text-gray-500">
                    Expira em: {new Date(currentSubscription.plano_expires_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${isExpired ? 'text-red-600' : ''}`}>
                  {plans.find(p => p.id === currentSubscription.plan)?.price || 'R$ 0'}
                </p>
                <p className="text-sm text-gray-500">
                  {plans.find(p => p.id === currentSubscription.plan)?.period || '/mês'}
                </p>
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
              {plan.id === 'basico' && (
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
                  <span className="text-gray-500">{plan.period}</span>
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
                  disabled={isCurrentPlan && !isExpired}
                  onClick={() => updateSubscription(plan.id)}
                >
                  {isCurrentPlan && !isExpired ? 'Plano Atual' : 
                   isExpired ? 'Renovar Plano' :
                   isUpgrade ? 'Fazer Upgrade' : 'Contratar Plano'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
