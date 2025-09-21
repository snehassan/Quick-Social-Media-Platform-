import { createClient } from "@supabase/supabase-js";

// From your Supabase project settings → API → Project URL
const supabaseUrl = "https://foafpklwqtarkrgwgxyg.supabase.co";
// From your Supabase project settings → API → anon public key
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvYWZwa2x3cXRhcmtyZ3dneHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDEzNTQsImV4cCI6MjA3NDAxNzM1NH0.P4F4ybZcmWYf11xU76BAaJh76o9d9FMv_zoERZjHYZM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
