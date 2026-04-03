import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req: Request) => {
  // 1. Verify JWT of caller
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Token de autenticación requerido' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  // 2. Verify caller identity
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Token inválido' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 3. Verify caller is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Solo administradores pueden invitar usuarios' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 4. Parse request body
  const { email, full_name, role } = await req.json()

  if (!email || !full_name || !role) {
    return new Response(JSON.stringify({ error: 'Email, nombre y rol son obligatorios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 5. Create Supabase admin client for user invitation
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // 6. Invite user via Auth Admin API
  // NOTE: redirectTo needs a /auth/callback route (not yet implemented).
  // Uncomment when the route exists in the SPA:
  //   redirectTo: `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/auth/callback`,
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name, role },
      // redirectTo: `${Deno.env.get('SITE_URL') ?? 'http://localhost:5173'}/auth/callback`,
    },
  )

  if (inviteError) {
    return new Response(JSON.stringify({ error: inviteError.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 7. Create profile entry for the invited user
  const { error: insertError } = await supabase.from('profiles').insert({
    id: inviteData.user.id,
    email,
    full_name,
    role,
    is_active: true,
  })

  if (insertError) {
    // Profile may already exist if user was previously invited
    if (!insertError.message.includes('duplicate key')) {
      return new Response(JSON.stringify({ error: 'Error al crear perfil de usuario' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      user: {
        id: inviteData.user.id,
        email,
        full_name,
        role,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  )
})
