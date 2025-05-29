
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/dashboard');
      } else {
        await signUp(email, password, name, 'gratuito');
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="h-8 w-8 text-whatsapp" />
            <span className="text-2xl font-bold text-gray-900">ChatWhatsApp</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Fazer Login' : 'Criar Conta'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta gratuita'}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{isLogin ? 'Login' : 'Cadastro'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Digite suas credenciais para acessar o sistema'
                : 'Preencha os dados para criar sua conta'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full whatsapp-gradient text-white"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isLogin ? "Entrando..." : "Cadastrando...") 
                  : (isLogin ? "Entrar" : "Criar Conta")
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-whatsapp" 
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Criar conta" : "Fazer login"}
                </Button>
              </p>
            </div>

            {/* Quick Admin Login for Testing */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
              <p className="text-xs text-blue-600 mb-2">Para teste - Login Admin:</p>
              <p className="text-xs text-blue-800">Email: admin@admin.com</p>
              <p className="text-xs text-blue-800">Senha: 123123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
