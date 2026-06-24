import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qagqakoocbmobsuwfvab.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3Fha29vY2Jtb2JzdXdmdmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjE3MDIsImV4cCI6MjA5Nzg5NzcwMn0.RcMCrirkSCtvYVB-xk-bhk1YqWyXPc413q2_2EDGQAk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
