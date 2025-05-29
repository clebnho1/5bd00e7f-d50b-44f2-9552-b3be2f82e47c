
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookSafe } from '@/utils/webhook';

export function useAuthActions() {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    if (!email?.trim() || !password?.trim()) {
      const errorMsg = "Email e senha são obrigatórios";
      toast({
        title: "Campos obrigatórios",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    try {
      console.log('🚀 [SIGNIN] Tentando login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ [SIGNIN_ERROR]', error);
        let errorMessage = "Erro no login";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou senha incorretos";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Muitas tentativas. Aguarde alguns minutos";
        }

        // Webhook para erro de login
        if (data.user?.id) {
          await sendWebhookSafe(data.user.id, 'user_login_failed', {
            email: email.trim(),
            error: errorMessage,
            timestamp: new Date().toISOString()
          }, {
            action: 'login_failed',
            error_type: error.message.includes('Invalid login credentials') ? 'invalid_credentials' : 'other'
          });
        }

        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }

      console.log('✅ [SIGNIN_SUCCESS] Login realizado:', data.user?.email);
      
      // Webhook para login bem-sucedido
      if (data.user?.id) {
        await sendWebhookSafe(data.user.id, 'user_login_success', {
          email: data.user.email,
          user_id: data.user.id,
          timestamp: new Date().toISOString(),
          last_sign_in: data.user.last_sign_in_at
        }, {
          action: 'login_success',
          session_started: true
        });
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      
    } catch (error: any) {
      console.error('💥 [SIGNIN_CRASH]', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, plano: string) => {
    if (!email?.trim() || !password?.trim() || !name?.trim()) {
      const errorMsg = "Todos os campos são obrigatórios";
      toast({
        title: "Campos obrigatórios",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    if (password.length < 6) {
      const errorMsg = "A senha deve ter pelo menos 6 caracteres";
      toast({
        title: "Senha muito fraca",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    try {
      console.log('🚀 [SIGNUP] Tentando cadastro para:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            plano: plano,
          },
        },
      });

      if (error) {
        console.error('❌ [SIGNUP_ERROR]', error);
        let errorMessage = "Erro no cadastro";
        
        if (error.message.includes('User already registered') || 
            error.message.includes('duplicate key value violates unique constraint')) {
          errorMessage = "Este email já está cadastrado";
          
          toast({
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login.",
            variant: "destructive",
          });
          
          throw new Error(errorMessage);
        }

        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage);
      }

      console.log('✅ [SIGNUP_SUCCESS] Cadastro realizado:', data.user?.email);

      // Webhook para cadastro bem-sucedido
      if (data.user?.id) {
        await sendWebhookSafe(data.user.id, 'user_signup_success', {
          email: data.user.email,
          user_id: data.user.id,
          name: name.trim(),
          plano: plano,
          timestamp: new Date().toISOString(),
          email_confirmed: !!data.session
        }, {
          action: 'signup_success',
          requires_confirmation: !data.session
        });
      }

      if (data.user && !data.session) {
        toast({
          title: "Verifique seu email",
          description: "Um link de confirmação foi enviado para seu email.",
        });
      } else if (data.session) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo ao sistema!",
        });
      }
    } catch (error: any) {
      console.error('💥 [SIGNUP_CRASH]', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 [SIGNOUT] Fazendo logout');
      
      // Capturar user_id antes do logout
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      await supabase.auth.signOut();
      
      // Webhook para logout
      if (userId) {
        await sendWebhookSafe(userId, 'user_logout', {
          user_id: userId,
          timestamp: new Date().toISOString()
        }, {
          action: 'logout',
          session_ended: true
        });
      }
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      console.error('❌ [SIGNOUT_ERROR]', error);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email?.trim()) {
      const errorMsg = "Email é obrigatório";
      toast({
        title: "Campo obrigatório",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }

    try {
      console.log('🔑 [RESET_PASSWORD] Enviando email para:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ [RESET_PASSWORD_ERROR]', error);
        
        // Webhook para erro no reset
        await sendWebhookSafe('system', 'password_reset_failed', {
          email: email.trim(),
          error: error.message,
          timestamp: new Date().toISOString()
        }, {
          action: 'password_reset_failed'
        });
        
        toast({
          title: "Erro ao enviar email",
          description: error.message || "Erro desconhecido",
          variant: "destructive",
        });
        throw error;
      }

      console.log('✅ [RESET_PASSWORD_SUCCESS] Email enviado');
      
      // Webhook para reset bem-sucedido
      await sendWebhookSafe('system', 'password_reset_requested', {
        email: email.trim(),
        timestamp: new Date().toISOString()
      }, {
        action: 'password_reset_requested'
      });
      
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error('💥 [RESET_PASSWORD_CRASH]', error);
      throw error;
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword
  };
}
