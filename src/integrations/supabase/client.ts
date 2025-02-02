import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://flzxuupunfdzgjjhkhuj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsenh1dXB1bmZkemdqamhraHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MzgxODUsImV4cCI6MjA1MzUxNDE4NX0.J85kRU3QThLaDpNRvGfAvK3kbvKENjXsPxcbiE2gh5M';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);