import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://flzxuupunfdzgjjhkhuj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenhtdXB1bmZkemdqamhraHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4ODc2ODAsImV4cCI6MjAyMjQ2MzY4MH0.vxJxjqFG6TjrK4eGEUONfwvHNkGYVIwJ-gpqdqtGz0M';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);