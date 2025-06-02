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
      achievements: {
        Row: {
          achievement_type: string
          created_at: string
          date_achieved: string | null
          description: string | null
          id: string
          is_verified: boolean | null
          issuing_organization: string | null
          skills_gained: Json | null
          title: string
          user_id: string
          verification_url: string | null
        }
        Insert: {
          achievement_type: string
          created_at?: string
          date_achieved?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          issuing_organization?: string | null
          skills_gained?: Json | null
          title: string
          user_id: string
          verification_url?: string | null
        }
        Update: {
          achievement_type?: string
          created_at?: string
          date_achieved?: string | null
          description?: string | null
          id?: string
          is_verified?: boolean | null
          issuing_organization?: string | null
          skills_gained?: Json | null
          title?: string
          user_id?: string
          verification_url?: string | null
        }
        Relationships: []
      }
      activities_leadership: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          organization: string
          role: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization: string
          role?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization?: string
          role?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          method: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      application_events: {
        Row: {
          application_id: string
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ats_integrations: {
        Row: {
          api_endpoint: string | null
          ats_system: string
          company_name: string
          created_at: string | null
          credentials_encrypted: string | null
          id: string
          integration_status: string | null
          last_sync_at: string | null
          sync_data_types: string[] | null
          sync_frequency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_endpoint?: string | null
          ats_system: string
          company_name: string
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          integration_status?: string | null
          last_sync_at?: string | null
          sync_data_types?: string[] | null
          sync_frequency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_endpoint?: string | null
          ats_system?: string
          company_name?: string
          created_at?: string | null
          credentials_encrypted?: string | null
          id?: string
          integration_status?: string | null
          last_sync_at?: string | null
          sync_data_types?: string[] | null
          sync_frequency?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      communications: {
        Row: {
          application_id: string | null
          communication_type: string
          contact_id: string | null
          content: string | null
          created_at: string | null
          direction: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          response_received: boolean | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_used: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          communication_type: string
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          direction: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          response_received?: boolean | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_used?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          communication_type?: string
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          direction?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          response_received?: boolean | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_used?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_template_used_fkey"
            columns: ["template_used"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      company_insights: {
        Row: {
          company_name: string
          created_at: string | null
          culture_insights: Json | null
          glassdoor_rating: number | null
          glassdoor_reviews: Json | null
          id: string
          interview_experiences: Json | null
          last_updated: string | null
          salary_data: Json | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          culture_insights?: Json | null
          glassdoor_rating?: number | null
          glassdoor_reviews?: Json | null
          id?: string
          interview_experiences?: Json | null
          last_updated?: string | null
          salary_data?: Json | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          culture_insights?: Json | null
          glassdoor_rating?: number | null
          glassdoor_reviews?: Json | null
          id?: string
          interview_experiences?: Json | null
          last_updated?: string | null
          salary_data?: Json | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_name: string
          contact_type: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          job_title: string | null
          last_contacted: string | null
          last_name: string
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          relationship_strength: string | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name: string
          contact_type: string
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          job_title?: string | null
          last_contacted?: string | null
          last_name: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          relationship_strength?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string
          contact_type?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          job_title?: string | null
          last_contacted?: string | null
          last_name?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          relationship_strength?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversion_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          properties: Json | null
          session_id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          properties?: Json | null
          session_id: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          properties?: Json | null
          session_id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      document_usage: {
        Row: {
          application_id: string | null
          company_name: string
          document_id: string | null
          id: string
          notes: string | null
          position_title: string
          used_at: string | null
        }
        Insert: {
          application_id?: string | null
          company_name: string
          document_id?: string | null
          id?: string
          notes?: string | null
          position_title: string
          used_at?: string | null
        }
        Update: {
          application_id?: string | null
          company_name?: string
          document_id?: string | null
          id?: string
          notes?: string | null
          position_title?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_usage_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "user_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          created_at: string | null
          degree: string | null
          end_date: string | null
          field_of_study: string | null
          gpa: string | null
          id: string
          school: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          degree?: string | null
          end_date?: string | null
          field_of_study?: string | null
          gpa?: string | null
          id?: string
          school: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          degree?: string | null
          end_date?: string | null
          field_of_study?: string | null
          gpa?: string | null
          id?: string
          school?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          bounced_at: string | null
          clicked_at: string | null
          created_at: string
          email_provider: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          recipient_email: string
          sender_email: string
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string
          email_provider?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email: string
          sender_email: string
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string
          email_provider?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          recipient_email?: string
          sender_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          category: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          body: string
          category: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          body?: string
          category?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      encryption_keys: {
        Row: {
          created_at: string | null
          encrypted_key: string
          id: string
          is_active: boolean | null
          key_name: string
        }
        Insert: {
          created_at?: string | null
          encrypted_key: string
          id?: string
          is_active?: boolean | null
          key_name: string
        }
        Update: {
          created_at?: string | null
          encrypted_key?: string
          id?: string
          is_active?: boolean | null
          key_name?: string
        }
        Relationships: []
      }
      follow_up_sequence_steps: {
        Row: {
          created_at: string | null
          delay_days: number
          id: string
          is_active: boolean | null
          sequence_id: string | null
          step_number: number
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          delay_days: number
          id?: string
          is_active?: boolean | null
          sequence_id?: string | null
          step_number: number
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          delay_days?: number
          id?: string
          is_active?: boolean | null
          sequence_id?: string | null
          step_number?: number
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "follow_up_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_up_sequence_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_sequences: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interviews: {
        Row: {
          application_id: string | null
          company_name: string
          created_at: string | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          interview_type: string
          interviewer_email: string | null
          interviewer_name: string | null
          interviewer_phone: string | null
          location: string | null
          notes: string | null
          outcome: string | null
          position_title: string
          preparation_notes: string | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          company_name: string
          created_at?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          interview_type: string
          interviewer_email?: string | null
          interviewer_name?: string | null
          interviewer_phone?: string | null
          location?: string | null
          notes?: string | null
          outcome?: string | null
          position_title: string
          preparation_notes?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          company_name?: string
          created_at?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          interview_type?: string
          interviewer_email?: string | null
          interviewer_name?: string | null
          interviewer_phone?: string | null
          location?: string | null
          notes?: string | null
          outcome?: string | null
          position_title?: string
          preparation_notes?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_alerts: {
        Row: {
          created_at: string
          criteria: Json
          frequency: string
          id: string
          is_active: boolean
          last_triggered: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          frequency?: string
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          frequency?: string
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          application_url: string | null
          applied_at: string
          contact_person: string | null
          cover_letter: string | null
          follow_up_date: string | null
          id: string
          interview_date: string | null
          job_id: string
          next_action: string | null
          notes: string | null
          resume_version: string | null
          salary_offered: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_url?: string | null
          applied_at?: string
          contact_person?: string | null
          cover_letter?: string | null
          follow_up_date?: string | null
          id?: string
          interview_date?: string | null
          job_id: string
          next_action?: string | null
          notes?: string | null
          resume_version?: string | null
          salary_offered?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_url?: string | null
          applied_at?: string
          contact_person?: string | null
          cover_letter?: string | null
          follow_up_date?: string | null
          id?: string
          interview_date?: string | null
          job_id?: string
          next_action?: string | null
          notes?: string | null
          resume_version?: string | null
          salary_offered?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_preferences: {
        Row: {
          benefits: string[] | null
          company_size: string[] | null
          created_at: string | null
          desired_roles: string[] | null
          experience_level: string | null
          id: string
          industries: string[] | null
          preferred_locations: string[] | null
          salary_expectation: string | null
          updated_at: string | null
          user_id: string
          work_model: string | null
        }
        Insert: {
          benefits?: string[] | null
          company_size?: string[] | null
          created_at?: string | null
          desired_roles?: string[] | null
          experience_level?: string | null
          id?: string
          industries?: string[] | null
          preferred_locations?: string[] | null
          salary_expectation?: string | null
          updated_at?: string | null
          user_id: string
          work_model?: string | null
        }
        Update: {
          benefits?: string[] | null
          company_size?: string[] | null
          created_at?: string | null
          desired_roles?: string[] | null
          experience_level?: string | null
          id?: string
          industries?: string[] | null
          preferred_locations?: string[] | null
          salary_expectation?: string | null
          updated_at?: string | null
          user_id?: string
          work_model?: string | null
        }
        Relationships: []
      }
      job_recommendations: {
        Row: {
          created_at: string | null
          id: string
          is_viewed: boolean | null
          job_data: Json
          match_percentage: number
          matching_skills: Json | null
          missing_skills: Json | null
          recommendation_reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_viewed?: boolean | null
          job_data: Json
          match_percentage: number
          matching_skills?: Json | null
          missing_skills?: Json | null
          recommendation_reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_viewed?: boolean | null
          job_data?: Json
          match_percentage?: number
          matching_skills?: Json | null
          missing_skills?: Json | null
          recommendation_reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      navigation_analytics: {
        Row: {
          browser_info: Json | null
          created_at: string
          device_type: string | null
          duration_ms: number | null
          from_route: string | null
          id: string
          interaction_type: string
          session_id: string
          to_route: string
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          from_route?: string | null
          id?: string
          interaction_type: string
          session_id: string
          to_route: string
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          from_route?: string | null
          id?: string
          interaction_type?: string
          session_id?: string
          to_route?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          application_updates: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          interview_reminders: boolean | null
          job_match_alerts: boolean | null
          profile_completion_reminders: boolean | null
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          interview_reminders?: boolean | null
          job_match_alerts?: boolean | null
          profile_completion_reminders?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          interview_reminders?: boolean | null
          job_match_alerts?: boolean | null
          profile_completion_reminders?: boolean | null
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      oauth_integrations: {
        Row: {
          access_token_encrypted: string
          connected_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          profile_data: Json | null
          provider: string
          provider_user_id: string
          refresh_token_encrypted: string | null
          scope: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted: string
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          profile_data?: Json | null
          provider: string
          provider_user_id: string
          refresh_token_encrypted?: string | null
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          profile_data?: Json | null
          provider?: string
          provider_user_id?: string
          refresh_token_encrypted?: string | null
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      peer_reviews: {
        Row: {
          completed_at: string | null
          created_at: string | null
          document_id: string
          document_type: string
          feedback_provided: boolean | null
          id: string
          rating: number | null
          review_content: string
          reviewee_id: string
          reviewer_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          document_id: string
          document_type: string
          feedback_provided?: boolean | null
          id?: string
          rating?: number | null
          review_content: string
          reviewee_id: string
          reviewer_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          document_id?: string
          document_type?: string
          feedback_provided?: boolean | null
          id?: string
          rating?: number | null
          review_content?: string
          reviewee_id?: string
          reviewer_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      professional_development: {
        Row: {
          category: string
          completion_date: string | null
          created_at: string
          goal_description: string | null
          goal_title: string
          id: string
          notes: string | null
          progress_percentage: number | null
          status: string | null
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          completion_date?: string | null
          created_at?: string
          goal_description?: string | null
          goal_title: string
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completion_date?: string | null
          created_at?: string
          goal_description?: string | null
          goal_title?: string
          id?: string
          notes?: string | null
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_completion_tracking: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          missing_fields: Json | null
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          missing_fields?: Json | null
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          missing_fields?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string[] | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          technologies: string[] | null
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string[] | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          technologies?: string[] | null
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string[] | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          technologies?: string[] | null
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          requests_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          requests_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          requests_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          is_completed: boolean | null
          is_sent: boolean | null
          priority: string | null
          related_id: string | null
          related_type: string | null
          reminder_date: string
          reminder_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean | null
          is_sent?: boolean | null
          priority?: string | null
          related_id?: string | null
          related_type?: string | null
          reminder_date: string
          reminder_type: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean | null
          is_sent?: boolean | null
          priority?: string | null
          related_id?: string | null
          related_type?: string | null
          reminder_date?: string
          reminder_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resume_versions: {
        Row: {
          created_at: string | null
          file_content: string | null
          file_path: string | null
          id: string
          is_active: boolean | null
          name: string
          parsed_data: Json | null
          updated_at: string | null
          user_id: string
          version_number: number | null
        }
        Insert: {
          created_at?: string | null
          file_content?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parsed_data?: Json | null
          updated_at?: string | null
          user_id: string
          version_number?: number | null
        }
        Update: {
          created_at?: string | null
          file_content?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parsed_data?: Json | null
          updated_at?: string | null
          user_id?: string
          version_number?: number | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      review_feedback: {
        Row: {
          created_at: string | null
          feedback_comment: string | null
          feedback_type: string
          id: string
          provided_by: string
          review_id: string
        }
        Insert: {
          created_at?: string | null
          feedback_comment?: string | null
          feedback_type: string
          id?: string
          provided_by: string
          review_id: string
        }
        Update: {
          created_at?: string | null
          feedback_comment?: string | null
          feedback_type?: string
          id?: string
          provided_by?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_feedback_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "peer_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          id: string
          job_data: Json
          job_id: string
          notes: string | null
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          job_data: Json
          job_id: string
          notes?: string | null
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          job_data?: Json
          job_id?: string
          notes?: string | null
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          last_used: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters: Json
          id?: string
          last_used?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          last_used?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes: Json
          created_at: string
          id: string
          is_enabled: boolean | null
          last_used_at: string | null
          secret_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes: Json
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          secret_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          last_used_at?: string | null
          secret_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          consent_date: string | null
          consent_type: string
          consented: boolean
          id: string
          ip_address: unknown | null
          user_id: string
          withdrawn_date: string | null
        }
        Insert: {
          consent_date?: string | null
          consent_type: string
          consented?: boolean
          id?: string
          ip_address?: unknown | null
          user_id: string
          withdrawn_date?: string | null
        }
        Update: {
          consent_date?: string | null
          consent_type?: string
          consented?: boolean
          id?: string
          ip_address?: unknown | null
          user_id?: string
          withdrawn_date?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_default: boolean | null
          name: string
          tags: string[] | null
          type: string
          updated_at: string | null
          user_id: string
          version: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_default?: boolean | null
          name: string
          tags?: string[] | null
          type: string
          updated_at?: string | null
          user_id: string
          version?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_default?: boolean | null
          name?: string
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      user_languages: {
        Row: {
          created_at: string | null
          id: string
          language: string
          proficiency: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language: string
          proficiency?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          proficiency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_metrics: {
        Row: {
          application_success_rate: number | null
          created_at: string | null
          engagement_score: number | null
          id: string
          interview_success_rate: number | null
          last_activity_date: string | null
          profile_completion_score: number | null
          profile_quality_score: number | null
          total_applications: number | null
          total_interviews: number | null
          total_offers: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_success_rate?: number | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          interview_success_rate?: number | null
          last_activity_date?: string | null
          profile_completion_score?: number | null
          profile_quality_score?: number | null
          total_applications?: number | null
          total_interviews?: number | null
          total_offers?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_success_rate?: number | null
          created_at?: string | null
          engagement_score?: number | null
          id?: string
          interview_success_rate?: number | null
          last_activity_date?: string | null
          profile_completion_score?: number | null
          profile_quality_score?: number | null
          total_applications?: number | null
          total_interviews?: number | null
          total_offers?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          created_at: string
          id: string
          onboarding_completed: boolean | null
          profile_completed: boolean | null
          resume_uploaded: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          profile_completed?: boolean | null
          resume_uploaded?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_completed?: boolean | null
          profile_completed?: boolean | null
          resume_uploaded?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          github_url: string | null
          id: string
          job_status: string | null
          languages: Json | null
          linkedin_url: string | null
          location: string | null
          name: string | null
          other_url: string | null
          phone: string | null
          portfolio_url: string | null
          primary_language: string | null
          profile_completion: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          github_url?: string | null
          id?: string
          job_status?: string | null
          languages?: Json | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          other_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          primary_language?: string | null
          profile_completion?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          github_url?: string | null
          id?: string
          job_status?: string | null
          languages?: Json | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          other_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          primary_language?: string | null
          profile_completion?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_resume_files: {
        Row: {
          created_at: string
          file_content: string | null
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          is_current: boolean | null
          parsed_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_content?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          is_current?: boolean | null
          parsed_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_content?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_current?: boolean | null
          parsed_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          skill: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          skill: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          skill?: string
          user_id?: string
        }
        Relationships: []
      }
      work_experiences: {
        Row: {
          company: string
          created_at: string | null
          description: string[] | null
          end_date: string | null
          id: string
          location: string | null
          role: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string[] | null
          end_date?: string | null
          id?: string
          location?: string | null
          role: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string[] | null
          end_date?: string | null
          id?: string
          location?: string | null
          role?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
    Enums: {},
  },
} as const
