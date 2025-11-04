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
      achievements: {
        Row: {
          badge_color: string | null
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number | null
        }
        Insert: {
          badge_color?: string | null
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number | null
        }
        Update: {
          badge_color?: string | null
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number | null
        }
        Relationships: []
      }
      app_pages: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          path: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id: string
          name: string
          path: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          path?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_sections: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_tabs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          page_id: string
          tab_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          name: string
          page_id: string
          tab_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          page_id?: string
          tab_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_tabs_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "app_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_audit_log: {
        Row: {
          action: string
          booking_id: string | null
          client_ip: unknown
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          booking_id?: string | null
          client_ip?: unknown
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          booking_id?: string | null
          client_ip?: unknown
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_audit_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount_cents: number | null
          bathrooms: string | null
          bedrooms: string | null
          booking_source: string | null
          cleaning_date: string
          client_ip: unknown
          completed_at: string | null
          created_at: string
          currency: string | null
          duration: string
          frequency: string
          has_pet: boolean | null
          help_needed: boolean | null
          id: string
          language: string
          need_decluttering: boolean | null
          need_ironing: boolean | null
          payment_status: string | null
          selected_plan: string
          start_time: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          bathrooms?: string | null
          bedrooms?: string | null
          booking_source?: string | null
          cleaning_date: string
          client_ip?: unknown
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          duration: string
          frequency: string
          has_pet?: boolean | null
          help_needed?: boolean | null
          id?: string
          language?: string
          need_decluttering?: boolean | null
          need_ironing?: boolean | null
          payment_status?: string | null
          selected_plan: string
          start_time: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          bathrooms?: string | null
          bedrooms?: string | null
          booking_source?: string | null
          cleaning_date?: string
          client_ip?: unknown
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          duration?: string
          frequency?: string
          has_pet?: boolean | null
          help_needed?: boolean | null
          id?: string
          language?: string
          need_decluttering?: boolean | null
          need_ironing?: boolean | null
          payment_status?: string | null
          selected_plan?: string
          start_time?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          useful_links: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          useful_links?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          useful_links?: Json | null
        }
        Relationships: []
      }
      coaching_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message: string
          session_id: string
          timestamp_offset: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message: string
          session_id: string
          timestamp_offset: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message?: string
          session_id?: string
          timestamp_offset?: number
        }
        Relationships: [
          {
            foreignKeyName: "coaching_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "roleplay_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_transcripts: {
        Row: {
          confidence: number | null
          created_at: string
          filler_words: string[] | null
          id: string
          session_id: string
          speaker: string
          text: string
          timestamp_offset: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          filler_words?: string[] | null
          id?: string
          session_id: string
          speaker: string
          text: string
          timestamp_offset: number
        }
        Update: {
          confidence?: number | null
          created_at?: string
          filler_words?: string[] | null
          id?: string
          session_id?: string
          speaker?: string
          text?: string
          timestamp_offset?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_transcripts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "roleplay_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      file_embeddings: {
        Row: {
          content: string
          created_at: string
          embedding: Json
          file_id: string
          id: string
          processed_at: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding: Json
          file_id: string
          id?: string
          processed_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: Json
          file_id?: string
          id?: string
          processed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_embeddings_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category_id: string
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
        }
        Insert: {
          category_id: string
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          category_id: string
          completed_at: string
          id: string
          product_id: string | null
          progress_type: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          category_id: string
          completed_at?: string
          id?: string
          product_id?: string | null
          progress_type: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          category_id?: string
          completed_at?: string
          id?: string
          product_id?: string | null
          progress_type?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      mentor_annotations: {
        Row: {
          annotation_type: string
          content: string
          created_at: string
          id: string
          review_id: string
          timestamp_seconds: number
        }
        Insert: {
          annotation_type: string
          content: string
          created_at?: string
          id?: string
          review_id: string
          timestamp_seconds: number
        }
        Update: {
          annotation_type?: string
          content?: string
          created_at?: string
          id?: string
          review_id?: string
          timestamp_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "mentor_annotations_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "mentor_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_reviews: {
        Row: {
          assigned_at: string
          completed_at: string | null
          created_at: string
          id: string
          mentor_feedback: string | null
          mentor_id: string
          mentor_notes: Json | null
          mentor_score: number | null
          session_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mentor_feedback?: string | null
          mentor_id: string
          mentor_notes?: Json | null
          mentor_score?: number | null
          session_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mentor_feedback?: string | null
          mentor_id?: string
          mentor_notes?: Json | null
          mentor_score?: number | null
          session_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "roleplay_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_rate_limits: {
        Row: {
          attempted_at: string
          created_at: string
          email: string
          id: string
          ip_address: string | null
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          attempted_at?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          assistant_id: string | null
          assistant_instructions: string | null
          category_id: string
          chatbot_1_name: string | null
          chatbot_2_name: string | null
          chatbot_3_name: string | null
          chatbot_button_text: string | null
          chatbot_link_2: string | null
          chatbot_link_3: string | null
          created_at: string
          custom_gpt_link: string | null
          description: string | null
          highlights: string[] | null
          id: string
          tags: string[] | null
          title: string
          training_videos: Json | null
          updated_at: string
          useful_links: Json | null
        }
        Insert: {
          assistant_id?: string | null
          assistant_instructions?: string | null
          category_id: string
          chatbot_1_name?: string | null
          chatbot_2_name?: string | null
          chatbot_3_name?: string | null
          chatbot_button_text?: string | null
          chatbot_link_2?: string | null
          chatbot_link_3?: string | null
          created_at?: string
          custom_gpt_link?: string | null
          description?: string | null
          highlights?: string[] | null
          id: string
          tags?: string[] | null
          title: string
          training_videos?: Json | null
          updated_at?: string
          useful_links?: Json | null
        }
        Update: {
          assistant_id?: string | null
          assistant_instructions?: string | null
          category_id?: string
          chatbot_1_name?: string | null
          chatbot_2_name?: string | null
          chatbot_3_name?: string | null
          chatbot_button_text?: string | null
          chatbot_link_2?: string | null
          chatbot_link_3?: string | null
          created_at?: string
          custom_gpt_link?: string | null
          description?: string | null
          highlights?: string[] | null
          id?: string
          tags?: string[] | null
          title?: string
          training_videos?: Json | null
          updated_at?: string
          useful_links?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          current_level: number | null
          display_name: string | null
          email: string | null
          first_login: boolean | null
          first_name: string | null
          id: string
          last_active_date: string | null
          last_name: string | null
          password_changed_at: string | null
          postcode: string | null
          streak_days: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          current_level?: number | null
          display_name?: string | null
          email?: string | null
          first_login?: boolean | null
          first_name?: string | null
          id?: string
          last_active_date?: string | null
          last_name?: string | null
          password_changed_at?: string | null
          postcode?: string | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          current_level?: number | null
          display_name?: string | null
          email?: string | null
          first_login?: boolean | null
          first_name?: string | null
          id?: string
          last_active_date?: string | null
          last_name?: string | null
          password_changed_at?: string | null
          postcode?: string | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          completed_at: string
          id: string
          product_id: string
          score: number
          total_questions: number
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string
          id?: string
          product_id: string
          score: number
          total_questions: number
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string
          id?: string
          product_id?: string
          score?: number
          total_questions?: number
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      roleplay_feedback: {
        Row: {
          active_listening_score: number
          body_language_analysis: string | null
          coaching_points: string[] | null
          communication_score: number
          conversation_flow_summary: Json | null
          conversation_summary: string | null
          created_at: string
          detailed_rubric_feedback: Json | null
          follow_up_questions: string[] | null
          generation_status: string
          id: string
          improvement_areas: string[] | null
          objection_handling_score: number
          overall_score: number
          pain_point_identification_score: number | null
          practice_score: number | null
          previous_attempt_comparison: string | null
          product_knowledge_score: number
          pronunciation_feedback: string | null
          session_id: string
          small_talk_score: number | null
          specific_feedback: string
          strengths: string[] | null
          tone_analysis: string[] | null
          tone_detailed_analysis: string | null
          visual_presence_analysis: string[] | null
        }
        Insert: {
          active_listening_score: number
          body_language_analysis?: string | null
          coaching_points?: string[] | null
          communication_score: number
          conversation_flow_summary?: Json | null
          conversation_summary?: string | null
          created_at?: string
          detailed_rubric_feedback?: Json | null
          follow_up_questions?: string[] | null
          generation_status?: string
          id?: string
          improvement_areas?: string[] | null
          objection_handling_score: number
          overall_score: number
          pain_point_identification_score?: number | null
          practice_score?: number | null
          previous_attempt_comparison?: string | null
          product_knowledge_score: number
          pronunciation_feedback?: string | null
          session_id: string
          small_talk_score?: number | null
          specific_feedback: string
          strengths?: string[] | null
          tone_analysis?: string[] | null
          tone_detailed_analysis?: string | null
          visual_presence_analysis?: string[] | null
        }
        Update: {
          active_listening_score?: number
          body_language_analysis?: string | null
          coaching_points?: string[] | null
          communication_score?: number
          conversation_flow_summary?: Json | null
          conversation_summary?: string | null
          created_at?: string
          detailed_rubric_feedback?: Json | null
          follow_up_questions?: string[] | null
          generation_status?: string
          id?: string
          improvement_areas?: string[] | null
          objection_handling_score?: number
          overall_score?: number
          pain_point_identification_score?: number | null
          practice_score?: number | null
          previous_attempt_comparison?: string | null
          product_knowledge_score?: number
          pronunciation_feedback?: string | null
          session_id?: string
          small_talk_score?: number | null
          specific_feedback?: string
          strengths?: string[] | null
          tone_analysis?: string[] | null
          tone_detailed_analysis?: string | null
          visual_presence_analysis?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "roleplay_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "roleplay_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      roleplay_performance_metrics: {
        Row: {
          created_at: string
          id: string
          metric_description: string | null
          metric_name: string
          metric_value: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_description?: string | null
          metric_name: string
          metric_value: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_description?: string | null
          metric_name?: string
          metric_value?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roleplay_performance_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "roleplay_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      roleplay_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          recording_completed_at: string | null
          recording_started_at: string | null
          recording_status: string | null
          scenario_category: string
          scenario_difficulty: string
          scenario_title: string
          started_at: string
          tavus_conversation_id: string | null
          transcript: Json | null
          updated_at: string
          user_id: string
          video_duration_seconds: number | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          recording_completed_at?: string | null
          recording_started_at?: string | null
          recording_status?: string | null
          scenario_category: string
          scenario_difficulty: string
          scenario_title: string
          started_at?: string
          tavus_conversation_id?: string | null
          transcript?: Json | null
          updated_at?: string
          user_id: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          recording_completed_at?: string | null
          recording_started_at?: string | null
          recording_status?: string | null
          scenario_category?: string
          scenario_difficulty?: string
          scenario_title?: string
          started_at?: string
          tavus_conversation_id?: string | null
          transcript?: Json | null
          updated_at?: string
          user_id?: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      speech_metrics: {
        Row: {
          created_at: string
          energy_level: number | null
          filler_word_count: number | null
          id: string
          pause_duration_ms: number | null
          session_id: string
          speaking_time_ms: number | null
          timestamp_offset: number
          words_per_minute: number | null
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          filler_word_count?: number | null
          id?: string
          pause_duration_ms?: number | null
          session_id: string
          speaking_time_ms?: number | null
          timestamp_offset: number
          words_per_minute?: number | null
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          filler_word_count?: number | null
          id?: string
          pause_duration_ms?: number | null
          session_id?: string
          speaking_time_ms?: number | null
          timestamp_offset?: number
          words_per_minute?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "speech_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "roleplay_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tier_permissions: {
        Row: {
          access_type: string
          created_at: string
          id: string
          resource_id: string
          tier_level: string
          updated_at: string
        }
        Insert: {
          access_type: string
          created_at?: string
          id?: string
          resource_id: string
          tier_level: string
          updated_at?: string
        }
        Update: {
          access_type?: string
          created_at?: string
          id?: string
          resource_id?: string
          tier_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_access_tiers: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          tier_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          tier_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          tier_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_admin_roles: {
        Row: {
          admin_role: string
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_role?: string
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_role?: string
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_approval_requests: {
        Row: {
          auth_user_id: string | null
          clerk_user_id: string | null
          company: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          clerk_user_id?: string | null
          company?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          clerk_user_id?: string | null
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_bookmarks: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          order: number
          product_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          order?: number
          product_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          order?: number
          product_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tiers: {
        Row: {
          created_at: string
          granted_at: string
          granted_by: string | null
          id: string
          tier_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          tier_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          tier_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          completion_percentage: number | null
          created_at: string
          id: string
          product_id: string
          updated_at: string
          user_id: string
          video_id: string
          watch_time_seconds: number | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
          user_id: string
          video_id: string
          watch_time_seconds?: number | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
          user_id?: string
          video_id?: string
          watch_time_seconds?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user_request: { Args: { request_id: string }; Returns: undefined }
      approve_user_request_simple:
        | {
            Args: { new_user_id: string; request_id: string }
            Returns: undefined
          }
        | {
            Args: {
              approving_user_id: string
              new_user_id: string
              request_id: string
            }
            Returns: Json
          }
      assign_master_admin: { Args: { user_email: string }; Returns: undefined }
      assign_master_admin_to_clerk_user: {
        Args: { clerk_user_id: string; user_email: string }
        Returns: undefined
      }
      cleanup_password_reset_rate_limits: { Args: never; Returns: undefined }
      create_roleplay_session: {
        Args: {
          scenario_category: string
          scenario_difficulty: string
          scenario_title: string
          tavus_conversation_id: string
        }
        Returns: string
      }
      get_signup_password: { Args: { user_email: string }; Returns: string }
      get_user_access_tier: { Args: { user_id: string }; Returns: string }
      get_user_admin_role: { Args: { user_id: string }; Returns: string }
      get_user_tier: { Args: { user_id: string }; Returns: string }
      has_admin_role: {
        Args: { required_role: string; user_id: string }
        Returns: boolean
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_tier_access:
        | {
            Args: { access_type: string; resource_id: string; user_id: string }
            Returns: boolean
          }
        | { Args: { required_tier: string; user_id: string }; Returns: boolean }
      reset_approval_request: { Args: { _email: string }; Returns: Json }
      store_signup_password: {
        Args: { user_email: string; user_password: string }
        Returns: undefined
      }
      update_roleplay_session: {
        Args: { duration: number; end_time: string; session_id: string }
        Returns: undefined
      }
      upgrade_user_to_master_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      user_has_any_role: { Args: { user_id: string }; Returns: boolean }
      verify_user_account_status: { Args: { _email: string }; Returns: Json }
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
