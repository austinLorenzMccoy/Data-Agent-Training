export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          alias: string
          avatar_seed: string | null
          total_xp: number
          rank_tier_id: number
          operations_count: number
          best_iq_score: number
          avg_iq_score: number
          best_streak: number
          leaderboard_opt_in: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['agents']['Row'],
          'operations_count' | 'best_iq_score' | 'avg_iq_score' |
          'best_streak' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['agents']['Insert']>
      }
      operations: {
        Row: {
          id: string
          agent_id: string
          operation_name: string
          iq_score: number
          xp_earned: number
          questions_total: number
          questions_correct: number
          time_taken_seconds: number | null
          passed: boolean
          category_scores: Record<string, number>
          answers: AnswerLog[]
          rank_before: number | null
          rank_after: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['operations']['Row'],
          'id' | 'rank_before' | 'rank_after' | 'created_at'>
        Update: never
      }
      agent_badges: {
        Row: {
          id: string
          agent_id: string
          badge_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['agent_badges']['Row'], 'id' | 'earned_at'>
        Update: never
      }
      rank_tiers: {
        Row: {
          id: number
          slug: string
          label: string
          icon: string
          xp_required: number
          colour_hex: string
        }
        Insert: never
        Update: never
      }
      badge_definitions: {
        Row: {
          id: string
          label: string
          description: string
          icon: string
          category: string
          requirement: Record<string, unknown>
        }
        Insert: never
        Update: never
      }
      tracks: {
        Row: {
          id: string
          label: string
          focus_type: string
          xp_required: number
        }
        Insert: Database['public']['Tables']['tracks']['Row']
        Update: Partial<Database['public']['Tables']['tracks']['Insert']>
      }
      agent_tracks: {
        Row: {
          agent_id: string
          track_id: string
          xp: number
        }
        Insert: Database['public']['Tables']['agent_tracks']['Row']
        Update: Partial<Pick<Database['public']['Tables']['agent_tracks']['Row'], 'xp'>>
      }
      questions: {
        Row: {
          id: string
          type: string
          difficulty: string
          category: string | null
          operation_context: string | null
          payload: Record<string, unknown>
          explanation: string | null
          rubric: string | null
          xp_value: number
          tags: string[]
          audio_asset_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'created_at' | 'updated_at' | 'audio_asset_url'> & {
          audio_asset_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['questions']['Insert']>
      }
      proficiency_exams: {
        Row: {
          id: string
          label: string
          pass_score: number
          questions: unknown
        }
        Insert: Database['public']['Tables']['proficiency_exams']['Row']
        Update: Partial<Database['public']['Tables']['proficiency_exams']['Insert']>
      }
      agent_proficiency_results: {
        Row: {
          agent_id: string
          exam_id: string
          score: number
          passed: boolean
          completed_at: string
        }
        Insert: Omit<Database['public']['Tables']['agent_proficiency_results']['Row'], 'completed_at'>
        Update: never
      }
      recruiter_orgs: {
        Row: {
          id: string
          name: string
          required_proficiency_exam: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['recruiter_orgs']['Row'], 'created_at' | 'required_proficiency_exam'> & {
          required_proficiency_exam?: string | null
        }
        Update: Partial<Database['public']['Tables']['recruiter_orgs']['Insert']>
      }
      billing_plans: {
        Row: {
          id: number
          slug: string
          label: string
          price_kobo: number
          paystack_plan_code: string | null
          interval: string
          trial_days: number
          practice_daily_limit: number | null
          tests_monthly_limit: number | null
          is_paid: boolean
          created_at: string
        }
        Insert: never
        Update: never
      }
      subscriptions: {
        Row: {
          id: string
          agent_id: string
          plan_id: number
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          paystack_email_token: string | null
          paystack_authorization_code: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_ends_at: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      usage_counters: {
        Row: {
          id: string
          agent_id: string
          counter_key: string
          period_type: 'day' | 'month'
          period_key: string
          count: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['usage_counters']['Row'], 'id' | 'updated_at'>
        Update: never
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id: string
          alias: string
          total_xp: number
          best_iq_score: number
          operations_count: number
          rank_label: string
          rank_icon: string
          rank_colour: string
          rank_tier_id: number
          position: number
        }
      }
    }
    Functions: {
      calculate_rank_tier: {
        Args: { xp: number }
        Returns: number
      }
      increment_usage_counter: {
        Args: {
          p_agent_id: string
          p_counter_key: string
          p_period_type: 'day' | 'month'
          p_period_key: string
          p_increment?: number
        }
        Returns: number
      }
    }
  }
}

export interface AnswerLog {
  questionId: string
  questionType: 'alpha' | 'beta' | 'gamma' | 'delta' | 'epsilon' | 'zeta' | 'eta' | 'theta'
  agentAnswer: string | string[] | Record<string, string>
  correctAnswer: string | string[] | Record<string, unknown>
  isCorrect: boolean
  pointsEarned: number
  pointsMax: number
  groqScore?: number
  groqFeedback?: string
}
