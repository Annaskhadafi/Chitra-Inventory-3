import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jceqixjpaueotgnuqnmd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZXFpeGpwYXVlb3RnbnVxbm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NzQyMzgsImV4cCI6MjA1NzI1MDIzOH0.flFyng7CeivLbSt-d1L5nSURgDGPWZFTEdycJ3N2K9A';

export const supabase = createClient(supabaseUrl, supabaseKey);
