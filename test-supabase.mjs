import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const userId = "test_user_id"; // We just need to see the schema error
    const { data, error } = await supabase
        .from('categories')
        .insert({ name: 'TestCat', icon: '📦', user_id: userId })
        .select();
    console.log('Data:', data);
    console.log('Error:', error);
}
run();
