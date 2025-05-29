
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Shield } from 'lucide-react';

export default function WhatsApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ChatWhatsApp
          </h1>
          <p className="text-xl text-gray-600">
            Escolha como você quer acessar o sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ChatWhatsApp */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle>ChatWhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Acesso isolado por tenant com dados segregados
              </p>
              <Link to="/login">
                <Button className="w-full">
                  Acessar login
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* SaaS */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Sistema SaaS</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Plataforma SaaS com diferentes planos
              </p>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  voltar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dashboard Tradicional */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-purple-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Sistema tradicional de dashboard
              </p>
              <Link to="/dashboard">
                <Button variant="secondary" className="w-full">
                  Acessar Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Credenciais do whatsapp:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong>Admin:</strong><br />
              Email: admin@admin.com<br />
              Senha: 123456
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>Usuário:</strong><br />
              Email: user@empresa.com<br />
              Senha: user2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
