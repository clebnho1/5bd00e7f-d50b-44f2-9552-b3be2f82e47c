
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bot, Save, Building, Phone, Mail, Globe, MapPin, Settings } from 'lucide-react';
import { useAgenteAI } from '@/hooks/useAgenteAI';
import { useSelectOptions } from '@/hooks/useSelectOptions';

export function AgenteAIWidget() {
  const { agentData, loading, saveAgenteAI } = useAgenteAI();
  const { areasAtuacao, estilosComportamento, loading: optionsLoading } = useSelectOptions();
  
  const [formData, setFormData] = useState({
    nome: '',
    sexo: '',
    area_atuacao: '',
    estilo_comportamento: '',
    usar_emotion: true,
    nome_empresa: '',
    telefone_empresa: '',
    email_empresa: '',
    website_empresa: '',
    endereco_empresa: '',
    funcoes: ''
  });

  // Atualizar form quando os dados chegarem
  React.useEffect(() => {
    if (agentData) {
      setFormData({
        nome: agentData.nome || '',
        sexo: agentData.sexo || '',
        area_atuacao: agentData.area_atuacao || '',
        estilo_comportamento: agentData.estilo_comportamento || '',
        usar_emotion: agentData.usar_emotion ?? true,
        nome_empresa: agentData.nome_empresa || '',
        telefone_empresa: agentData.telefone_empresa || '',
        email_empresa: agentData.email_empresa || '',
        website_empresa: agentData.website_empresa || '',
        endereco_empresa: agentData.endereco_empresa || '',
        funcoes: agentData.funcoes || ''
      });
    }
  }, [agentData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAgenteAI(formData);
  };

  if (loading || optionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-whatsapp" />
        <h2 className="text-2xl font-bold">Configuração do Agente AI</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do Agente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dados do Agente
            </CardTitle>
            <CardDescription>
              Configure as características básicas do seu assistente virtual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Agente *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Ex: Maria Assistente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo *</Label>
                <Select value={formData.sexo} onValueChange={(value) => handleInputChange('sexo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="neutro">Neutro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_atuacao">Área de Atuação *</Label>
                <Select value={formData.area_atuacao} onValueChange={(value) => handleInputChange('area_atuacao', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a área de atuação" />
                  </SelectTrigger>
                  <SelectContent>
                    {areasAtuacao.map((area) => (
                      <SelectItem key={area.id} value={area.nome}>
                        {area.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estilo_comportamento">Estilo e Tom de Comportamento *</Label>
                <Select value={formData.estilo_comportamento} onValueChange={(value) => handleInputChange('estilo_comportamento', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    {estilosComportamento.map((estilo) => (
                      <SelectItem key={estilo.id} value={estilo.nome}>
                        {estilo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="usar_emotion"
                checked={formData.usar_emotion}
                onCheckedChange={(checked) => handleInputChange('usar_emotion', checked)}
              />
              <Label htmlFor="usar_emotion">Usar detecção de emoções nas respostas</Label>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Informações sobre sua empresa que o agente poderá usar nas conversas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
              <Input
                id="nome_empresa"
                value={formData.nome_empresa}
                onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
                placeholder="Nome da sua empresa"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone_empresa">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Telefone
                </Label>
                <Input
                  id="telefone_empresa"
                  value={formData.telefone_empresa}
                  onChange={(e) => handleInputChange('telefone_empresa', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_empresa">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </Label>
                <Input
                  id="email_empresa"
                  type="email"
                  value={formData.email_empresa}
                  onChange={(e) => handleInputChange('email_empresa', e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website_empresa">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Website
                </Label>
                <Input
                  id="website_empresa"
                  value={formData.website_empresa}
                  onChange={(e) => handleInputChange('website_empresa', e.target.value)}
                  placeholder="https://www.empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco_empresa">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Endereço
                </Label>
                <Input
                  id="endereco_empresa"
                  value={formData.endereco_empresa}
                  onChange={(e) => handleInputChange('endereco_empresa', e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="funcoes">Funções e Responsabilidades</Label>
              <Textarea
                id="funcoes"
                value={formData.funcoes}
                onChange={(e) => handleInputChange('funcoes', e.target.value)}
                placeholder="Descreva as principais funções que o agente deve desempenhar..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full whatsapp-gradient text-white">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </form>
    </div>
  );
}
