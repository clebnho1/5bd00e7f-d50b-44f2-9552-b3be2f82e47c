
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bot, Users, Settings, BarChart, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bot,
      title: "Agente AI Inteligente",
      description: "Configure assistentes virtuais para automatizar atendimentos"
    },
    {
      icon: Users,
      title: "Gestão de Colaboradores",
      description: "Gerencie equipes e distribuição de atendimentos"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integrado",
      description: "Conecte múltiplas instâncias do WhatsApp"
    },
    {
      icon: Settings,
      title: "Configurações Avançadas",
      description: "Webhooks, integrações e automações personalizadas"
    },
    {
      icon: BarChart,
      title: "Relatórios Completos",
      description: "Acompanhe métricas e performance em tempo real"
    }
  ];

  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      features: [
        "Cancelou? Cliente recebe mensagem automática!",
        "Novo agendamento ou venda? Notificação direto no seu WhatsApp!",
        "Após 7 dias, o cliente recebe um lembrete para reagendar ou comprar novamente!",
        "🔄 Respostas automáticas 24/7",
        "🧭 Menu interativo personalizado", 
        "🎯 Detecção de intenção",
        "📚 Aprendizado contínuo",
        "📅 Agendamentos automáticos"
      ]
    },
    {
      name: "Profissional",
      price: "R$ 29",
      period: "/mês",
      features: [
        "3 Agentes AI",
        "3 Instâncias WhatsApp",
        "Mensagens ilimitadas",
        "Relatórios avançados",
        "Suporte prioritário"
      ]
    },
    {
      name: "Empresarial",
      price: "R$ 79",
      period: "/mês",
      features: [
        "Agentes AI ilimitados",
        "Instâncias ilimitadas",
        "API personalizada",
        "Integração completa",
        "Suporte 24/7"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-8 w-8 text-whatsapp" />
              <span className="text-2xl font-bold text-gray-900">ChatWhatsApp</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Login
              </Button>
              <Button className="whatsapp-gradient text-white" onClick={() => navigate('/auth')}>
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Automatize seu WhatsApp com <span className="text-whatsapp">Inteligência Artificial</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforme seu atendimento com agentes AI que respondem automaticamente, 
            gerenciam conversas e convertem leads 24/7.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="whatsapp-gradient text-white text-lg px-8 py-3"
              onClick={() => navigate('/auth')}
            >
              Começar Gratuitamente
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/auth')}
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Recursos Poderosos para seu Negócio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-whatsapp mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Planos para Todos os Tamanhos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${index === 1 ? 'border-whatsapp shadow-lg scale-105' : ''}`}>
                {index === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-whatsapp text-white px-3 py-1 rounded-full text-sm">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-whatsapp">
                    {plan.price}<span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={index === 1 ? "default" : "outline"}
                    onClick={() => navigate('/auth')}
                  >
                    Escolher Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-whatsapp text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Revolucionar seu Atendimento?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comece gratuitamente e veja como a IA pode transformar seu negócio.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-3"
            onClick={() => navigate('/auth')}
          >
            Começar Agora - É Grátis!
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
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
