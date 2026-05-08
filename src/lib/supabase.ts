import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Supabase URL is missing. Please add VITE_SUPABASE_URL to your .env file or the app will not be able to sync data.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
