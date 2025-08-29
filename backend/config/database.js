import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '.env') });

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-anon-key';

/**
 * Creates and configures a Supabase client instance
 * @returns {Object} Supabase client instance
 */
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Tests the database connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('Teams Data').select('count').limit(1);
    if (error) throw error;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    return false;
  }
};

export default supabase;