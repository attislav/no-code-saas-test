import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cngwfskwxtafyizccbtm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZ3dmc2t3eHRhZnlpemNjYnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzNDgsImV4cCI6MjA2ODg4MDM0OH0.mgYRg7kzc9i2kzLM2kZaL2pcRBeKObLfu-JL7ShoDyo'

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