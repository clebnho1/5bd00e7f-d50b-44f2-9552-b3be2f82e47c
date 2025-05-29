
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
import { Users, Plus, Edit, Trash2, User, Package, Clock } from 'lucide-react';
import { useColaboradores } from '@/hooks/useColaboradores';
import { ImageUpload } from '@/components/ImageUpload';

export function ColaboradoresWidget() {
  const { colaboradores, loading, saveColaborador, updateColaborador } = useColaboradores();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dados');
  const [formData, setFormData] = useState({
    nome: '',
    produtos: [] as string[],
    produtos_precos: {} as Record<string, number>,
    horarios: '09:00 - 18:00',
    ativo: true,
    imagem_url: ''
  });
  const [newProduct, setNewProduct] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = () => {
    if (newProduct.trim() && newProductPrice.trim()) {
      const price = parseFloat(newProductPrice);
      if (!isNaN(price)) {
        setFormData(prev => ({
          ...prev,
          produtos: [...prev.produtos, newProduct.trim()],
          produtos_precos: { ...prev.produtos_precos, [newProduct.trim()]: price }
        }));
        setNewProduct('');
        setNewProductPrice('');
      }
    }
  };

  const handleRemoveProduct = (produto: string) => {
    setFormData(prev => {
      const newProdutos = prev.produtos.filter(p => p !== produto);
      const newPrecos = { ...prev.produtos_precos };
      delete newPrecos[produto];
      return {
        ...prev,
        produtos: newProdutos,
        produtos_precos: newPrecos
      };
    });
  };

  const openDialog = (colaborador?: any) => {
    if (colaborador) {
      setEditingColaborador(colaborador);
      setFormData({
        nome: colaborador.nome,
        produtos: colaborador.produtos || [],
        produtos_precos: colaborador.produtos_precos || {},
        horarios: colaborador.horarios || '09:00 - 18:00',
        ativo: colaborador.ativo ?? true,
        imagem_url: colaborador.imagem_url || ''
      });
    } else {
      setEditingColaborador(null);
      setFormData({
        nome: '',
        produtos: [],
        produtos_precos: {},
        horarios: '09:00 - 18:00',
        ativo: true,
        imagem_url: ''
      });
    }
    setActiveTab('dados');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) return;

    if (editingColaborador) {
      await updateColaborador(editingColaborador.id, formData);
    } else {
      await saveColaborador(formData);
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
          <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
              <DialogDescription>
                Configure as informações do colaborador em abas organizadas
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dados" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Dados
                </TabsTrigger>
                <TabsTrigger value="produtos" className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="horarios" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Horários
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dados" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Digite o nome completo"
                  />
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
              </TabsContent>

              <TabsContent value="produtos" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome do produto/serviço"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Preço"
                      type="number"
                      step="0.01"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      className="w-24"
                    />
                    <Button onClick={handleAddProduct} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Produtos/Serviços Cadastrados</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.produtos.map((produto, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <span className="font-medium">{produto}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              R$ {formData.produtos_precos[produto]?.toFixed(2) || '0,00'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(produto)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {formData.produtos.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Nenhum produto cadastrado ainda
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="horarios" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="horarios">Horários de Trabalho</Label>
                  <Textarea
                    id="horarios"
                    value={formData.horarios}
                    onChange={(e) => handleInputChange('horarios', e.target.value)}
                    placeholder="Ex: Segunda a Sexta: 09:00 - 18:00&#10;Sábado: 09:00 - 12:00"
                    rows={4}
                  />
                  <p className="text-sm text-gray-600">
                    Descreva os horários de trabalho do colaborador
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
                    
                    <div className="space-y-2">
                      {colaborador.produtos && colaborador.produtos.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Produtos/Serviços:</p>
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
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Horários:</p>
                        <p className="text-sm text-gray-600">{colaborador.horarios}</p>
                      </div>
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
