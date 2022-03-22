const createClient = require('@supabase/supabase-js').createClient;
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = 'https://lfqgtbjwwtjfvrisakka.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase;