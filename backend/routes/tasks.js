const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { supabase, addAudit } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// GET /api/tasks — admin/manager sees all; employee sees only theirs
router.get('/', async (req, res) => {
  let query = supabase.from('tasks').select('*').order('id', { ascending: true });

  if (req.user.role === 'employee') {
    query = query.eq('assigned_to', req.user.id);
  }

  const { data: tasks, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  res.json({ tasks: tasks || [] });
});

// GET /api/tasks/my — current user's tasks
router.get('/my', async (req, res) => {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', req.user.id)
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });
  res.json({ tasks: tasks || [] });
});

// GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !task) return res.status(404).json({ message: 'Task not found' });
  if (req.user.role === 'employee' && task.assigned_to !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json({ task });
});

// POST /api/tasks — admin/manager only
router.post(
  '/',
  requireRole('admin', 'manager'),
  [
    body('title').notEmpty().withMessage('Title required'),
    body('project_id').isInt().withMessage('Valid project_id required'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('deadline').isISO8601().withMessage('Valid deadline required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

    const { title, project_id, priority, deadline, description = '', assigned_to, status = 'not_started' } = req.body;

    const { data: project } = await supabase
      .from('projects')
      .select('name, tasks')
      .eq('id', parseInt(project_id))
      .single();

    if (!project) return res.status(404).json({ message: 'Project not found' });

    let assignedName = 'Unassigned';
    let assignedId = null;

    if (assigned_to) {
      const { data: user } = await supabase
        .from('users')
        .select('id, name')
        .eq('id', parseInt(assigned_to))
        .single();
      if (user) {
        assignedId = user.id;
        assignedName = user.name;
      }
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          project_id: parseInt(project_id),
          project: project.name,
          priority,
          deadline,
          description,
          status,
          assigned_to: assignedId,
          assigned: assignedName,
          progress: 0,
          risk_level: 'low',
          delay_prob: 0.1,
        },
      ])
      .select('*')
      .single();

    if (error) return res.status(500).json({ message: error.message });

    // Update project task count
    await supabase
      .from('projects')
      .update({ tasks: (project.tasks || 0) + 1 })
      .eq('id', parseInt(project_id));

    await addAudit(req.user.id, 'Created task', `Task: ${title}`, req.ip);
    res.status(201).json({ task });
  }
);

// PUT /api/tasks/:id — admin/manager; or employee for their own task
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (req.user.role === 'employee' && task.assigned_to !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const allowed = req.user.role === 'employee'
    ? ['status', 'progress']
    : ['title', 'description', 'priority', 'deadline', 'status', 'progress', 'assigned_to', 'risk_level', 'delay_prob'];

  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  // If reassigning, update assigned name too
  if (updates.assigned_to) {
    const { data: u } = await supabase
      .from('users')
      .select('name')
      .eq('id', parseInt(updates.assigned_to))
      .single();
    if (u) {
      updates.assigned = u.name;
      updates.assigned_to = parseInt(updates.assigned_to);
    }
  }

  const { data: updated, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !updated) return res.status(500).json({ message: error?.message || 'Update failed' });

  await addAudit(req.user.id, 'Updated task', `Task: ${task.title}`, req.ip);
  res.json({ task: updated });
});

// DELETE /api/tasks/:id — admin/manager only
router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { data: deleted, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .select('title, project_id')
    .single();

  if (error || !deleted) return res.status(404).json({ message: 'Task not found' });

  // Decrement project task count
  if (deleted.project_id) {
    const { data: proj } = await supabase
      .from('projects')
      .select('tasks')
      .eq('id', deleted.project_id)
      .single();
    if (proj && proj.tasks > 0) {
      await supabase
        .from('projects')
        .update({ tasks: proj.tasks - 1 })
        .eq('id', deleted.project_id);
    }
  }

  await addAudit(req.user.id, 'Deleted task', `Task: ${deleted.title}`, req.ip);
  res.json({ message: 'Task deleted' });
});

// PATCH /api/tasks/:id/status
router.patch('/:id/status', async (req, res) => {
  const id = parseInt(req.params.id);
  const valid = ['not_started', 'in_progress', 'completed', 'delayed'];
  if (!valid.includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const { data: task } = await supabase.from('tasks').select('*').eq('id', id).single();
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (req.user.role === 'employee' && task.assigned_to !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const updates = { status: req.body.status };
  if (req.body.status === 'completed') updates.progress = 100;

  const { data: updated, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return res.status(500).json({ message: error.message });

  await addAudit(req.user.id, 'Updated task status', `Task: ${task.title} → ${req.body.status}`, req.ip);
  res.json({ task: updated });
});

// PATCH /api/tasks/:id/progress
router.patch('/:id/progress', async (req, res) => {
  const id = parseInt(req.params.id);
  const { data: task } = await supabase.from('tasks').select('*').eq('id', id).single();
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (req.user.role === 'employee' && task.assigned_to !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const progress = parseInt(req.body.progress);
  if (isNaN(progress) || progress < 0 || progress > 100) {
    return res.status(400).json({ message: 'Progress must be 0–100' });
  }

  const updates = { progress };
  if (progress === 100) updates.status = 'completed';

  const { data: updated, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json({ task: updated });
});

// POST /api/tasks/:id/assign — admin/manager only
router.post('/:id/assign', requireRole('admin', 'manager'), async (req, res) => {
  const id = parseInt(req.params.id);
  const { employee_id } = req.body;

  const { data: employee } = await supabase
    .from('users')
    .select('id, name')
    .eq('id', parseInt(employee_id))
    .single();

  if (!employee) return res.status(404).json({ message: 'Employee not found' });

  const { data: updated, error } = await supabase
    .from('tasks')
    .update({ assigned_to: employee.id, assigned: employee.name })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !updated) return res.status(404).json({ message: 'Task not found' });

  await addAudit(req.user.id, 'Assigned task', `Task: ${updated.title} → ${employee.name}`, req.ip);
  res.json({ task: updated });
});

module.exports = router;
