
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify user token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET': {
        // Get users list (admin only)
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('id, name, email, role, plano, created_at')
          .eq('id', user.id)

        if (userDataError) {
          throw userDataError
        }

        const currentUser = userData?.[0]
        if (currentUser?.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Access denied. Admin role required.' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get all users for admin
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, role, plano, created_at')
          .order('created_at', { ascending: false })

        if (usersError) {
          throw usersError
        }

        return new Response(
          JSON.stringify({ users }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'POST': {
        // Create notification for user
        const body = await req.json()
        const { title, message, type = 'info' } = body

        if (!title || !message) {
          return new Response(
            JSON.stringify({ error: 'Title and message are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title,
            message,
            type
          })
          .select()

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ notification: data[0] }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
