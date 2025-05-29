
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Edit, UserX, UserCheck } from 'lucide-react';
import { useColaboradores } from '@/hooks/useSupabaseData';

export function ColaboradoresWidget() {
  const { colaboradores, loading, saveColaborador, updateColaborador } = useColaboradores();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    produtos: '',
    horarios: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openDialog = (colaborador?: any) => {
    if (colaborador) {
      setEditingColaborador(colaborador);
      setFormData({
        nome: colaborador.nome,
        produtos: colaborador.produtos?.join(', ') || '',
        horarios: colaborador.horarios || ''
      });
    } else {
      setEditingColaborador(null);
      setFormData({ nome: '', produtos: '', horarios: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome) return;

    const produtosArray = formData.produtos.split(',').map(p => p.trim()).filter(p => p);
    
    if (editingColaborador) {
      await updateColaborador(editingColaborador.id, {
        nome: formData.nome,
        produtos: produtosArray,
        horarios: formData.horarios
      });
    } else {
      await saveColaborador({
        nome: formData.nome,
        produtos: produtosArray,
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
          <DialogContent className="sm:max-w-[425px] bg-white">
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
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="produtos">Produtos/Serviços</Label>
                <Input
                  id="produtos"
                  value={formData.produtos}
                  onChange={(e) => handleInputChange('produtos', e.target.value)}
                  placeholder="Separe por vírgulas: Produto 1, Produto 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horarios">Horários de Trabalho</Label>
                <Input
                  id="horarios"
                  value={formData.horarios}
                  onChange={(e) => handleInputChange('horarios', e.target.value)}
                  placeholder="Ex: Segunda a Sexta: 09:00 - 18:00"
                />
              </div>
            </div>
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
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {colaborador.nome}
                    <Badge variant={colaborador.ativo ? 'default' : 'secondary'}>
                      {colaborador.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardTitle>
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
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Produtos/Serviços:</h4>
                  <div className="flex flex-wrap gap-1">
                    {colaborador.produtos?.map((produto, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {produto}
                      </Badge>
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
