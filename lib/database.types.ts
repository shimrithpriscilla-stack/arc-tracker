export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          user_id: string  // UUID from auth.users
          started_at: string
          ended_at: string | null
          session_label: string | null
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      food_logs: {
        Row: {
          id: string
          session_id: string | null
          user_id: string  // UUID from auth.users
          meal_type: string
          food_name: string
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
          fiber: number | null
          logged_at: string
        }
        Insert: Omit<Database['public']['Tables']['food_logs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['food_logs']['Insert']>
      }
      workout_logs: {
        Row: {
          id: string
          session_id: string | null
          user_id: string  // UUID from auth.users
          exercise_name: string
          sets: number | null
          reps: number | null
          duration_minutes: number | null
          calories_burned: number | null
          notes: string | null
          logged_at: string
        }
        Insert: Omit<Database['public']['Tables']['workout_logs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['workout_logs']['Insert']>
      }
      water_logs: {
        Row: {
          id: string
          session_id: string | null
          user_id: string  // UUID from auth.users
          amount_ml: number
          logged_at: string
        }
        Insert: Omit<Database['public']['Tables']['water_logs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['water_logs']['Insert']>
      }
      weight_logs: {
        Row: {
          id: string
          session_id: string | null
          user_id: string  // UUID from auth.users
          weight_kg: number
          logged_at: string
        }
        Insert: Omit<Database['public']['Tables']['weight_logs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['weight_logs']['Insert']>
      }
      sleep_logs: {
        Row: {
          id: string
          session_id: string | null
          user_id: string  // UUID from auth.users
          sleep_start: string
          sleep_end: string | null
          duration_hours: number | null
          quality_rating: number | null
          logged_at: string
        }
        Insert: Omit<Database['public']['Tables']['sleep_logs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['sleep_logs']['Insert']>
      }
      user_settings: {
        Row: {
          id: string
          user_id: string  // UUID from auth.users
          target_calories: number
          target_protein: number
          target_carbs: number
          target_fat: number
          target_water: number
          goal_weight: number
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>
      }
    }
  }
}
