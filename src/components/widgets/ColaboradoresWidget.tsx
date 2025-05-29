
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Edit, Trash2, User, Package, Clock, Upload } from 'lucide-react';
import { useColaboradores } from '@/hooks/useColaboradores';
import { ImageUpload } from '@/components/ImageUpload';

const diasSemana = [
  'Segunda-feira',
  'Terça-feira', 
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

export function ColaboradoresWidget() {
  const { colaboradores, loading, saveColaborador, updateColaborador } = useColaboradores();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('cadastro');
  
  // Dados pessoais
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    unidade: '',
    ativo: true,
    imagem_url: ''
  });

  // Produtos
  const [produtos, setProdutos] = useState<Array<{
    nome: string;
    comissao: number;
    preco: number;
    descricao: string;
    imagem: string;
  }>>([]);
  
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    comissao: 0,
    preco: 0,
    descricao: '',
    imagem: ''
  });

  // Horários
  const [horarios, setHorarios] = useState<Array<{
    dia: string;
    inicio: string;
    fim: string;
  }>>([]);
  
  const [novoHorario, setNovoHorario] = useState({
    dia: '',
    inicio: '',
    fim: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProduto = () => {
    if (novoProduto.nome.trim() && novoProduto.preco > 0) {
      setProdutos(prev => [...prev, { ...novoProduto }]);
      setNovoProduto({
        nome: '',
        comissao: 0,
        preco: 0,
        descricao: '',
        imagem: ''
      });
    }
  };

  const handleRemoveProduto = (index: number) => {
    setProdutos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddHorario = () => {
    if (novoHorario.dia && novoHorario.inicio && novoHorario.fim) {
      setHorarios(prev => [...prev, { ...novoHorario }]);
      setNovoHorario({
        dia: '',
        inicio: '',
        fim: ''
      });
    }
  };

  const handleRemoveHorario = (index: number) => {
    setHorarios(prev => prev.filter((_, i) => i !== index));
  };

  const openDialog = (colaborador?: any) => {
    if (colaborador) {
      setEditingColaborador(colaborador);
      setFormData({
        nome: colaborador.nome || '',
        email: colaborador.email || '',
        telefone: colaborador.telefone || '',
        cargo: colaborador.cargo || '',
        unidade: colaborador.unidade || '',
        ativo: colaborador.ativo ?? true,
        imagem_url: colaborador.imagem_url || ''
      });
      setProdutos(colaborador.produtos_detalhados || []);
      setHorarios(colaborador.horarios_detalhados || []);
    } else {
      setEditingColaborador(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cargo: '',
        unidade: '',
        ativo: true,
        imagem_url: ''
      });
      setProdutos([]);
      setHorarios([]);
    }
    setActiveTab('cadastro');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) return;

    const dadosColaborador = {
      ...formData,
      produtos_detalhados: produtos,
      horarios_detalhados: horarios,
      // Manter compatibilidade com formato antigo
      produtos: produtos.map(p => p.nome),
      produtos_precos: produtos.reduce((acc, p) => ({ ...acc, [p.nome]: p.preco }), {}),
      horarios: horarios.map(h => `${h.dia}: ${h.inicio} - ${h.fim}`).join('\n')
    };

    if (editingColaborador) {
      await updateColaborador(editingColaborador.id, dadosColaborador);
    } else {
      await saveColaborador(dadosColaborador);
    }

    setIsDialogOpen(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-whatsapp" />
          <h2 className="text-2xl font-bold">Colaboradores</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="whatsapp-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do colaborador, produtos habilitados e horários de atendimento.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cadastro" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Cadastro Completo
                </TabsTrigger>
                <TabsTrigger value="produtos" className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Adicionar Produto
                </TabsTrigger>
                <TabsTrigger value="horarios" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Adicionar Horário
                </TabsTrigger>
              </TabsList>

              {/* Aba 1: Cadastro Completo */}
              <TabsContent value="cadastro" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome*</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email*</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@anaai.com.br"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo*</Label>
                      <Input
                        id="cargo"
                        value={formData.cargo}
                        onChange={(e) => handleInputChange('cargo', e.target.value)}
                        placeholder="Ex: Corretor, Gerente..."
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="unidade">Unidade*</Label>
                      <Input
                        id="unidade"
                        value={formData.unidade}
                        onChange={(e) => handleInputChange('unidade', e.target.value)}
                        placeholder="Ex: São Paulo, Campinas..."
                      />
                    </div>
                  </div>

                  <ImageUpload
                    value={formData.imagem_url}
                    onChange={(url) => handleInputChange('imagem_url', url)}
                  />

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => handleInputChange('ativo', checked)}
                    />
                    <Label htmlFor="ativo">Colaborador ativo</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Aba 2: Adicionar Produto */}
              <TabsContent value="produtos" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Formulário de Produto</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Produto</Label>
                      <Input
                        value={novoProduto.nome}
                        onChange={(e) => setNovoProduto(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Nome do produto"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Comissão (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={novoProduto.comissao}
                        onChange={(e) => setNovoProduto(prev => ({ ...prev, comissao: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço (R$)*</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={novoProduto.preco}
                        onChange={(e) => setNovoProduto(prev => ({ ...prev, preco: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Imagem do Produto</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={novoProduto.imagem}
                          onChange={(e) => setNovoProduto(prev => ({ ...prev, imagem: e.target.value }))}
                          placeholder="URL da imagem"
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Tipos aceitos: PNG, JPG, WEBP – máx. 5MB</p>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Descrição</Label>
                      <Textarea
                        value={novoProduto.descricao}
                        onChange={(e) => setNovoProduto(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descrição do produto"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddProduto} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Produtos Adicionados</h3>
                  
                  {produtos.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum produto adicionado</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {produtos.map((produto, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium">{produto.nome}</p>
                            <p className="text-sm text-gray-600">
                              Comissão: {produto.comissao}% | Preço: R$ {produto.preco.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduto(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Aba 3: Adicionar Horário */}
              <TabsContent value="horarios" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Formulário de Horário</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select value={novoHorario.dia} onValueChange={(value) => setNovoHorario(prev => ({ ...prev, dia: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                        <SelectContent>
                          {diasSemana.map(dia => (
                            <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Hora Início</Label>
                      <Input
                        type="time"
                        value={novoHorario.inicio}
                        onChange={(e) => setNovoHorario(prev => ({ ...prev, inicio: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Hora Fim</Label>
                      <Input
                        type="time"
                        value={novoHorario.fim}
                        onChange={(e) => setNovoHorario(prev => ({ ...prev, fim: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddHorario} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Horários Adicionados</h3>
                  
                  {horarios.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum horário adicionado</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {horarios.map((horario, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium">{horario.dia}</p>
                            <p className="text-sm text-gray-600">{horario.inicio} às {horario.fim}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveHorario(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="whatsapp-gradient text-white">
                Salvar Cadastro Completo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de colaboradores existentes */}
      <div className="grid gap-4">
        {colaboradores.map((colaborador) => (
          <Card key={colaborador.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {colaborador.imagem_url ? (
                    <img
                      src={colaborador.imagem_url}
                      alt={colaborador.nome}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{colaborador.nome}</h3>
                      <Badge variant={colaborador.ativo ? 'default' : 'secondary'}>
                        {colaborador.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {colaborador.email && <p>Email: {colaborador.email}</p>}
                      {colaborador.cargo && <p>Cargo: {colaborador.cargo}</p>}
                      {colaborador.unidade && <p>Unidade: {colaborador.unidade}</p>}
                      
                      {colaborador.produtos && colaborador.produtos.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700">Produtos:</p>
                          <div className="flex flex-wrap gap-1">
                            {colaborador.produtos.slice(0, 3).map((produto: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {produto}
                              </Badge>
                            ))}
                            {colaborador.produtos.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{colaborador.produtos.length - 3} mais
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(colaborador)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {colaboradores.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador cadastrado</h3>
                <p className="text-gray-600 mb-4">Comece adicionando seu primeiro colaborador</p>
                <Button onClick={() => openDialog()} className="whatsapp-gradient text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Colaborador
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
