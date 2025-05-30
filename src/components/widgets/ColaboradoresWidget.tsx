
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash, Clock, Package } from 'lucide-react';
import { useColaboradores } from '@/hooks/useColaboradores';
import { ProtectedWidget } from '@/components/ProtectedWidget';

export function ColaboradoresWidget() {
  const { colaboradores, loading, createColaborador, updateColaborador, deleteColaborador } = useColaboradores();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [unidade, setUnidade] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [produtos, setProdutos] = useState('');
  const [horarios, setHorarios] = useState([
    { dia: 'Segunda a Sexta', inicio: '09:00', fim: '18:00' }
  ]);

  const resetForm = () => {
    setNome('');
    setCargo('');
    setUnidade('');
    setEmail('');
    setTelefone('');
    setAtivo(true);
    setProdutos('');
    setHorarios([{ dia: 'Segunda a Sexta', inicio: '09:00', fim: '18:00' }]);
    setEditingColaborador(null);
  };

  const openDialog = (colaborador = null) => {
    if (colaborador) {
      setEditingColaborador(colaborador);
      setNome(colaborador.nome);
      setCargo(colaborador.cargo || '');
      setUnidade(colaborador.unidade || '');
      setEmail(colaborador.email || '');
      setTelefone(colaborador.telefone || '');
      setAtivo(colaborador.ativo);
      setProdutos(colaborador.produtos?.join('\n') || '');
      
      // Parse horários detalhados se existir, senão usa o campo texto
      if (colaborador.horarios_detalhados && Array.isArray(colaborador.horarios_detalhados)) {
        setHorarios(colaborador.horarios_detalhados);
      } else if (colaborador.horarios) {
        // Converte formato texto para array
        const horariosTexto = colaborador.horarios.split('\n').map(linha => {
          const partes = linha.split(': ');
          if (partes.length === 2) {
            const [dia, horario] = partes;
            const [inicio, fim] = horario.split(' - ');
            return { dia, inicio: inicio || '09:00', fim: fim || '18:00' };
          }
          return { dia: linha, inicio: '09:00', fim: '18:00' };
        });
        setHorarios(horariosTexto);
      }
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const addHorario = () => {
    setHorarios([...horarios, { dia: '', inicio: '09:00', fim: '18:00' }]);
  };

  const updateHorario = (index, field, value) => {
    const novosHorarios = [...horarios];
    novosHorarios[index][field] = value;
    setHorarios(novosHorarios);
  };

  const removeHorario = (index) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setIsSubmitting(true);

    const produtosArray = produtos
      ? produtos.split('\n').filter(p => p.trim()).map(p => p.trim())
      : [];

    const dadosColaborador = {
      nome: nome.trim(),
      cargo: cargo.trim(),
      unidade: unidade.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      ativo,
      produtos: produtosArray,
      horarios_detalhados: horarios,
      horarios: horarios.map(h => `${h.dia}: ${h.inicio} - ${h.fim}`).join('\n')
    };

    try {
      let success = false;
      if (editingColaborador) {
        const result = await updateColaborador(editingColaborador.id, dadosColaborador);
        success = !!result; // Converte para boolean
      } else {
        const result = await createColaborador(dadosColaborador);
        success = !!result; // Converte para boolean
      }

      if (success) {
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      await deleteColaborador(id);
    }
  };

  const diasSemana = [
    'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 
    'Sexta-feira', 'Sábado', 'Domingo', 'Segunda a Sexta', 'Finais de Semana'
  ];

  return (
    <ProtectedWidget requiredRole="admin" widgetName="Colaboradores">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-whatsapp" />
            <h2 className="text-2xl font-bold">Colaboradores</h2>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Colaborador
          </Button>
        </div>

        {loading ? (
          <div>Carregando colaboradores...</div>
        ) : (
          <div className="grid gap-4">
            {colaboradores.map((colaborador) => (
              <Card key={colaborador.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {colaborador.nome}
                      <Badge variant={colaborador.ativo ? "default" : "secondary"}>
                        {colaborador.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(colaborador)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(colaborador.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {colaborador.cargo && `${colaborador.cargo} • `}
                    {colaborador.unidade && `${colaborador.unidade} • `}
                    {colaborador.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {colaborador.telefone && (
                      <div>
                        <p className="text-sm font-medium">Telefone</p>
                        <p className="text-sm text-gray-600">{colaborador.telefone}</p>
                      </div>
                    )}
                    
                    {colaborador.produtos && colaborador.produtos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Produtos/Serviços
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {colaborador.produtos.slice(0, 3).map((produto, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
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
                    
                    {colaborador.horarios && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Horários
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {colaborador.horarios}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {colaboradores.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum colaborador cadastrado</p>
                  <p className="text-sm text-gray-400">
                    Clique em "Novo Colaborador" para começar
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do colaborador
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ex: Vendedor, Atendente"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade</Label>
                  <Input
                    id="unidade"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    placeholder="Ex: Loja Centro, Filial Sul"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={ativo}
                    onCheckedChange={setAtivo}
                  />
                  <Label htmlFor="ativo">Colaborador ativo</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="produtos">Produtos/Serviços</Label>
                <Textarea
                  id="produtos"
                  value={produtos}
                  onChange={(e) => setProdutos(e.target.value)}
                  placeholder="Digite um produto por linha:&#10;Produto A&#10;Produto B&#10;Serviço C"
                  rows={3}
                />
                <p className="text-sm text-gray-500">Digite um produto por linha</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Horários de Trabalho</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addHorario}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                {horarios.map((horario, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-end">
                    <div className="space-y-2">
                      <Label>Dia(s)</Label>
                      <Select
                        value={horario.dia}
                        onValueChange={(value) => updateHorario(index, 'dia', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {diasSemana.map((dia) => (
                            <SelectItem key={dia} value={dia}>
                              {dia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input
                        type="time"
                        value={horario.inicio}
                        onChange={(e) => updateHorario(index, 'inicio', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input
                        type="time"
                        value={horario.fim}
                        onChange={(e) => updateHorario(index, 'fim', e.target.value)}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeHorario(index)}
                      disabled={horarios.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedWidget>
  );
}
