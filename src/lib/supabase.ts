import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Validate that we're not using placeholder values
if (supabaseUrl.includes('your-project-id') || supabaseUrl === 'https://your-project-id.supabase.co') {
  throw new Error('Please update VITE_SUPABASE_URL in your .env file with your actual Supabase project URL')
}

if (supabaseAnonKey === 'your-anon-key-here' || supabaseAnonKey.length < 100) {
  throw new Error('Please update VITE_SUPABASE_ANON_KEY in your .env file with your actual Supabase anonymous key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-my-custom-header': 'edulearn-platform'
    }
  }
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log('Supabase connection test successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

// Debug function to check current user
export const debugCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Current user:', user)
    console.log('User error:', error)
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}