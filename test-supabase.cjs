require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrls = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKeys = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrls, supabaseKeys);

async function run() {
    const userId = "test_user_id";
    const { data, error } = await supabase
        .from('categories')
        .insert({ name: 'TestCat', icon: '📦', user_id: userId })
        .select();
    console.log('Data:', data);
    console.log('Error:', error);
}
run();
