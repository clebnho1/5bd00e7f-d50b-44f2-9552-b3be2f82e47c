export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          user_id: string
          widget: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
          widget: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
          widget?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agentes_ai: {
        Row: {
          area_atuacao: string
          created_at: string
          email_empresa: string | null
          endereco_empresa: string | null
          estilo_comportamento: string
          funcoes: string[] | null
          id: string
          nome: string
          nome_empresa: string
          sexo: string
          telefone_empresa: string | null
          updated_at: string
          usar_emotion: boolean
          user_id: string
          website_empresa: string | null
        }
        Insert: {
          area_atuacao?: string
          created_at?: string
          email_empresa?: string | null
          endereco_empresa?: string | null
          estilo_comportamento?: string
          funcoes?: string[] | null
          id?: string
          nome?: string
          nome_empresa?: string
          sexo?: string
          telefone_empresa?: string | null
          updated_at?: string
          usar_emotion?: boolean
          user_id: string
          website_empresa?: string | null
        }
        Update: {
          area_atuacao?: string
          created_at?: string
          email_empresa?: string | null
          endereco_empresa?: string | null
          estilo_comportamento?: string
          funcoes?: string[] | null
          id?: string
          nome?: string
          nome_empresa?: string
          sexo?: string
          telefone_empresa?: string | null
          updated_at?: string
          usar_emotion?: boolean
          user_id?: string
          website_empresa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agentes_ai_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      areas_atuacao: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      colaboradores: {
        Row: {
          ativo: boolean
          cargo: string | null
          created_at: string
          email: string | null
          horarios: string | null
          horarios_detalhados: Json | null
          id: string
          imagem_url: string | null
          nome: string
          produtos: string[] | null
          produtos_detalhados: Json | null
          produtos_precos: Json | null
          telefone: string | null
          unidade: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          email?: string | null
          horarios?: string | null
          horarios_detalhados?: Json | null
          id?: string
          imagem_url?: string | null
          nome: string
          produtos?: string[] | null
          produtos_detalhados?: Json | null
          produtos_precos?: Json | null
          telefone?: string | null
          unidade?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          email?: string | null
          horarios?: string | null
          horarios_detalhados?: Json | null
          id?: string
          imagem_url?: string | null
          nome?: string
          produtos?: string[] | null
          produtos_detalhados?: Json | null
          produtos_precos?: Json | null
          telefone?: string | null
          unidade?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estilos_comportamento: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          room_id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plan_notifications: {
        Row: {
          created_at: string | null
          dashboard_sent: boolean | null
          email_sent: boolean | null
          id: string
          notification_type: string
          sent_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dashboard_sent?: boolean | null
          email_sent?: boolean | null
          id?: string
          notification_type: string
          sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dashboard_sent?: boolean | null
          email_sent?: boolean | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          plan: string
          started_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          plano: Database["public"]["Enums"]["plano_tipo"]
          plano_active: boolean | null
          plano_expires_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          trial_expires_at: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id: string
          name: string
          plano?: Database["public"]["Enums"]["plano_tipo"]
          plano_active?: boolean | null
          plano_expires_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          trial_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          plano?: Database["public"]["Enums"]["plano_tipo"]
          plano_active?: boolean | null
          plano_expires_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          trial_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          created_at: string
          id: string
          nome_empresa: string
          qr_code: string | null
          status: Database["public"]["Enums"]["whatsapp_status"]
          ultima_verificacao: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_empresa: string
          qr_code?: string | null
          status?: Database["public"]["Enums"]["whatsapp_status"]
          ultima_verificacao?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_empresa?: string
          qr_code?: string | null
          status?: Database["public"]["Enums"]["whatsapp_status"]
          ultima_verificacao?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_expired_plans: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_webhook_url: {
        Args: { user_id_param: string }
        Returns: {
          webhook_url: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_own_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_own_user_record: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_widget: string
          p_action: string
          p_description?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      save_user_webhook_url: {
        Args: { user_id_param: string; webhook_url_param: string }
        Returns: undefined
      }
      update_expired_plans: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      plano_tipo:
        | "gratuito"
        | "basico"
        | "premium"
        | "profissional"
        | "empresarial"
      user_role: "admin" | "user"
      whatsapp_status: "desconectado" | "conectando" | "conectado" | "erro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      plano_tipo: [
        "gratuito",
        "basico",
        "premium",
        "profissional",
        "empresarial",
      ],
      user_role: ["admin", "user"],
      whatsapp_status: ["desconectado", "conectando", "conectado", "erro"],
    },
  },
} as const
