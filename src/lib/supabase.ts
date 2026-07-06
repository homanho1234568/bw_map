/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import type { Booth, Hall } from '../types';

const supabaseUrlRaw = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = supabaseUrlRaw.trim().replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// The JSON data of Halls is static since we only manage booths dynamically, 
// but the user said "delete all data related to halls and booths, no need to sync data". 
// So maybe we fetch Halls from supabase too?
// Let's create an api layer for both.
