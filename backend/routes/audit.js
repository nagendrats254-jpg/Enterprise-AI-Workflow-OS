const router = require('express').Router();
const { supabase } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth, requireRole('admin'));

// GET /api/audit-logs?page=1&limit=20&user=&action=
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, user = '', action = '' } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.max(1, parseInt(limit) || 20);
  const from = (p - 1) * l;
  const to = from + l - 1;

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false });

  if (user) {
    query = query.ilike('user_name', `%${user}%`);
  }
  if (action) {
    query = query.ilike('action', `%${action}%`);
  }

  const { data: logs, count, error } = await query.range(from, to);

  if (error) return res.status(500).json({ message: error.message });

  // Map user_name to user for frontend compatibility
  const formattedLogs = (logs || []).map(log => ({
    id: log.id,
    user: log.user_name,
    user_id: log.user_id,
    action: log.action,
    resource: log.resource,
    timestamp: log.timestamp,
    ip: log.ip,
  }));

  res.json({
    logs: formattedLogs,
    total: count || 0,
    page: p,
    limit: l,
  });
});

module.exports = router;
