const router = require('express').Router();
const { supabase } = require('../db');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/workload — org-level workload (admin/manager)
router.get('/', async (req, res) => {
  const { data: users } = await supabase
    .from('users')
    .select('id, name, department, role, status')
    .eq('role', 'employee')
    .eq('status', 'active');

  const { data: activeTasks } = await supabase
    .from('tasks')
    .select('id, title, priority, status, assigned_to')
    .neq('status', 'completed');

  const tasksList = activeTasks || [];
  const workload = (users || []).map(u => {
    const userTasks = tasksList.filter(t => t.assigned_to === u.id);
    const capacity = 10;
    const utilization = Math.round((userTasks.length / capacity) * 100);
    const status = utilization >= 100 ? 'overloaded' : utilization >= 80 ? 'normal' : 'available';

    return {
      id: u.id,
      name: u.name,
      department: u.department,
      tasks: userTasks.length,
      capacity,
      utilization,
      status,
      taskList: userTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, status: t.status })),
    };
  });

  res.json({ workload });
});

// GET /api/workload/me — current user's workload
router.get('/me', async (req, res) => {
  const { data: allUserTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', req.user.id);

  const tasks = allUserTasks || [];
  const active = tasks.filter(t => t.status !== 'completed');
  const completed = tasks.filter(t => t.status === 'completed');
  const capacity = 10;
  const utilization = Math.round((active.length / capacity) * 100);
  const status = utilization >= 100 ? 'overloaded' : utilization >= 80 ? 'normal' : 'available';

  res.json({
    workload: {
      id: req.user.id,
      name: req.user.name,
      tasks: active.length,
      capacity,
      utilization,
      status,
      activeTasks: active,
      completedTasks: completed,
    },
  });
});

module.exports = router;
