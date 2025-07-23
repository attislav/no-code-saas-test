import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cngwfskwxtafyizccbtm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZ3dmc2t3eHRhZnlpemNjYnRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwNDM0OCwiZXhwIjoyMDY4ODgwMzQ4fQ.ByC8CfSFwHEEQD-HWo5_NNr3SmsS6hcWinzO2o1pSh0'

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