import { createClient } from '@supabase/supabase-js';

// Configuration from user
const SUPABASE_URL = 'https://eebxcxnjvkfhyrkgpgfi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8UVGYAhkyZpLqqWrG_q7Ag_m-pBkLUa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
