import {createClient} from '@supabase/supabase-js';
import {supabase_key} from '@env';
const supabaseUrl = 'https://bkqffudobowqdramcmga.supabase.co';
const supabaseKey = supabase_key;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
