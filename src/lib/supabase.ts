import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://elujrgesguzzbpqohkbm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdWpyZ2VzZ3V6emJwcW9oa2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NTMzMTMsImV4cCI6MjA2NDUyOTMxM30.XDgNmOTE2wOqwMzZYmrH2wErmosCFwhiSnZUfN_Laec';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase;