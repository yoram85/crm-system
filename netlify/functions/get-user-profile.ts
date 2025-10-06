import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    // Get authorization header
    const authHeader = event.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing authorization header' }),
      }
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      }
    }

    // Fetch user profile using service role (bypasses RLS)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        // Special handling for yoram1985@gmail.com - Developer with custom details
        const isYoram = user.email === 'yoram1985@gmail.com'

        const newProfile = {
          id: user.id,
          email: user.email,
          first_name: isYoram ? 'וורטאו' : (user.user_metadata?.given_name || 'משתמש'),
          last_name: isYoram ? 'זאודו' : (user.user_metadata?.family_name || 'חדש'),
          role: isYoram ? 'developer' : 'user',
          status: 'active',
          avatar: user.user_metadata?.avatar_url || null,
          phone: isYoram ? '0509819243' : null,
          department: null,
          monthly_target: null,
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to create profile', details: createError }),
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ profile: createdProfile }),
        }
      }

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch profile', details: profileError }),
      }
    }

    // Auto-upgrade yoram1985@gmail.com to developer with full details if needed
    if (profile && user.email === 'yoram1985@gmail.com' && profile.role !== 'developer') {
      const { data: updatedProfile } = await supabase
        .from('user_profiles')
        .update({
          role: 'developer',
          first_name: 'וורטאו',
          last_name: 'זאודו',
          phone: '0509819243'
        })
        .eq('id', user.id)
        .select()
        .single()

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ profile: updatedProfile || profile }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ profile }),
    }
  } catch (error: any) {
    console.error('Error in get-user-profile:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
