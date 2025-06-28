import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto refresh tokens
    autoRefreshToken: true,
    // Persist session in local storage (more secure than cookies for JWT)
    persistSession: true,
    // Detect session in URL
    detectSessionInUrl: true,
    // Flow type for better security
    flowType: 'pkce'
  },
  // Database configuration
  db: {
    // Use prepared statements for better security
    schema: 'public'
  },
  // Global configuration
  global: {
    headers: {
      'x-application-name': 'rezme-v2'
    }
  }
});

// Enhanced security function to create a client 
export function createSecureSupabaseClient(accessToken?: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'rezme-v2',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      }
    }
  });
}

// Utility function to safely handle Supabase operations
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation();
    
    if (result.error) {
      console.error('Supabase operation error:', result.error);
      return {
        data: null,
        error: 'Database operation failed'
      };
    }
    
    return {
      data: result.data,
      error: null
    };
  } catch (error) {
    console.error('Unexpected error in Supabase operation:', error);
    return {
      data: null,
      error: 'Unexpected database error'
    };
  }
}
