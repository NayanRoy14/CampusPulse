import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in your .env file.');
}

// Ensure the URL is valid to prevent "Failed to fetch" due to empty strings
const validUrl = supabaseUrl?.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

export const supabase = createClient(validUrl || '', supabaseKey || '');
