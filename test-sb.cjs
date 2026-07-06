const { createClient } = require('@supabase/supabase-js');
const sb = createClient(' https://abc.supabase.co ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.123');
sb.from('booths').select('*').then(console.log).catch(console.error);
