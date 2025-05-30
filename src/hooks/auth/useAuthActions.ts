
import { supabase } from '@/integrations/supabase/client';
import { sendWebhookSafe } from '@/utils/webhook';

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    console.log('🔐 Iniciando processo de login para:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
        }
        
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        }
        
        throw new Error(error.message || 'Erro ao fazer login');
      }

      if (!data.user) {
        throw new Error('Falha na autenticação');
      }

      console.log('✅ Login realizado com sucesso para:', email);

      // Enviar webhook de login
      sendWebhookSafe(data.user.id, 'user_login', {
        user_id: data.user.id,
        email: data.user.email,
        login_timestamp: new Date().toISOString(),
        session_expires: data.session?.expires_at
      }, {
        action: 'user_login',
        automatic: false
      }).catch(console.error);

      return data.user;
    } catch (error) {
      console.error('❌ Erro no processo de login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, plano: string) => {
    console.log('📝 Iniciando processo de cadastro para:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            plano: plano
          }
        }
      });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        
        if (error.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Tente fazer login.');
        }
        
        throw new Error(error.message || 'Erro ao criar conta');
      }

      if (!data.user) {
        throw new Error('Falha ao criar usuário');
      }

      console.log('✅ Cadastro realizado com sucesso para:', email);

      // Enviar webhook de cadastro
      sendWebhookSafe(data.user.id, 'user_signup', {
        user_id: data.user.id,
        email: data.user.email,
        name: name.trim(),
        plano: plano,
        signup_timestamp: new Date().toISOString()
      }, {
        action: 'user_signup',
        automatic: false
      }).catch(console.error);

      return data.user;
    } catch (error) {
      console.error('❌ Erro no processo de cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Iniciando processo de logout');
    
    try {
      // Obter dados do usuário antes do logout para webhook
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
      }

      console.log('✅ Logout realizado com sucesso');

      // Enviar webhook de logout
      if (user) {
        sendWebhookSafe(user.id, 'user_logout', {
          user_id: user.id,
          email: user.email,
          logout_timestamp: new Date().toISOString()
        }, {
          action: 'user_logout',
          automatic: false
        }).catch(console.error);
      }

    } catch (error) {
      console.error('❌ Erro no processo de logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('🔑 Iniciando reset de senha para:', email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ Erro no reset de senha:', error);
        throw error;
      }

      console.log('✅ Email de reset enviado para:', email);

      // Enviar webhook de reset de senha (sem user_id pois pode não estar logado)
      sendWebhookSafe('system', 'password_reset_requested', {
        email: email.trim(),
        reset_timestamp: new Date().toISOString(),
        redirect_url: `${window.location.origin}/reset-password`
      }, {
        action: 'password_reset_request',
        automatic: false
      }).catch(console.error);

    } catch (error) {
      console.error('❌ Erro no processo de reset de senha:', error);
      throw error;
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};
