
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, Trash, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AgenteAIWidget() {
  const { toast } = useToast();
  
  const [agentData, setAgentData] = useState({
    nome: 'Sofia',
    sexo: 'feminino',
    areaAtuacao: 'Atendimento ao Cliente',
    estiloComportamento: 'Amigável e profissional',
    usarEmotion: true,
    dadosEmpresa: {
      nomeEmpresa: 'Minha Empresa',
      telefone: '',
      email: '',
      website: '',
      endereco: ''
    }
  });

  const [funcoes, setFuncoes] = useState([
    'Responder dúvidas sobre produtos',
    'Agendar atendimentos',
    'Fornecer informações de contato'
  ]);

  const [novaFuncao, setNovaFuncao] = useState('');

  const handleAgentChange = (field: string, value: any) => {
    setAgentData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmpresaChange = (field: string, value: string) => {
    setAgentData(prev => ({
      ...prev,
      dadosEmpresa: { ...prev.dadosEmpresa, [field]: value }
    }));
  };

  const adicionarFuncao = () => {
    if (novaFuncao.trim()) {
      setFuncoes([...funcoes, novaFuncao.trim()]);
      setNovaFuncao('');
      toast({
        title: "Função adicionada",
        description: "Nova função foi adicionada ao agente.",
      });
    }
  };

  const removerFuncao = (index: number) => {
    setFuncoes(funcoes.filter((_, i) => i !== index));
    toast({
      title: "Função removida",
      description: "Função foi removida do agente.",
    });
  };

  const salvarConfiguracao = () => {
    console.log('Configuração do agente salva:', { agentData, funcoes });
    toast({
      title: "Configuração salva",
      description: "As configurações do agente AI foram atualizadas.",
    });
  };

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
                value={agentData.nome}
                onChange={(e) => handleAgentChange('nome', e.target.value)}
                placeholder="Ex: Sofia, Carlos, Ana..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select value={agentData.sexo} onValueChange={(value) => handleAgentChange('sexo', value)}>
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
                value={agentData.areaAtuacao}
                onChange={(e) => handleAgentChange('areaAtuacao', e.target.value)}
                placeholder="Ex: Vendas, Suporte, Atendimento..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estiloComportamento">Estilo e Tom de Comportamento</Label>
              <Textarea
                id="estiloComportamento"
                value={agentData.estiloComportamento}
                onChange={(e) => handleAgentChange('estiloComportamento', e.target.value)}
                placeholder="Descreva como o agente deve se comportar..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="usarEmotion"
                checked={agentData.usarEmotion}
                onCheckedChange={(checked) => handleAgentChange('usarEmotion', checked)}
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
                value={agentData.dadosEmpresa.nomeEmpresa}
                onChange={(e) => handleEmpresaChange('nomeEmpresa', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={agentData.dadosEmpresa.telefone}
                onChange={(e) => handleEmpresaChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={agentData.dadosEmpresa.email}
                onChange={(e) => handleEmpresaChange('email', e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={agentData.dadosEmpresa.website}
                onChange={(e) => handleEmpresaChange('website', e.target.value)}
                placeholder="https://www.empresa.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={agentData.dadosEmpresa.endereco}
                onChange={(e) => handleEmpresaChange('endereco', e.target.value)}
                placeholder="Rua, número, bairro, cidade, estado..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={salvarConfiguracao} className="whatsapp-gradient text-white">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
