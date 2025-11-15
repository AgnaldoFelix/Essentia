// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nzpcdqsrncldrtmqgegi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cGNkcXNybmNsZHJ0bXFnZWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxOTM3MTQsImV4cCI6MjA3ODc2OTcxNH0.IiYUCfllDkoJ9hTXox5CYVHHfxQQN4bAlt08epwBKiw'

console.log('Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})