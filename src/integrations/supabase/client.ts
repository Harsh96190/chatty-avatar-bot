// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mlsffgremlgygpkvntch.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sc2ZmZ3JlbWxneWdwa3ZudGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NzY2MjIsImV4cCI6MjA1ODI1MjYyMn0.Utg037xmtfX_rO6q_BdKLGC1DPjsuRzQv7XGOpFYieA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);