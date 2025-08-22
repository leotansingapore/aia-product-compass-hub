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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          color: string | null
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          color?: string | null
          created_at?: string
          id?: string
          name: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance_leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          requested_at: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          requested_at?: string
          start_date: string
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          requested_at?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance_settings: {
        Row: {
          created_at: string
          id: string
          late_threshold_minutes: number
          required_work_hours: number
          updated_at: string
          work_end_time: string
          work_start_time: string
        }
        Insert: {
          created_at?: string
          id?: string
          late_threshold_minutes?: number
          required_work_hours?: number
          updated_at?: string
          work_end_time?: string
          work_start_time?: string
        }
        Update: {
          created_at?: string
          id?: string
          late_threshold_minutes?: number
          required_work_hours?: number
          updated_at?: string
          work_end_time?: string
          work_start_time?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          item_id: number | null
          new_state: string | null
          prev_state: string | null
          uid: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          item_id?: number | null
          new_state?: string | null
          prev_state?: string | null
          uid: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          item_id?: number | null
          new_state?: string | null
          prev_state?: string | null
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
          {
            foreignKeyName: "audit_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          period: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          id?: string
          period?: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          period?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          category: string
          description_md: string | null
          id: number
          label: string
          sort_order: number
        }
        Insert: {
          category: string
          description_md?: string | null
          id?: number
          label: string
          sort_order: number
        }
        Update: {
          category?: string
          description_md?: string | null
          id?: number
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      coverage_gap: {
        Row: {
          gap_amount: number | null
          id: string
          ideal_amount: number
          in_force_amount: number
          item_id: number
          uid: string
          updated_at: string
        }
        Insert: {
          gap_amount?: number | null
          id?: string
          ideal_amount?: number
          in_force_amount?: number
          item_id: number
          uid: string
          updated_at?: string
        }
        Update: {
          gap_amount?: number | null
          id?: string
          ideal_amount?: number
          in_force_amount?: number
          item_id?: number
          uid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coverage_gap_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coverage_gap_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      custom_roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_system_role: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_system_role?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_system_role?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          item_id: number | null
          label: string
          uid: string
          uploaded_at: string
          url: string
        }
        Insert: {
          id?: string
          item_id?: number | null
          label: string
          uid: string
          uploaded_at?: string
          url: string
        }
        Update: {
          id?: string
          item_id?: number | null
          label?: string
          uid?: string
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      expenses: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_expenses_accounts"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          id: string
          meeting_date: string
          summary_md: string | null
          title: string
          transcript_url: string | null
          uid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_date: string
          summary_md?: string | null
          title: string
          transcript_url?: string | null
          uid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_date?: string
          summary_md?: string | null
          title?: string
          transcript_url?: string | null
          uid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      messages: {
        Row: {
          body_md: string
          created_at: string
          from_role: string
          id: string
          uid: string
        }
        Insert: {
          body_md: string
          created_at?: string
          from_role: string
          id?: string
          uid: string
        }
        Update: {
          body_md?: string
          created_at?: string
          from_role?: string
          id?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          name: string
          route: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          name: string
          route: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          route?: string
          updated_at?: string
        }
        Relationships: []
      }
      phone_verification_codes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          phone_number: string
          user_id: string | null
          verification_code: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          phone_number: string
          user_id?: string | null
          verification_code: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          phone_number?: string
          user_id?: string | null
          verification_code?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      pledge_sheets: {
        Row: {
          average_case_size: number
          call_to_opening_rate: number
          closing_rate: number
          created_at: string
          id: string
          minimum_fyc: number
          name: string
          opening_to_closing_rate: number
          saved_by_name: string | null
          stretched_fyc: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          average_case_size: number
          call_to_opening_rate: number
          closing_rate: number
          created_at?: string
          id?: string
          minimum_fyc: number
          name: string
          opening_to_closing_rate: number
          saved_by_name?: string | null
          stretched_fyc: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          average_case_size?: number
          call_to_opening_rate?: number
          closing_rate?: number
          created_at?: string
          id?: string
          minimum_fyc?: number
          name?: string
          opening_to_closing_rate?: number
          saved_by_name?: string | null
          stretched_fyc?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio_templates: {
        Row: {
          created_at: string
          description: string | null
          fund_allocation: Json
          id: string
          name: string
          risk_profile: string
          strategic_asset_allocation: Json
          target_return: string | null
          updated_at: string
          volatility: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          fund_allocation: Json
          id?: string
          name: string
          risk_profile: string
          strategic_asset_allocation: Json
          target_return?: string | null
          updated_at?: string
          volatility?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          fund_allocation?: Json
          id?: string
          name?: string
          risk_profile?: string
          strategic_asset_allocation?: Json
          target_return?: string | null
          updated_at?: string
          volatility?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_approved: boolean | null
          phone_number: string | null
          phone_verified: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          phone_number?: string | null
          phone_verified?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_devices: {
        Row: {
          created_at: string
          device_id: string
          id: string
          last_used_at: string | null
          platform: string
          push_token: string
          updated_at: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          last_used_at?: string | null
          platform: string
          push_token: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          last_used_at?: string | null
          platform?: string
          push_token?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string
          description: string
          frequency: string
          id: string
          is_active: boolean
          next_due_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string
          description: string
          frequency: string
          id?: string
          is_active?: boolean
          next_due_date: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string
          frequency?: string
          id?: string
          is_active?: boolean
          next_due_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recurring_accounts"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          page_id: string
          role_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          role_name: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          status: string
          title: string
          uid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          title: string
          uid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          uid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      timeline: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          priority: string
          status: string
          title: string
          uid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          priority?: string
          status?: string
          title: string
          uid: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          uid?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      user_assets: {
        Row: {
          asset_type: string
          created_at: string
          current_value: number
          growth_rate: number | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          current_value: number
          growth_rate?: number | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          current_value?: number
          growth_rate?: number | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_checklist: {
        Row: {
          item_id: number
          status: string
          status_date: string
          uid: string
        }
        Insert: {
          item_id: number
          status?: string
          status_date?: string
          uid: string
        }
        Update: {
          item_id?: number
          status?: string
          status_date?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_checklist_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_checklist_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["uid"]
          },
        ]
      }
      user_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          end_age: number | null
          frequency: string
          growth_rate: number | null
          id: string
          name: string
          start_age: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          end_age?: number | null
          frequency?: string
          growth_rate?: number | null
          id?: string
          name: string
          start_age?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          end_age?: number | null
          frequency?: string
          growth_rate?: number | null
          id?: string
          name?: string
          start_age?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_financial_profiles: {
        Row: {
          created_at: string
          id: string
          metrics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string
          cost: number
          created_at: string
          details: Json | null
          id: string
          name: string
          priority: string | null
          target_age: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          cost: number
          created_at?: string
          details?: Json | null
          id?: string
          name: string
          priority?: string | null
          target_age: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          cost?: number
          created_at?: string
          details?: Json | null
          id?: string
          name?: string
          priority?: string | null
          target_age?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_incomes: {
        Row: {
          amount: number
          created_at: string
          end_age: number | null
          frequency: string
          growth_rate: number | null
          id: string
          name: string
          start_age: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          end_age?: number | null
          frequency?: string
          growth_rate?: number | null
          id?: string
          name: string
          start_age?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_age?: number | null
          frequency?: string
          growth_rate?: number | null
          id?: string
          name?: string
          start_age?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_investments: {
        Row: {
          created_at: string
          current_value: number
          expected_return: number | null
          id: string
          investment_type: string
          name: string
          risk_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value: number
          expected_return?: number | null
          id?: string
          investment_type: string
          name: string
          risk_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number
          expected_return?: number | null
          id?: string
          investment_type?: string
          name?: string
          risk_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_liabilities: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          interest_rate: number | null
          liability_type: string
          minimum_payment: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance: number
          id?: string
          interest_rate?: number | null
          liability_type: string
          minimum_payment?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          interest_rate?: number | null
          liability_type?: string
          minimum_payment?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_portfolios: {
        Row: {
          created_at: string
          custom_allocation: Json | null
          custom_name: string | null
          id: string
          notes: string | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_allocation?: Json | null
          custom_name?: string | null
          id?: string
          notes?: string | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_allocation?: Json | null
          custom_name?: string | null
          id?: string
          notes?: string | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portfolios_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "portfolio_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          invited_at: string
          name: string
          role: string
          uid: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          invited_at?: string
          name: string
          role?: string
          uid?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          invited_at?: string
          name?: string
          role?: string
          uid?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          category: string
          created_at: string
          description: string
          expiry_date: string
          id: string
          logo_url: string | null
          name: string
          promo_code: string
          promo_description: string
          redemption_instructions: string
          updated_at: string
          website_url: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          expiry_date: string
          id?: string
          logo_url?: string | null
          name: string
          promo_code: string
          promo_description: string
          redemption_instructions: string
          updated_at?: string
          website_url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          expiry_date?: string
          id?: string
          logo_url?: string | null
          name?: string
          promo_code?: string
          promo_description?: string
          redemption_instructions?: string
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_accessible_pages: {
        Args: { _user_id: string }
        Returns: {
          description: string
          display_name: string
          page_name: string
          route: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_has_access: {
        Args: {
          _min_role?: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_has_any_role: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_has_page_permission: {
        Args: { _page_route: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "consultant" | "manager" | "admin"
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
    Enums: {
      app_role: ["consultant", "manager", "admin"],
    },
  },
} as const
