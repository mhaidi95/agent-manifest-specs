export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_actions: {
        Row: {
          app_id: string
          created_at: string
          description: string | null
          endpoint: string | null
          id: string
          method: string
          name: string
          parameters: Json | null
          requires_approval: boolean
          risk_level: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          description?: string | null
          endpoint?: string | null
          id?: string
          method?: string
          name: string
          parameters?: Json | null
          requires_approval?: boolean
          risk_level?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          description?: string | null
          endpoint?: string | null
          id?: string
          method?: string
          name?: string
          parameters?: Json | null
          requires_approval?: boolean
          risk_level?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "connected_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_tokens: {
        Row: {
          agent_identity: string
          allowed_scopes: string[]
          app_id: string
          created_at: string
          expires_at: string | null
          id: string
          label: string
          last_used_at: string | null
          revoked_at: string | null
          token_hash: string
          token_prefix: string
          user_id: string
        }
        Insert: {
          agent_identity: string
          allowed_scopes?: string[]
          app_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          label: string
          last_used_at?: string | null
          revoked_at?: string | null
          token_hash: string
          token_prefix: string
          user_id: string
        }
        Update: {
          agent_identity?: string
          allowed_scopes?: string[]
          app_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string
          last_used_at?: string | null
          revoked_at?: string | null
          token_hash?: string
          token_prefix?: string
          user_id?: string
        }
        Relationships: []
      }
      approval_rules: {
        Row: {
          app_id: string
          condition: string
          created_at: string
          enabled: boolean
          id: string
          name: string
          notify_email: string | null
          threshold: number | null
          user_id: string
        }
        Insert: {
          app_id: string
          condition: string
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          notify_email?: string | null
          threshold?: number | null
          user_id: string
        }
        Update: {
          app_id?: string
          condition?: string
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          notify_email?: string | null
          threshold?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_rules_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "connected_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_name: string
          agent_identity: string | null
          app_id: string | null
          created_at: string
          id: string
          payload: Json | null
          status: string
          user_id: string
        }
        Insert: {
          action_name: string
          agent_identity?: string | null
          app_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          action_name?: string
          agent_identity?: string | null
          app_id?: string | null
          created_at?: string
          id?: string
          payload?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "connected_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_apps: {
        Row: {
          base_url: string
          created_at: string
          description: string | null
          id: string
          manifest: Json | null
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_url: string
          created_at?: string
          description?: string | null
          id?: string
          manifest?: Json | null
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_url?: string
          created_at?: string
          description?: string | null
          id?: string
          manifest?: Json | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_approvals: {
        Row: {
          action_name: string
          agent_identity: string | null
          app_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          expires_at: string
          id: string
          payload: Json | null
          reason: string | null
          status: string
          token_id: string | null
          user_id: string
        }
        Insert: {
          action_name: string
          agent_identity?: string | null
          app_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          expires_at?: string
          id?: string
          payload?: Json | null
          reason?: string | null
          status?: string
          token_id?: string | null
          user_id: string
        }
        Update: {
          action_name?: string
          agent_identity?: string | null
          app_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          expires_at?: string
          id?: string
          payload?: Json | null
          reason?: string | null
          status?: string
          token_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action_id: string | null
          allowed_agents: string[] | null
          app_id: string
          created_at: string
          enabled: boolean
          id: string
          scope: string
          user_id: string
        }
        Insert: {
          action_id?: string | null
          allowed_agents?: string[] | null
          app_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          scope: string
          user_id: string
        }
        Update: {
          action_id?: string | null
          allowed_agents?: string[] | null
          app_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          scope?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "agent_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "connected_apps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      lookup_active_token: {
        Args: { _hash: string }
        Returns: {
          agent_identity: string
          allowed_scopes: string[]
          app_id: string
          id: string
          label: string
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
