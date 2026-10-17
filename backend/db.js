const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[DB WARNING] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file!');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper for audit logging in Supabase
async function addAudit(userId, action, resource, ip = '127.0.0.1') {
  try {
    let userName = 'Unknown';
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single();
      if (user) userName = user.name;
    }

    await supabase.from('audit_logs').insert([
      {
        user_name: userName,
        user_id: userId || null,
        action,
        resource,
        ip,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
}

module.exports = {
  supabase,
  addAudit,
};
