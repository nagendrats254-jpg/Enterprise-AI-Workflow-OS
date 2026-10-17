const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { supabase, addAudit } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

// All user routes require authentication
router.use(auth);

// GET /api/users — admin/manager only
router.get('/', requireRole('admin', 'manager'), async (req, res) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, role, department, status, joined, avatar, created_at')
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  res.json({ users: users || [] });
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  // Employees can only view their own profile
  if (req.user.role === 'employee' && req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role, department, status, joined, avatar, created_at')
    .eq('id', id)
    .single();

  if (error || !user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

// POST /api/users — admin only
router.post(
  '/',
  requireRole('admin'),
  [
    body('name').notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
    body('department').notEmpty().withMessage('Department required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, email, role, department, password = 'password123', status = 'active' } = req.body;

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .ilike('email', email.trim())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: email.trim(),
          role,
          department,
          status,
          password: hashed,
          joined: new Date().toISOString().slice(0, 10),
        },
      ])
      .select('id, name, email, role, department, status, joined, avatar, created_at')
      .single();

    if (error) return res.status(500).json({ message: error.message });

    await addAudit(req.user.id, 'Created user', `User: ${name}`, req.ip);
    res.status(201).json({ user: newUser });
  }
);

// PUT /api/users/:id — admin only (or self for profile)
router.put(
  '/:id',
  [
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('role').optional().isIn(['admin', 'manager', 'employee']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const id = parseInt(req.params.id);

    // Non-admins can only update their own profile (and not their role)
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowed = ['name', 'email', 'department', 'status'];
    if (req.user.role === 'admin') allowed.push('role');

    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (req.body.password) {
      if (req.user.role === 'admin' || req.user.id === id) {
        updates.password = await bcrypt.hash(req.body.password, 10);
      }
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, role, department, status, joined, avatar, created_at')
      .single();

    if (error || !updated) return res.status(404).json({ message: error?.message || 'User not found' });

    await addAudit(req.user.id, 'Updated user', `User: ${updated.name}`, req.ip);
    res.json({ user: updated });
  }
);

// DELETE /api/users/:id — admin only
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.user.id) return res.status(400).json({ message: 'Cannot delete your own account' });

  const { data: deleted, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select('name')
    .single();

  if (error || !deleted) return res.status(404).json({ message: 'User not found' });

  await addAudit(req.user.id, 'Deleted user', `User: ${deleted.name}`, req.ip);
  res.json({ message: 'User deleted' });
});

module.exports = router;
