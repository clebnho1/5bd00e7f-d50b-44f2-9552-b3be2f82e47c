
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Edit, UserX, UserCheck, Trash2 } from 'lucide-react';
import { useColaboradores } from '@/hooks/useSupabaseData';
import { ImageUpload } from '@/components/ImageUpload';

export function ColaboradoresWidget() {
  const { colaboradores, loading, saveColaborador, updateColaborador } = useColaboradores();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dados');
  const [formData, setFormData] = useState({
    nome: '',
    imagem_url: '',
    horarios: '09:00 - 18:00'
  });
  const [produtos, setProdutos] = useState<Array<{ nome: string; preco: number }>>([]);
  const [novoProduto, setNovoProduto] = useState({ nome: '', preco: 0 });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const adicionarProduto = () => {
    if (novoProduto.nome.trim() && novoProduto.preco > 0) {
      setProdutos([...produtos, { ...novoProduto }]);
      setNovoProduto({ nome: '', preco: 0 });
    }
  };

  const removerProduto = (index: number) => {
    setProdutos(produtos.filter((_, i) => i !== index));
  };

  const openDialog = (colaborador?: any) => {
    if (colaborador) {
      setEditingColaborador(colaborador);
      setFormData({
        nome: colaborador.nome,
        imagem_url: colaborador.imagem_url || '',
        horarios: colaborador.horarios || '09:00 - 18:00'
      });
      
      // Converter produtos e preços para o formato do formulário
      const produtosList = colaborador.produtos?.map((produto: string) => ({
        nome: produto,
        preco: colaborador.produtos_precos?.[produto] || 0
      })) || [];
      setProdutos(produtosList);
    } else {
      setEditingColaborador(null);
      setFormData({ nome: '', imagem_url: '', horarios: '09:00 - 18:00' });
      setProdutos([]);
    }
    setActiveTab('dados');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome) return;

    // Preparar dados dos produtos
    const produtosArray = produtos.map(p => p.nome);
    const produtosPrecos = produtos.reduce((acc, p) => {
      acc[p.nome] = p.preco;
      return acc;
    }, {} as Record<string, number>);
    
    if (editingColaborador) {
      await updateColaborador(editingColaborador.id, {
        nome: formData.nome,
        imagem_url: formData.imagem_url || null,
        produtos: produtosArray,
        produtos_precos: produtosPrecos,
        horarios: formData.horarios
      });
    } else {
      await saveColaborador({
        nome: formData.nome,
        imagem_url: formData.imagem_url || undefined,
        produtos: produtosArray,
        produtos_precos: produtosPrecos,
        horarios: formData.horarios,
        ativo: true
      });
    }

    setIsDialogOpen(false);
  };

  const toggleStatus = async (colaborador: any) => {
    await updateColaborador(colaborador.id, { ativo: !colaborador.ativo });
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
          <h2 className="text-2xl font-bold">Gestão de Colaboradores</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="whatsapp-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
              <DialogDescription>
                {editingColaborador 
                  ? 'Atualize as informações do colaborador'
                  : 'Adicione um novo membro à sua equipe'
                }
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="produtos">Produtos & Preços</TabsTrigger>
                <TabsTrigger value="horarios">Horários</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dados" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Digite o nome completo"
                  />
                </div>
                
                <ImageUpload
                  value={formData.imagem_url}
                  onChange={(url) => handleInputChange('imagem_url', url || '')}
                />
              </TabsContent>
              
              <TabsContent value="produtos" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <Label>Produtos e Serviços</Label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Nome do produto"
                      value={novoProduto.nome}
                      onChange={(e) => setNovoProduto(prev => ({ ...prev, nome: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Preço"
                      value={novoProduto.preco || ''}
                      onChange={(e) => setNovoProduto(prev => ({ ...prev, preco: Number(e.target.value) || 0 }))}
                    />
                    <Button onClick={adicionarProduto} type="button">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {produtos.map((produto, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div>
                          <span className="font-medium">{produto.nome}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            R$ {produto.preco.toFixed(2)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerProduto(index)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="horarios" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="horarios">Horários de Trabalho</Label>
                  <Input
                    id="horarios"
                    value={formData.horarios}
                    onChange={(e) => handleInputChange('horarios', e.target.value)}
                    placeholder="Ex: Segunda a Sexta: 09:00 - 18:00"
                  />
                  <p className="text-xs text-gray-500">
                    Descreva os horários de disponibilidade do colaborador
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="whatsapp-gradient text-white">
                {editingColaborador ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {colaboradores.map((colaborador) => (
          <Card key={colaborador.id} className={`transition-all ${!colaborador.ativo ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {colaborador.imagem_url && (
                    <img
                      src={colaborador.imagem_url}
                      alt={colaborador.nome}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  )}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {colaborador.nome}
                      <Badge variant={colaborador.ativo ? 'default' : 'secondary'}>
                        {colaborador.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog(colaborador)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={colaborador.ativo ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleStatus(colaborador)}
                  >
                    {colaborador.ativo ? (
                      <UserX className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Produtos/Serviços:</h4>
                  <div className="flex flex-wrap gap-2">
                    {colaborador.produtos?.map((produto, index) => (
                      <div key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        <span className="font-medium">{produto}</span>
                        {colaborador.produtos_precos?.[produto] && (
                          <span className="text-gray-600 ml-1">
                            (R$ {colaborador.produtos_precos[produto].toFixed(2)})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Horários:</h4>
                  <p className="text-sm text-gray-600">{colaborador.horarios}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {colaboradores.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador cadastrado</h3>
              <p className="text-gray-600 mb-4">Adicione colaboradores para gerenciar sua equipe.</p>
              <Button onClick={() => openDialog()} className="whatsapp-gradient text-white">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Colaborador
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
