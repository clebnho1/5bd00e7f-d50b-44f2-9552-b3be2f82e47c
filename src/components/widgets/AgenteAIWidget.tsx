
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Bot, Trash } from 'lucide-react';
import { useAgenteAI } from '@/hooks/useSupabaseData';

export function AgenteAIWidget() {
  const { agentData, loading, saveAgenteAI } = useAgenteAI();
  
  const [formData, setFormData] = useState({
    nome: 'Sofia',
    sexo: 'feminino',
    area_atuacao: 'Atendimento ao Cliente',
    estilo_comportamento: 'Amigável e profissional',
    usar_emotion: true,
    nome_empresa: 'Minha Empresa',
    telefone_empresa: '',
    email_empresa: '',
    website_empresa: '',
    endereco_empresa: ''
  });

  const [funcoes, setFuncoes] = useState<string[]>([
    'Responder dúvidas sobre produtos',
    'Agendar atendimentos',
    'Fornecer informações de contato'
  ]);

  const [novaFuncao, setNovaFuncao] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (agentData) {
      setFormData({
        nome: agentData.nome,
        sexo: agentData.sexo,
        area_atuacao: agentData.area_atuacao,
        estilo_comportamento: agentData.estilo_comportamento,
        usar_emotion: agentData.usar_emotion,
        nome_empresa: agentData.nome_empresa,
        telefone_empresa: agentData.telefone_empresa || '',
        email_empresa: agentData.email_empresa || '',
        website_empresa: agentData.website_empresa || '',
        endereco_empresa: agentData.endereco_empresa || ''
      });
      
      if (agentData.funcoes) {
        setFuncoes(agentData.funcoes);
      }
    }
  }, [agentData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const adicionarFuncao = () => {
    if (novaFuncao.trim()) {
      setFuncoes([...funcoes, novaFuncao.trim()]);
      setNovaFuncao('');
    }
  };

  const removerFuncao = (index: number) => {
    setFuncoes(funcoes.filter((_, i) => i !== index));
  };

  const salvarConfiguracao = async () => {
    setIsSaving(true);
    
    try {
      await saveAgenteAI({
        ...formData,
        funcoes
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configurações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Básicas</CardTitle>
            <CardDescription>
              Configure a personalidade e comportamento do seu agente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Agente</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Sofia, Carlos, Ana..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select value={formData.sexo} onValueChange={(value) => handleInputChange('sexo', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="neutro">Neutro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaAtuacao">Área de Atuação</Label>
              <Input
                id="areaAtuacao"
                value={formData.area_atuacao}
                onChange={(e) => handleInputChange('area_atuacao', e.target.value)}
                placeholder="Ex: Vendas, Suporte, Atendimento..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estiloComportamento">Estilo e Tom de Comportamento</Label>
              <Textarea
                id="estiloComportamento"
                value={formData.estilo_comportamento}
                onChange={(e) => handleInputChange('estilo_comportamento', e.target.value)}
                placeholder="Descreva como o agente deve se comportar..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="usarEmotion"
                checked={formData.usar_emotion}
                onCheckedChange={(checked) => handleInputChange('usar_emotion', checked)}
              />
              <Label htmlFor="usarEmotion">Usar Emotion (Respostas mais emotivas)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Funções do Agente */}
        <Card>
          <CardHeader>
            <CardTitle>Funções do Agente</CardTitle>
            <CardDescription>
              Defina o que seu agente pode fazer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Funções Atuais</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {funcoes.map((funcao, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{funcao}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerFuncao(index)}
                    >
                      <Trash className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="novaFuncao">Adicionar Nova Função</Label>
              <div className="flex gap-2">
                <Input
                  id="novaFuncao"
                  value={novaFuncao}
                  onChange={(e) => setNovaFuncao(e.target.value)}
                  placeholder="Digite uma nova função..."
                  onKeyPress={(e) => e.key === 'Enter' && adicionarFuncao()}
                />
                <Button onClick={adicionarFuncao}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Empresa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuração da Empresa</CardTitle>
            <CardDescription>
              Informações que o agente usará sobre sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input
                id="nomeEmpresa"
                value={formData.nome_empresa}
                onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone_empresa}
                onChange={(e) => handleInputChange('telefone_empresa', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email_empresa}
                onChange={(e) => handleInputChange('email_empresa', e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website_empresa}
                onChange={(e) => handleInputChange('website_empresa', e.target.value)}
                placeholder="https://www.empresa.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco_empresa}
                onChange={(e) => handleInputChange('endereco_empresa', e.target.value)}
                placeholder="Rua, número, bairro, cidade, estado..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={salvarConfiguracao} 
          className="whatsapp-gradient text-white"
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
