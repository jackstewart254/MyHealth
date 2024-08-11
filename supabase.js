import {createClient} from '@supabase/supabase-js';
const supabaseUrl = 'https://bkqffudobowqdramcmga.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmdWRvYm93cWRyYW1jbWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMxMzI1MjYsImV4cCI6MjAzODcwODUyNn0.5OXI-DhzXX1rZRnHDJPS8MXC2h0-29rZ-JCtJC7hfnA';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

