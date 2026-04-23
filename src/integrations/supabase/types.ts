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
      assignment_submissions: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          item_id: string
          product_id: string
          submission_text: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          item_id: string
          product_id: string
          submission_text?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          item_id?: string
          product_id?: string
          submission_text?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          parent_id: string | null
          published: boolean
          sort_order: number
          updated_at: string
          useful_links: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
          useful_links?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          published?: boolean
          sort_order?: number
          updated_at?: string
          useful_links?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      changelog_entries: {
        Row: {
          ai_week_start: string | null
          category: string
          created_at: string
          description: string
          entry_date: string
          id: string
          is_published: boolean
          link_to: string | null
          source: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          ai_week_start?: string | null
          category: string
          created_at?: string
          description: string
          entry_date?: string
          id?: string
          is_published?: boolean
          link_to?: string | null
          source?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          ai_week_start?: string | null
          category?: string
          created_at?: string
          description?: string
          entry_date?: string
          id?: string
          is_published?: boolean
          link_to?: string | null
          source?: string
          title?: string
          type?: string
          updated_at?: string
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
      concept_card_reviews: {
        Row: {
          card_id: string
          due_date: string
          ease_factor: number
          id: string
          interval_days: number
          last_grade: string
          reviewed_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          due_date?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_grade?: string
          reviewed_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          due_date?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          last_grade?: string
          reviewed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concept_card_reviews_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "concept_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      concept_cards: {
        Row: {
          audience: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          original_image_url: string | null
          product_type: string[] | null
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          original_image_url?: string | null
          product_type?: string[] | null
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          original_image_url?: string | null
          product_type?: string[] | null
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contribution_kudos: {
        Row: {
          contribution_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          contribution_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          contribution_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribution_kudos_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "script_user_versions"
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
      feedback_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          page_url: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          page_url?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          page_url?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
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
      first_14_days_progress: {
        Row: {
          day_number: number
          quiz_attempts: number
          quiz_passed_at: string | null
          quiz_score: number | null
          read_at: string | null
          reflection_answers: Json | null
          reflection_saved_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          day_number: number
          quiz_attempts?: number
          quiz_passed_at?: string | null
          quiz_score?: number | null
          read_at?: string | null
          reflection_answers?: Json | null
          reflection_saved_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          day_number?: number
          quiz_attempts?: number
          quiz_passed_at?: string | null
          quiz_score?: number | null
          read_at?: string | null
          reflection_answers?: Json | null
          reflection_saved_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      first_60_days_day_meta: {
        Row: {
          day_number: number
          notes: string | null
          published: boolean
          slides_url: string | null
          updated_at: string
          updated_by: string | null
          video_duration_sec: number | null
          video_url: string | null
        }
        Insert: {
          day_number: number
          notes?: string | null
          published?: boolean
          slides_url?: string | null
          updated_at?: string
          updated_by?: string | null
          video_duration_sec?: number | null
          video_url?: string | null
        }
        Update: {
          day_number?: number
          notes?: string | null
          published?: boolean
          slides_url?: string | null
          updated_at?: string
          updated_by?: string | null
          video_duration_sec?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "first_60_days_day_meta_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      first_60_days_progress: {
        Row: {
          day_number: number
          quiz_attempts: number
          quiz_passed_at: string | null
          quiz_score: number | null
          read_at: string | null
          reflection_answers: Json | null
          reflection_submitted_at: string | null
          slides_viewed_at: string | null
          updated_at: string
          user_id: string
          video_watched_at: string | null
        }
        Insert: {
          day_number: number
          quiz_attempts?: number
          quiz_passed_at?: string | null
          quiz_score?: number | null
          read_at?: string | null
          reflection_answers?: Json | null
          reflection_submitted_at?: string | null
          slides_viewed_at?: string | null
          updated_at?: string
          user_id: string
          video_watched_at?: string | null
        }
        Update: {
          day_number?: number
          quiz_attempts?: number
          quiz_passed_at?: string | null
          quiz_score?: number | null
          read_at?: string | null
          reflection_answers?: Json | null
          reflection_submitted_at?: string | null
          slides_viewed_at?: string | null
          updated_at?: string
          user_id?: string
          video_watched_at?: string | null
        }
        Relationships: []
      }
      flow_annotations: {
        Row: {
          author_name: string
          color: string
          content: string | null
          created_at: string
          drawing_paths: Json | null
          flow_id: string
          height: number
          id: string
          parent_id: string | null
          resolved: boolean
          type: string
          updated_at: string
          user_id: string
          width: number
          x: number
          y: number
        }
        Insert: {
          author_name?: string
          color?: string
          content?: string | null
          created_at?: string
          drawing_paths?: Json | null
          flow_id: string
          height?: number
          id?: string
          parent_id?: string | null
          resolved?: boolean
          type: string
          updated_at?: string
          user_id: string
          width?: number
          x?: number
          y?: number
        }
        Update: {
          author_name?: string
          color?: string
          content?: string | null
          created_at?: string
          drawing_paths?: Json | null
          flow_id?: string
          height?: number
          id?: string
          parent_id?: string | null
          resolved?: boolean
          type?: string
          updated_at?: string
          user_id?: string
          width?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "flow_annotations_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "script_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_annotations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "flow_annotations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          content: string
          created_at: string
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          product_id: string | null
          source_id: string | null
          source_type: string
        }
        Insert: {
          content: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          source_id?: string | null
          source_type?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          source_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          chunk_count: number | null
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          product_id: string | null
          status: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          chunk_count?: number | null
          created_at?: string
          file_path: string
          file_size?: number
          file_type: string
          id?: string
          product_id?: string | null
          status?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          chunk_count?: number | null
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          product_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
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
      learning_track_activity_log: {
        Row: {
          action: string
          action_source: string
          created_at: string
          diff: Json | null
          entity_id: string
          entity_type: string
          id: string
          track: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          action_source?: string
          created_at?: string
          diff?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          track?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          action_source?: string
          created_at?: string
          diff?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          track?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      learning_track_content_blocks: {
        Row: {
          block_type: string
          body: string | null
          created_at: string
          id: string
          item_id: string
          order_index: number
          resource_id: string | null
          resource_type: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          block_type: string
          body?: string | null
          created_at?: string
          id?: string
          item_id: string
          order_index: number
          resource_id?: string | null
          resource_type?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          block_type?: string
          body?: string | null
          created_at?: string
          id?: string
          item_id?: string
          order_index?: number
          resource_id?: string | null
          resource_type?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_content_blocks_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "learning_track_items"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_track_item_revisions: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          item_id: string
          snapshot: Json
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          item_id: string
          snapshot: Json
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          item_id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_item_revisions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "learning_track_items"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_track_items: {
        Row: {
          action_items: string[] | null
          created_at: string
          description: string | null
          hidden_resources: string[]
          id: string
          legacy_id: string | null
          objectives: string[] | null
          order_index: number
          phase_id: string
          prerequisite_item_ids: string[] | null
          published_at: string | null
          requires_submission: boolean
          title: string
          updated_at: string
        }
        Insert: {
          action_items?: string[] | null
          created_at?: string
          description?: string | null
          hidden_resources?: string[]
          id?: string
          legacy_id?: string | null
          objectives?: string[] | null
          order_index: number
          phase_id: string
          prerequisite_item_ids?: string[] | null
          published_at?: string | null
          requires_submission?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          action_items?: string[] | null
          created_at?: string
          description?: string | null
          hidden_resources?: string[]
          id?: string
          legacy_id?: string | null
          objectives?: string[] | null
          order_index?: number
          phase_id?: string
          prerequisite_item_ids?: string[] | null
          published_at?: string | null
          requires_submission?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_items_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "learning_track_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_track_overrides: {
        Row: {
          id: string
          overrides: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          overrides?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          overrides?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_track_phases: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          prerequisite_phase_id: string | null
          published_at: string | null
          title: string
          track: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          prerequisite_phase_id?: string | null
          published_at?: string | null
          title: string
          track: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          prerequisite_phase_id?: string | null
          published_at?: string | null
          title?: string
          track?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_phases_prerequisite_phase_id_fkey"
            columns: ["prerequisite_phase_id"]
            isOneToOne: false
            referencedRelation: "learning_track_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_track_progress: {
        Row: {
          completed_at: string | null
          id: string
          item_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          item_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          item_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_progress_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "learning_track_items"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_track_submission_files: {
        Row: {
          content_text: string | null
          created_at: string
          external_url: string | null
          file_type: string
          id: string
          label: string | null
          storage_path: string | null
          submission_id: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          external_url?: string | null
          file_type: string
          id?: string
          label?: string | null
          storage_path?: string | null
          submission_id: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          external_url?: string | null
          file_type?: string
          id?: string
          label?: string | null
          storage_path?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "learning_track_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_track_submissions: {
        Row: {
          id: string
          item_id: string
          remarks: string | null
          review_feedback: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          remarks?: string | null
          review_feedback?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          remarks?: string | null
          review_feedback?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_track_submissions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "learning_track_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_track_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_track_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_track_templates: {
        Row: {
          action_items: string[] | null
          category: string
          content_blocks: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          hint: string | null
          id: string
          key: string
          label: string
          objectives: string[] | null
          requires_submission: boolean
          title: string
          updated_at: string
        }
        Insert: {
          action_items?: string[] | null
          category: string
          content_blocks?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          hint?: string | null
          id?: string
          key: string
          label: string
          objectives?: string[] | null
          requires_submission?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          action_items?: string[] | null
          category?: string
          content_blocks?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          hint?: string | null
          id?: string
          key?: string
          label?: string
          objectives?: string[] | null
          requires_submission?: boolean
          title?: string
          updated_at?: string
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
      objection_entries: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          sort_order: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          sort_order?: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          sort_order?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      objection_responses: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          objection_id: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string
          id?: string
          objection_id: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          objection_id?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "objection_responses_objection_id_fkey"
            columns: ["objection_id"]
            isOneToOne: false
            referencedRelation: "objection_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      obsidian_resources: {
        Row: {
          body_md: string
          category: string
          frontmatter: Json | null
          id: string
          shareable: boolean
          source_path: string
          synced_at: string
          title: string
        }
        Insert: {
          body_md: string
          category: string
          frontmatter?: Json | null
          id?: string
          shareable?: boolean
          source_path: string
          synced_at?: string
          title: string
        }
        Update: {
          body_md?: string
          category?: string
          frontmatter?: Json | null
          id?: string
          shareable?: boolean
          source_path?: string
          synced_at?: string
          title?: string
        }
        Relationships: []
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
      pitch_analyses: {
        Row: {
          closing_technique_score: number | null
          communication_score: number | null
          created_at: string
          detailed_rubric: Json | null
          error_message: string | null
          executive_summary: string | null
          id: string
          improvement_areas: Json | null
          missed_key_points: Json | null
          needs_discovery_score: number | null
          objection_handling_score: number | null
          overall_score: number | null
          product_id: string
          product_knowledge_score: number | null
          raw_feedback: Json | null
          recommended_follow_up: Json | null
          status: string
          strengths: Json | null
          transcript: string | null
          transcript_source: string | null
          updated_at: string
          user_id: string
          video_title: string | null
          video_url: string
        }
        Insert: {
          closing_technique_score?: number | null
          communication_score?: number | null
          created_at?: string
          detailed_rubric?: Json | null
          error_message?: string | null
          executive_summary?: string | null
          id?: string
          improvement_areas?: Json | null
          missed_key_points?: Json | null
          needs_discovery_score?: number | null
          objection_handling_score?: number | null
          overall_score?: number | null
          product_id?: string
          product_knowledge_score?: number | null
          raw_feedback?: Json | null
          recommended_follow_up?: Json | null
          status?: string
          strengths?: Json | null
          transcript?: string | null
          transcript_source?: string | null
          updated_at?: string
          user_id: string
          video_title?: string | null
          video_url: string
        }
        Update: {
          closing_technique_score?: number | null
          communication_score?: number | null
          created_at?: string
          detailed_rubric?: Json | null
          error_message?: string | null
          executive_summary?: string | null
          id?: string
          improvement_areas?: Json | null
          missed_key_points?: Json | null
          needs_discovery_score?: number | null
          objection_handling_score?: number | null
          overall_score?: number | null
          product_id?: string
          product_knowledge_score?: number | null
          raw_feedback?: Json | null
          recommended_follow_up?: Json | null
          status?: string
          strengths?: Json | null
          transcript?: string | null
          transcript_source?: string | null
          updated_at?: string
          user_id?: string
          video_title?: string | null
          video_url?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      playbook_collaborators: {
        Row: {
          granted_at: string
          granted_by: string
          id: string
          playbook_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by: string
          id?: string
          playbook_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string
          id?: string
          playbook_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_collaborators_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "script_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_edit_requests: {
        Row: {
          created_at: string
          id: string
          playbook_id: string
          requester_email: string | null
          requester_id: string
          requester_name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          playbook_id: string
          requester_email?: string | null
          requester_id: string
          requester_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          playbook_id?: string
          requester_email?: string | null
          requester_id?: string
          requester_name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_edit_requests_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "script_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_user_prefs: {
        Row: {
          id: string
          is_favourite: boolean
          is_hidden: boolean
          playbook_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_favourite?: boolean
          is_hidden?: boolean
          playbook_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_favourite?: boolean
          is_hidden?: boolean
          playbook_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_user_prefs_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "script_playbooks"
            referencedColumns: ["id"]
          },
        ]
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
          parent_product_id: string | null
          published: boolean
          rich_content: string | null
          sort_order: number
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
          parent_product_id?: string | null
          published?: boolean
          rich_content?: string | null
          sort_order?: number
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
          parent_product_id?: string | null
          published?: boolean
          rich_content?: string | null
          sort_order?: number
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
          {
            foreignKeyName: "products_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          show_in_leaderboard: boolean
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
          show_in_leaderboard?: boolean
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
          show_in_leaderboard?: boolean
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_bank_questions: {
        Row: {
          bank_type: string
          category: string
          correct_answer: number
          created_at: string
          explanation: string
          id: string
          options: Json
          product_slug: string
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bank_type: string
          category: string
          correct_answer: number
          created_at?: string
          explanation: string
          id?: string
          options: Json
          product_slug: string
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bank_type?: string
          category?: string
          correct_answer?: number
          created_at?: string
          explanation?: string
          id?: string
          options?: Json
          product_slug?: string
          question?: string
          sort_order?: number
          updated_at?: string
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
      script_duplicate_analytics: {
        Row: {
          action: string
          category: string | null
          created_at: string
          id: string
          search_tier: string | null
          similarity_score: number | null
          target_audience: string | null
          user_id: string
        }
        Insert: {
          action: string
          category?: string | null
          created_at?: string
          id?: string
          search_tier?: string | null
          similarity_score?: number | null
          target_audience?: string | null
          user_id: string
        }
        Update: {
          action?: string
          category?: string | null
          created_at?: string
          id?: string
          search_tier?: string | null
          similarity_score?: number | null
          target_audience?: string | null
          user_id?: string
        }
        Relationships: []
      }
      script_favourites: {
        Row: {
          created_at: string
          id: string
          script_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          script_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          script_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_favourites_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      script_flows: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          edges: Json
          id: string
          is_template: boolean
          nodes: Json
          template_category: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          edges?: Json
          id?: string
          is_template?: boolean
          nodes?: Json
          template_category?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          edges?: Json
          id?: string
          is_template?: boolean
          nodes?: Json
          template_category?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      script_playbook_items: {
        Row: {
          created_at: string
          custom_content: Json | null
          id: string
          item_type: string
          objection_id: string | null
          playbook_id: string
          script_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          custom_content?: Json | null
          id?: string
          item_type?: string
          objection_id?: string | null
          playbook_id: string
          script_id?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          custom_content?: Json | null
          id?: string
          item_type?: string
          objection_id?: string | null
          playbook_id?: string
          script_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "script_playbook_items_objection_id_fkey"
            columns: ["objection_id"]
            isOneToOne: false
            referencedRelation: "objection_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_playbook_items_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "script_playbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_playbook_items_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      script_playbooks: {
        Row: {
          allow_public_edit: boolean
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          share_token: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_public_edit?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          share_token?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_public_edit?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          share_token?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      script_user_versions: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          script_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string
          id?: string
          script_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          script_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_user_versions_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      script_version_history: {
        Row: {
          created_at: string
          edit_summary: string | null
          edited_by: string
          editor_name: string
          id: string
          script_id: string
          versions: Json
        }
        Insert: {
          created_at?: string
          edit_summary?: string | null
          edited_by: string
          editor_name?: string
          id?: string
          script_id: string
          versions?: Json
        }
        Update: {
          created_at?: string
          edit_summary?: string | null
          edited_by?: string
          editor_name?: string
          id?: string
          script_id?: string
          versions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "script_version_history_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          category: string
          created_at: string
          id: string
          related_script_id: string | null
          script_role: string | null
          sort_order: number
          stage: string
          tags: string[] | null
          target_audience: string | null
          updated_at: string
          versions: Json
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          related_script_id?: string | null
          script_role?: string | null
          sort_order?: number
          stage: string
          tags?: string[] | null
          target_audience?: string | null
          updated_at?: string
          versions?: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          related_script_id?: string | null
          script_role?: string | null
          sort_order?: number
          stage?: string
          tags?: string[] | null
          target_audience?: string | null
          updated_at?: string
          versions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "scripts_related_script_id_fkey"
            columns: ["related_script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
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
      tier_upgrade_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          from_tier: string
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          to_tier: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          from_tier: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          to_tier: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          from_tier?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          to_tier?: string
          user_id?: string
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
      user_checklist_progress: {
        Row: {
          completed_at: string
          item_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          item_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          item_id?: string
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
      user_question_progress: {
        Row: {
          consecutive_correct: number
          last_answered_at: string
          last_correct: boolean | null
          mastered: boolean
          product_slug: string
          question_id: string
          total_attempts: number
          total_correct: number
          user_id: string
        }
        Insert: {
          consecutive_correct?: number
          last_answered_at?: string
          last_correct?: boolean | null
          mastered?: boolean
          product_slug: string
          question_id: string
          total_attempts?: number
          total_correct?: number
          user_id: string
        }
        Update: {
          consecutive_correct?: number
          last_answered_at?: string
          last_correct?: boolean | null
          mastered?: boolean
          product_slug?: string
          question_id?: string
          total_attempts?: number
          total_correct?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank_questions"
            referencedColumns: ["id"]
          },
        ]
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
      get_learner_leaderboard: {
        Args: { p_tier: string }
        Returns: {
          assignments: number
          days_active: number
          email: string
          first_14_days: number
          first_60_days: number
          name: string
          question_bank: number
          total_points: number
          user_id: string
          videos: number
        }[]
      }
      get_learning_leaderboard: {
        Args: { result_limit?: number }
        Returns: {
          avatar_url: string
          display_name: string
          quizzes_completed: number
          roleplays_completed: number
          total_activities: number
          user_id: string
        }[]
      }
      get_learning_track_heatmap: {
        Args: never
        Returns: {
          completed_count: number
          display_name: string
          phase_id: string
          phase_title: string
          total_count: number
          track: string
          user_id: string
        }[]
      }
      get_learning_track_roster: {
        Args: never
        Returns: {
          display_name: string
          last_activity: string
          pending_submissions: number
          post_rnf_progress_pct: number
          pre_rnf_progress_pct: number
          user_id: string
        }[]
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
      hybrid_search_knowledge_chunks: {
        Args: {
          filter_product_id?: string
          keyword_weight?: number
          match_count?: number
          query_embedding: string
          query_text?: string
          rrf_k?: number
          vector_weight?: number
        }
        Returns: {
          combined_score: number
          content: string
          id: string
          keyword_rank: number
          metadata: Json
          similarity: number
          source_id: string
          source_type: string
        }[]
      }
      lt_build_item_snapshot: { Args: { p_item_id: string }; Returns: Json }
      match_knowledge_chunks: {
        Args: {
          filter_product_id?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
          source_id: string
          source_type: string
        }[]
      }
      reset_approval_request: { Args: { _email: string }; Returns: Json }
      seed_learning_track: { Args: never; Returns: undefined }
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
