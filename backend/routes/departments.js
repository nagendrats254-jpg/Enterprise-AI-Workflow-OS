const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { supabase, addAudit } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// GET /api/departments
router.get('/', async (req, res) => {
  const { data: departments, error } = await supabase
    .from('departments')
    .select('*')
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  res.json({ departments: departments || [] });
});

// GET /api/departments/:id
router.get('/:id', async (req, res) => {
  const { data: department, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', parseInt(req.params.id))
    .single();

  if (error || !department) return res.status(404).json({ message: 'Department not found' });
  res.json({ department });
});

// POST /api/departments — admin only
router.post(
  '/',
  requireRole('admin'),
  [body('name').notEmpty().withMessage('Name required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, head = '', employees = 0, projects = 0 } = req.body;

    const { data: existing } = await supabase
      .from('departments')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: 'Department already exists' });
    }

    const { data: dept, error } = await supabase
      .from('departments')
      .insert([{ name: name.trim(), head, employees, projects }])
      .select('*')
      .single();

    if (error) return res.status(500).json({ message: error.message });

    await addAudit(req.user.id, 'Created department', `Department: ${name}`, req.ip);
    res.status(201).json({ department: dept });
  }
);

// PUT /api/departments/:id — admin only
router.put('/:id', requireRole('admin'), async (req, res) => {
  const allowed = ['name', 'head', 'employees', 'projects'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const { data: dept, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', parseInt(req.params.id))
    .select('*')
    .single();

  if (error || !dept) return res.status(404).json({ message: 'Department not found' });

  await addAudit(req.user.id, 'Updated department', `Department: ${dept.name}`, req.ip);
  res.json({ department: dept });
});

// DELETE /api/departments/:id — admin only
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { data: deleted, error } = await supabase
    .from('departments')
    .delete()
    .eq('id', parseInt(req.params.id))
    .select('name')
    .single();

  if (error || !deleted) return res.status(404).json({ message: 'Department not found' });

  await addAudit(req.user.id, 'Deleted department', `Department: ${deleted.name}`, req.ip);
  res.json({ message: 'Department deleted' });
});

module.exports = router;
