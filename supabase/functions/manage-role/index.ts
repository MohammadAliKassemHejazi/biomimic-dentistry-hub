import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client for role management
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create client with user's auth for verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the requesting user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is admin using the security definer function
    const { data: isAdmin, error: roleCheckError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleCheckError) {
      console.error('Role check failed:', roleCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAdmin) {
      console.error('User is not admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, targetUserId, role } = await req.json();
    console.log('Admin action:', { action, targetUserId, role, adminId: user.id });

    const validRoles = ['user', 'vip', 'ambassador', 'admin'];

    if (action === 'set_role') {
      if (!targetUserId || !role) {
        return new Response(
          JSON.stringify({ error: 'Missing targetUserId or role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!validRoles.includes(role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete existing roles for user
      const { error: deleteError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId);

      if (deleteError) {
        console.error('Failed to delete existing roles:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to update role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert new role
      const { error: insertError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: targetUserId, role: role });

      if (insertError) {
        console.error('Failed to insert new role:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to set role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Role updated successfully:', { targetUserId, role });
      return new Response(
        JSON.stringify({ success: true, message: 'Role updated successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_role') {
      if (!targetUserId) {
        return new Response(
          JSON.stringify({ error: 'Missing targetUserId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: roleData, error: roleError } = await supabaseAdmin.rpc('get_user_role_from_table', {
        _user_id: targetUserId
      });

      if (roleError) {
        console.error('Failed to get role:', roleError);
        return new Response(
          JSON.stringify({ error: 'Failed to get role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ role: roleData || 'user' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list_users_with_roles') {
      // Get all profiles with their roles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Failed to fetch profiles:', profilesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get all user roles
      const { data: roles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Failed to fetch roles:', rolesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch roles' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create a map of user_id to role
      const roleMap = new Map<string, string>();
      roles?.forEach((r: { user_id: string; role: string }) => {
        roleMap.set(r.user_id, r.role);
      });

      // Combine profiles with roles
      const usersWithRoles = profiles?.map((profile: any) => ({
        ...profile,
        role: roleMap.get(profile.user_id) || 'user'
      }));

      return new Response(
        JSON.stringify({ users: usersWithRoles }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
