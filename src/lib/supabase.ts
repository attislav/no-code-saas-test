import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Story {
  id: string
  character: string
  age_group: string
  story_type: string
  extra_wishes?: string
  story?: string
  status: 'generating' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}