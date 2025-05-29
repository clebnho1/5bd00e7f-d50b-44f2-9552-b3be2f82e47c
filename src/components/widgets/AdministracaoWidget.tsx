import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Activity, BarChart3, Clock, Search, Filter, RefreshCw, Settings, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProtectedWidget } from '@/components/ProtectedWidget';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type PlanoTipo = Database['public']['Enums']['plano_tipo'];
type UserRole = Database['public']['Enums']['user_role'];

interface Usuario {
  id: string;
  name: string;
  email: string;
  plano: PlanoTipo;
  role: UserRole;
  created_at: string;
}

interface LogActivity {
  id: string;
  user_id: string;
  widget: string;
  action: string;
  created_at: string;
  description: string;
  metadata: any;
}

interface PlanoConfig {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
}

export function AdministracaoWidget() {
  const { toast } = useToast();
  const { isAdmin, user, refreshUserRole } = useAuth();
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [logs, setLogs] = useState<LogActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para configuração de planos
  const [planos, setPlanos] = useState<PlanoConfig[]>([
    {
      id: 'gratuito',
      name: 'Gratuito',
      price: 'R$ 0',
      period: '7 dias trial',
      description: 'Ideal para testar a plataforma',
      features: [
        'Até 100 mensagens/mês',
        '1 agente AI',
        'Suporte básico',
        'Trial de 7 dias'
      ]
    },
    {
      id: 'basico',
      name: 'Básico',
      price: 'R$ 399',
      period: '/mês',
      description: 'Para pequenas empresas',
      features: [
        'Até 5.000 mensagens/mês',
        '5 agentes AI',
        'Suporte prioritário',
        'Análises avançadas',
        'Webhook personalizado'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 699',
      period: '/mês',
      description: 'Para grandes empresas',
      features: [
        'Mensagens ilimitadas',
        'Agentes AI ilimitados',
        'Suporte 24/7',
        'API personalizada',
        'Integrações avançadas',
        'Relatórios detalhados'
      ]
    }
  ]);

  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<{planId: string, index: number} | null>(null);

  const [filtros, setFiltros] = useState({
    usuarioSearch: '',
    planoFilter: 'todos',
    roleFilter: 'todos',
    widgetFilter: 'todos',
    acaoFilter: ''
  });

  useEffect(() => {
    console.log('🔍 [ADMIN_WIDGET] Inicializando widget de administração');
    console.log('🔍 [ADMIN_WIDGET] User:', user?.email, 'isAdmin:', isAdmin());
    
    const initializeWidget = async () => {
      if (user?.email === 'admin@admin.com') {
        // Para o usuário admin, atualizar role antes de carregar dados
        await refreshUserRole();
      }
      
      if (isAdmin()) {
        await fetchData();
      } else {
        console.log('❌ [ADMIN_WIDGET] Usuário não é admin');
        setLoading(false);
      }
    };

    initializeWidget();
  }, [user, isAdmin, refreshUserRole]);

  const fetchData = async () => {
    console.log('🔄 [ADMIN_WIDGET] Iniciando carregamento de dados');
    await Promise.all([fetchUsuarios(), fetchLogs()]);
  };

  const fetchUsuarios = async () => {
    try {
      console.log('👥 [USUARIOS] Buscando usuários...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [USUARIOS] Erro ao carregar usuários:', error);
        throw error;
      }
      
      console.log('✅ [USUARIOS] Usuários carregados:', data?.length || 0);
      setUsuarios(data || []);
    } catch (error: any) {
      console.error('💥 [USUARIOS] Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const fetchLogs = async () => {
    try {
      console.log('📊 [LOGS] Buscando logs...');
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ [LOGS] Erro ao carregar logs:', error);
        throw error;
      }
      
      console.log('✅ [LOGS] Logs carregados:', data?.length || 0);
      setLogs(data || []);
    } catch (error: any) {
      console.error('💥 [LOGS] Erro ao carregar logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: "Dados atualizados",
      description: "Os dados foram recarregados com sucesso.",
    });
  };

  const getPlanoInfo = (plano: PlanoTipo) => {
    const planos = {
      gratuito: { nome: 'Gratuito', cor: 'bg-gray-100 text-gray-800' },
      basico: { nome: 'Básico', cor: 'bg-blue-100 text-blue-800' },
      premium: { nome: 'Premium', cor: 'bg-purple-100 text-purple-800' }
    };
    return planos[plano] || planos.gratuito;
  };

  const getRoleInfo = (role: UserRole) => {
    const roles = {
      admin: { nome: 'Admin', cor: 'bg-red-100 text-red-800' },
      user: { nome: 'Usuário', cor: 'bg-green-100 text-green-800' }
    };
    return roles[role] || roles.user;
  };

  const alterarPlanoUsuario = async (userId: string, novoPlano: string) => {
    try {
      console.log('🔄 [PLANO] Alterando plano do usuário:', userId, 'para:', novoPlano);
      
      const { error } = await supabase
        .from('users')
        .update({ plano: novoPlano as PlanoTipo })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Plano alterado",
        description: "Plano do usuário foi atualizado com sucesso.",
      });

      fetchUsuarios();
    } catch (error: any) {
      console.error('❌ [PLANO] Erro ao alterar plano:', error);
      toast({
        title: "Erro ao alterar plano",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const alterarRoleUsuario = async (userId: string, novaRole: string) => {
    try {
      console.log('🔄 [ROLE] Alterando role do usuário:', userId, 'para:', novaRole);
      
      const { error } = await supabase
        .from('users')
        .update({ role: novaRole as UserRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Role alterada",
        description: "Role do usuário foi atualizada com sucesso.",
      });

      fetchUsuarios();
    } catch (error: any) {
      console.error('❌ [ROLE] Erro ao alterar role:', error);
      toast({
        title: "Erro ao alterar role",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const updatePlanField = (planId: string, field: keyof PlanoConfig, value: string) => {
    setPlanos(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, [field]: value } : plan
    ));
  };

  const updatePlanFeature = (planId: string, featureIndex: number, value: string) => {
    setPlanos(prev => prev.map(plan => 
      plan.id === planId 
        ? { 
            ...plan, 
            features: plan.features.map((feature, index) => 
              index === featureIndex ? value : feature
            ) 
          } 
        : plan
    ));
  };

  const addFeature = (planId: string) => {
    setPlanos(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, features: [...plan.features, 'Nova funcionalidade'] }
        : plan
    ));
  };

  const removeFeature = (planId: string, featureIndex: number) => {
    setPlanos(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, features: plan.features.filter((_, index) => index !== featureIndex) }
        : plan
    ));
  };

  const savePlansConfig = () => {
    // Aqui você salvaria no localStorage ou banco de dados
    localStorage.setItem('planos_config', JSON.stringify(planos));
    toast({
      title: "Configurações salvas",
      description: "As configurações dos planos foram salvas com sucesso.",
    });
    setEditingPlan(null);
    setEditingFeature(null);
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    return (
      usuario.name.toLowerCase().includes(filtros.usuarioSearch.toLowerCase()) &&
      (filtros.planoFilter === 'todos' || usuario.plano === filtros.planoFilter) &&
      (filtros.roleFilter === 'todos' || usuario.role === filtros.roleFilter)
    );
  });

  const logsFiltrados = logs.filter(log => {
    return (
      (filtros.widgetFilter === 'todos' || log.widget === filtros.widgetFilter) &&
      (filtros.acaoFilter === '' || log.action.toLowerCase().includes(filtros.acaoFilter.toLowerCase()))
    );
  });

  const estatisticas = {
    totalUsuarios: usuarios.length,
    usuariosAdmin: usuarios.filter(u => u.role === 'admin').length,
    usuariosPorPlano: {
      gratuito: usuarios.filter(u => u.plano === 'gratuito').length,
      basico: usuarios.filter(u => u.plano === 'basico').length,
      premium: usuarios.filter(u => u.plano === 'premium').length
    },
    logsHoje: logs.filter(log => {
      const hoje = new Date().toISOString().split('T')[0];
      return log.created_at.startsWith(hoje);
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp"></div>
      </div>
    );
  }

  return (
    <ProtectedWidget requiredRole="admin" widgetName="Administração">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-whatsapp" />
            <h2 className="text-2xl font-bold">Administração do Sistema</h2>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
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
                {estatisticas.usuariosAdmin} administradores
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Plano Gratuito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.usuariosPorPlano.gratuito}</div>
              <p className="text-xs text-muted-foreground">usuários</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Plano Básico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.usuariosPorPlano.basico}</div>
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
            <TabsTrigger value="planos">Gerenciar Planos</TabsTrigger>
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
                        <SelectItem value="gratuito">Gratuito</SelectItem>
                        <SelectItem value="basico">Básico</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select value={filtros.roleFilter} onValueChange={(value) => setFiltros(prev => ({ ...prev, roleFilter: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as roles" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="todos">Todas as roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
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
                    const roleInfo = getRoleInfo(usuario.role);
                    return (
                      <div key={usuario.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{usuario.name}</h4>
                            <Badge className={roleInfo.cor}>
                              {roleInfo.nome}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{usuario.email}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Criado em: {new Date(usuario.created_at).toLocaleDateString('pt-BR')}</span>
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
                              <SelectItem value="gratuito">Gratuito</SelectItem>
                              <SelectItem value="basico">Básico</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select onValueChange={(value) => alterarRoleUsuario(usuario.id, value)}>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-50">
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                  
                  {usuariosFiltrados.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nenhum usuário encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações dos Planos
                  </div>
                  <Button onClick={savePlansConfig} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </CardTitle>
                <CardDescription>
                  Configure os planos disponíveis no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {planos.map((plano) => (
                    <Card key={plano.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          {editingPlan === plano.id ? (
                            <Input
                              value={plano.name}
                              onChange={(e) => updatePlanField(plano.id, 'name', e.target.value)}
                              className="font-semibold"
                            />
                          ) : (
                            <CardTitle>{plano.name}</CardTitle>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPlan(editingPlan === plano.id ? null : plano.id)}
                          >
                            {editingPlan === plano.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                          </Button>
                        </div>
                        {editingPlan === plano.id ? (
                          <Input
                            value={plano.description}
                            onChange={(e) => updatePlanField(plano.id, 'description', e.target.value)}
                            className="text-sm"
                          />
                        ) : (
                          <CardDescription>{plano.description}</CardDescription>
                        )}
                        <div className="mt-4 flex items-center gap-2">
                          {editingPlan === plano.id ? (
                            <>
                              <Input
                                value={plano.price}
                                onChange={(e) => updatePlanField(plano.id, 'price', e.target.value)}
                                className="w-24 text-2xl font-bold"
                              />
                              <Input
                                value={plano.period}
                                onChange={(e) => updatePlanField(plano.id, 'period', e.target.value)}
                                className="w-20 text-sm"
                              />
                            </>
                          ) : (
                            <>
                              <span className="text-3xl font-bold">{plano.price}</span>
                              <span className="text-gray-500">{plano.period}</span>
                            </>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-2">
                          {plano.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              {editingPlan === plano.id ? (
                                <div className="flex-1 flex items-center gap-2">
                                  <Input
                                    value={feature}
                                    onChange={(e) => updatePlanFeature(plano.id, index, e.target.value)}
                                    className="text-sm"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFeature(plano.id, index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-sm">{feature}</span>
                              )}
                            </div>
                          ))}
                          
                          {editingPlan === plano.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addFeature(plano.id)}
                              className="w-full mt-2"
                            >
                              + Adicionar Funcionalidade
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                          <span className="font-medium">User ID: {log.user_id}</span>
                          <Badge variant="outline" className="text-xs">{log.widget}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{log.action}</p>
                        {log.description && (
                          <p className="text-xs text-gray-500">{log.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {logsFiltrados.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nenhum log encontrado</p>
                    </div>
                  )}
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
                    Distribuição de Planos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Gratuito</span>
                      <span className="text-sm font-medium">{estatisticas.usuariosPorPlano.gratuito}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full" 
                        style={{ 
                          width: `${estatisticas.totalUsuarios > 0 ? (estatisticas.usuariosPorPlano.gratuito / estatisticas.totalUsuarios) * 100 : 0}%` 
                        }} 
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Básico</span>
                      <span className="text-sm font-medium">{estatisticas.usuariosPorPlano.basico}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${estatisticas.totalUsuarios > 0 ? (estatisticas.usuariosPorPlano.basico / estatisticas.totalUsuarios) * 100 : 0}%` 
                        }} 
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Premium</span>
                      <span className="text-sm font-medium">{estatisticas.usuariosPorPlano.premium}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ 
                          width: `${estatisticas.totalUsuarios > 0 ? (estatisticas.usuariosPorPlano.premium / estatisticas.totalUsuarios) * 100 : 0}%` 
                        }} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Resumo Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total de usuários:</span>
                      <span className="font-medium">{estatisticas.totalUsuarios}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Administradores:</span>
                      <span className="font-medium">{estatisticas.usuariosAdmin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Logs hoje:</span>
                      <span className="font-medium">{estatisticas.logsHoje}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total de logs:</span>
                      <span className="font-medium">{logs.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedWidget>
  );
}
