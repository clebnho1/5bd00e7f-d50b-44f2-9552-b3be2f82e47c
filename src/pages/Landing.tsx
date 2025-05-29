
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, MessageCircle, Bot, Users, Settings, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('');

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Ideal para testar a plataforma',
      features: [
        'Até 100 mensagens/mês',
        '1 Agente AI básico',
        '2 Colaboradores',
        'Suporte por email'
      ],
      popular: false,
      color: 'border-gray-200'
    },
    {
      id: 'professional',
      name: 'Profissional',
      price: 'R$ 399',
      period: '/mês',
      description: 'Para pequenas e médias empresas',
      features: [
        'Até 5.000 mensagens/mês',
        '3 Agentes AI personalizados',
        '10 Colaboradores',
        'Webhook/Integração n8n',
        'Suporte prioritário'
      ],
      popular: true,
      color: 'border-whatsapp'
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 'R$ 699',
      period: '/mês',
      description: 'Para grandes empresas',
      features: [
        'Mensagens ilimitadas',
        'Agentes AI ilimitados',
        'Colaboradores ilimitados',
        'Múltiplas instâncias WhatsApp',
        'Webhook/Integração n8n',
        'Suporte 24/7',
        'Relatórios avançados'
      ],
      popular: false,
      color: 'border-blue-500'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    navigate(`/cadastro?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-whatsapp" />
            <span className="text-2xl font-bold text-gray-900">ChatWhatsApp</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button onClick={() => navigate('/cadastro')}>
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Automatize seu WhatsApp com
            <span className="text-whatsapp"> Inteligência Artificial</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
            Transforme seu atendimento no WhatsApp com agentes AI personalizados, 
            gestão de colaboradores e automação completa. Aumente sua produtividade em até 300%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button size="lg" className="whatsapp-gradient text-white hover:opacity-90" onClick={() => navigate('/cadastro')}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Começar Gratuitamente
            </Button>
            <Button size="lg" variant="outline">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Recursos Poderosos para Seu Negócio
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <Bot className="h-12 w-12 text-whatsapp mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Agentes AI Personalizados</h3>
              <p className="text-gray-600">Crie agentes com personalidade e conhecimento específico do seu negócio</p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-whatsapp mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestão de Colaboradores</h3>
              <p className="text-gray-600">Organize sua equipe com horários, produtos e permissões personalizadas</p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <MessageCircle className="h-12 w-12 text-whatsapp mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instância WhatsApp</h3>
              <p className="text-gray-600">Conecte facilmente via QR Code e mantenha sua conta sempre ativa</p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow">
              <Zap className="h-12 w-12 text-whatsapp mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Integração Webhook</h3>
              <p className="text-gray-600">Conecte com n8n e outras ferramentas para automação completa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Escolha o Plano Ideal
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Comece grátis e escale conforme seu negócio cresce
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`pricing-card relative ${plan.color} ${plan.popular ? 'ring-2 ring-whatsapp' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-whatsapp text-white">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-base font-normal text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-whatsapp" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.popular ? 'whatsapp-gradient text-white' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    Começar com este plano
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 whatsapp-gradient text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para Revolucionar seu Atendimento?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de empresas que já automatizaram seu WhatsApp
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/cadastro')}>
            Começar Gratuitamente Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xl font-bold">ChatWhatsApp</span>
          </div>
          <p className="text-gray-400">
            © 2024 ChatWhatsApp. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
