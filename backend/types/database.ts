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
    }
  }
}

export interface AnswerLog {
  questionId: string
  questionType: 'alpha' | 'beta' | 'gamma' | 'delta'
  agentAnswer: string | string[] | Record<string, string>
  correctAnswer: string | string[] | Record<string, unknown>
  isCorrect: boolean
  pointsEarned: number
  pointsMax: number
  groqScore?: number
  groqFeedback?: string
}
