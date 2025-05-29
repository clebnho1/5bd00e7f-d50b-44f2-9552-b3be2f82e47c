
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, BarChart3, Clock, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  plano: string;
  status: 'ativo' | 'inativo';
  ultimoLogin: string;
  dataCriacao: string;
}

interface LogActivity {
  id: string;
  usuario: string;
  widget: string;
  acao: string;
  timestamp: string;
  detalhes: string;
}

export function AdministracaoWidget() {
  const { toast } = useToast();
  
  const [usuarios] = useState<Usuario[]>([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      plano: 'professional',
      status: 'ativo',
      ultimoLogin: '2024-01-15 14:30',
      dataCriacao: '2024-01-01'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@exemplo.com',
      plano: 'enterprise',
      status: 'ativo',
      ultimoLogin: '2024-01-15 10:15',
      dataCriacao: '2023-12-15'
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      email: 'pedro@exemplo.com',
      plano: 'free',
      status: 'inativo',
      ultimoLogin: '2024-01-10 16:45',
      dataCriacao: '2024-01-08'
    }
  ]);

  const [logs] = useState<LogActivity[]>([
    {
      id: '1',
      usuario: 'João Silva',
      widget: 'Agente AI',
      acao: 'Atualização de configurações',
      timestamp: '2024-01-15 14:30:25',
      detalhes: 'Alterou nome do agente de "Carlos" para "Sofia"'
    },
    {
      id: '2',
      usuario: 'Maria Santos',
      widget: 'Colaboradores',
      acao: 'Novo colaborador',
      timestamp: '2024-01-15 10:15:10',
      detalhes: 'Adicionou colaborador "Ana Silva"'
    },
    {
      id: '3',
      usuario: 'João Silva',
      widget: 'WhatsApp',
      acao: 'Conexão estabelecida',
      timestamp: '2024-01-15 09:45:33',
      detalhes: 'Instância WhatsApp conectada com sucesso'
    },
    {
      id: '4',
      usuario: 'Pedro Costa',
      widget: 'Sistema',
      acao: 'Login',
      timestamp: '2024-01-14 16:20:15',
      detalhes: 'Usuário realizou login no sistema'
    }
  ]);

  const [filtros, setFiltros] = useState({
    usuarioSearch: '',
    planoFilter: 'todos',
    statusFilter: 'todos',
    widgetFilter: 'todos',
    acaoFilter: ''
  });

  const estatisticas = {
    totalUsuarios: usuarios.length,
    usuariosAtivos: usuarios.filter(u => u.status === 'ativo').length,
    usuariosPorPlano: {
      free: usuarios.filter(u => u.plano === 'free').length,
      professional: usuarios.filter(u => u.plano === 'professional').length,
      enterprise: usuarios.filter(u => u.plano === 'enterprise').length
    },
    logsHoje: logs.filter(log => log.timestamp.startsWith('2024-01-15')).length
  };

  const getPlanoInfo = (plano: string) => {
    const planos = {
      free: { nome: 'Gratuito', cor: 'bg-gray-100 text-gray-800' },
      professional: { nome: 'Profissional', cor: 'bg-blue-100 text-blue-800' },
      enterprise: { nome: 'Empresarial', cor: 'bg-purple-100 text-purple-800' }
    };
    return planos[plano as keyof typeof planos] || planos.free;
  };

  const alterarStatusUsuario = (userId: string, novoStatus: 'ativo' | 'inativo') => {
    console.log(`Alterando status do usuário ${userId} para ${novoStatus}`);
    toast({
      title: "Status alterado",
      description: `Usuário foi ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso.`,
    });
  };

  const alterarPlanoUsuario = (userId: string, novoPlano: string) => {
    console.log(`Alterando plano do usuário ${userId} para ${novoPlano}`);
    toast({
      title: "Plano alterado",
      description: "Plano do usuário foi atualizado com sucesso.",
    });
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    return (
      usuario.nome.toLowerCase().includes(filtros.usuarioSearch.toLowerCase()) &&
      (filtros.planoFilter === 'todos' || usuario.plano === filtros.planoFilter) &&
      (filtros.statusFilter === 'todos' || usuario.status === filtros.statusFilter)
    );
  });

  const logsFiltrados = logs.filter(log => {
    return (
      (filtros.widgetFilter === 'todos' || log.widget === filtros.widgetFilter) &&
      (filtros.acaoFilter === '' || log.acao.toLowerCase().includes(filtros.acaoFilter.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-whatsapp" />
        <h2 className="text-2xl font-bold">Administração do Sistema</h2>
      </div>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.usuariosAtivos} ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Plano Gratuito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.usuariosPorPlano.free}</div>
            <p className="text-xs text-muted-foreground">usuários</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Plano Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.usuariosPorPlano.professional}</div>
            <p className="text-xs text-muted-foreground">usuários</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.logsHoje}</div>
            <p className="text-xs text-muted-foreground">logs registrados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usuarios">Gerenciar Usuários</TabsTrigger>
          <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar usuário</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome ou email..."
                      value={filtros.usuarioSearch}
                      onChange={(e) => setFiltros(prev => ({ ...prev, usuarioSearch: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plano</label>
                  <Select value={filtros.planoFilter} onValueChange={(value) => setFiltros(prev => ({ ...prev, planoFilter: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os planos" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="todos">Todos os planos</SelectItem>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="enterprise">Empresarial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filtros.statusFilter} onValueChange={(value) => setFiltros(prev => ({ ...prev, statusFilter: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários ({usuariosFiltrados.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usuariosFiltrados.map((usuario) => {
                  const planoInfo = getPlanoInfo(usuario.plano);
                  return (
                    <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{usuario.nome}</h4>
                          <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                            {usuario.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{usuario.email}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Último login: {usuario.ultimoLogin}</span>
                          <span>•</span>
                          <span>Criado em: {usuario.dataCriacao}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={planoInfo.cor}>
                          {planoInfo.nome}
                        </Badge>
                        <Select onValueChange={(value) => alterarPlanoUsuario(usuario.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Alterar plano" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="free">Gratuito</SelectItem>
                            <SelectItem value="professional">Profissional</SelectItem>
                            <SelectItem value="enterprise">Empresarial</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant={usuario.status === 'ativo' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => alterarStatusUsuario(usuario.id, usuario.status === 'ativo' ? 'inativo' : 'ativo')}
                        >
                          {usuario.status === 'ativo' ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Widget</label>
                  <Select value={filtros.widgetFilter} onValueChange={(value) => setFiltros(prev => ({ ...prev, widgetFilter: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os widgets" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="todos">Todos os widgets</SelectItem>
                      <SelectItem value="Agente AI">Agente AI</SelectItem>
                      <SelectItem value="Colaboradores">Colaboradores</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Sistema">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar ação</label>
                  <Input
                    placeholder="Digite a ação..."
                    value={filtros.acaoFilter}
                    onChange={(e) => setFiltros(prev => ({ ...prev, acaoFilter: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Logs de Atividade ({logsFiltrados.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logsFiltrados.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-whatsapp rounded-full mt-2" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.usuario}</span>
                        <Badge variant="outline" className="text-xs">{log.widget}</Badge>
                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{log.acao}</p>
                      <p className="text-xs text-gray-500">{log.detalhes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Uso por Widget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Agente AI</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-whatsapp h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Colaboradores</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">WhatsApp</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Atividade por Horário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Gráfico de atividade por horário</p>
                  <p className="text-sm text-gray-500">Implementação futura</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
