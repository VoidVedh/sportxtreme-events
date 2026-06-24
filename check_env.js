import { loadEnv } from 'vite';

// Load environment variables using Vite's helper
const env = loadEnv('', process.cwd(), 'VITE_');

console.log('--- Vite Environment Variables ---');
console.log('VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL || 'undefined');
console.log(env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'KEY_FOUND' : 'KEY_MISSING');

console.log('\n--- Process Environment Variables ---');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'undefined');
console.log(process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'KEY_FOUND' : 'KEY_MISSING');
