
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Settings, Database } from 'lucide-react';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { NotificationCenter } from '@/components/NotificationCenter';
import { FileUpload } from '@/components/FileUpload';
import { RealtimeChat } from '@/components/RealtimeChat';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">SaaS Dashboard</h1>
                <p className="text-sm text-gray-600">Sistema Completo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user?.user_metadata?.name || user?.email}</p>
                <Badge variant="secondary" className="text-xs">
                  {user?.user_metadata?.role || 'user'}
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Usuário ativo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Assinatura ativa</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 MB</div>
                <p className="text-xs text-muted-foreground">Usado de 1GB</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">✅</div>
                <p className="text-xs text-muted-foreground">Sistema online</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gerenciamento de Assinatura */}
            <div className="space-y-6">
              <SubscriptionManager />
            </div>

            {/* Chat em Tempo Real */}
            <div className="space-y-6">
              <RealtimeChat roomId="admin" />
            </div>
          </div>

          {/* Segunda linha de conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload de Arquivos */}
            <FileUpload 
              folder="admin" 
              onUploadComplete={(fileData) => {
                console.log('Arquivo enviado:', fileData);
              }}
            />

            {/* Centro de Notificações */}
            <NotificationCenter />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
