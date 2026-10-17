const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { supabase, addAudit } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// GET /api/projects
router.get('/', async (req, res) => {
  if (req.user.role === 'employee') {
    // Employees see projects their tasks belong to
    const { data: myTasks } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('assigned_to', req.user.id);

    const projectIds = [...new Set((myTasks || []).map(t => t.project_id).filter(Boolean))];

    if (projectIds.length === 0) {
      return res.json({ projects: [] });
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)
      .order('id', { ascending: true });

    if (error) return res.status(500).json({ message: error.message });
    return res.json({ projects: projects || [] });
  }

  // Managers and Admins see all projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  res.json({ projects: projects || [] });
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', parseInt(req.params.id))
    .single();

  if (error || !project) return res.status(404).json({ message: 'Project not found' });
  res.json({ project });
});

// GET /api/projects/:id/tasks
router.get('/:id/tasks', async (req, res) => {
  const projectId = parseInt(req.params.id);
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  res.json({ tasks: tasks || [] });
});

// POST /api/projects — admin/manager only
router.post(
  '/',
  requireRole('admin', 'manager'),
  [
    body('name').notEmpty().withMessage('Name required'),
    body('department').notEmpty().withMessage('Department required'),
    body('deadline').isISO8601().withMessage('Valid deadline required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { name, department, deadline, description = '', status = 'planning', risk = 'low' } = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          department,
          deadline,
          description,
          status,
          risk,
          progress: 0,
          tasks: 0,
          manager_id: req.user.id,
        },
      ])
      .select('*')
      .single();

    if (error) return res.status(500).json({ message: error.message });

    await addAudit(req.user.id, 'Created project', `Project: ${name}`, req.ip);
    res.status(201).json({ project });
  }
);

// PUT /api/projects/:id — admin/manager only
router.put('/:id', requireRole('admin', 'manager'), async (req, res) => {
  const allowed = ['name', 'department', 'deadline', 'description', 'status', 'risk', 'progress', 'tasks'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const { data: project, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', parseInt(req.params.id))
    .select('*')
    .single();

  if (error || !project) return res.status(404).json({ message: 'Project not found' });

  await addAudit(req.user.id, 'Updated project', `Project: ${project.name}`, req.ip);
  res.json({ project });
});

// DELETE /api/projects/:id — admin only
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { data: deleted, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', parseInt(req.params.id))
    .select('name')
    .single();

  if (error || !deleted) return res.status(404).json({ message: 'Project not found' });

  await addAudit(req.user.id, 'Deleted project', `Project: ${deleted.name}`, req.ip);
  res.json({ message: 'Project deleted' });
});

module.exports = router;
