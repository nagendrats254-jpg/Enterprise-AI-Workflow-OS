const router = require('express').Router();
const { supabase } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// GET /api/analytics/overview
router.get('/overview', requireRole('admin', 'manager'), async (req, res) => {
  const [
    { data: tasks },
    { data: projects },
    { data: users },
  ] = await Promise.all([
    supabase.from('tasks').select('*'),
    supabase.from('projects').select('id, status'),
    supabase.from('users').select('id, status'),
  ]);

  const allTasks = tasks || [];
  const allProjects = projects || [];
  const allUsers = users || [];

  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === 'completed').length;
  const delayed = allTasks.filter(t => t.status === 'delayed').length;
  const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
  const highRisk = allTasks.filter(t => t.risk_level === 'high' || t.risk_level === 'critical').length;

  res.json({
    analytics: {
      tasks: {
        total,
        completed,
        delayed,
        inProgress,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
      },
      projects: {
        total: allProjects.length,
        active: allProjects.filter(p => p.status === 'active').length,
        delayed: allProjects.filter(p => p.status === 'delayed').length,
      },
      users: {
        total: allUsers.length,
        active: allUsers.filter(u => u.status === 'active').length,
      },
      risk: {
        highRisk,
        atRisk: allTasks.filter(t => t.delay_prob > 0.5).length,
      },
    },
  });
});

// GET /api/analytics/tasks
router.get('/tasks', requireRole('admin', 'manager'), async (req, res) => {
  const { data: tasks } = await supabase.from('tasks').select('status, priority');
  const allTasks = tasks || [];

  const byStatus = {};
  const byPriority = {};
  allTasks.forEach(t => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
  });

  res.json({
    analytics: {
      byStatus,
      byPriority,
      totalTasks: allTasks.length,
      trend: [
        { month: 'May', completed: 28, delayed: 3 },
        { month: 'Jun', completed: 34, delayed: 5 },
        { month: 'Jul', completed: 31, delayed: 4 },
        { month: 'Aug', completed: 40, delayed: 6 },
        { month: 'Sep', completed: 38, delayed: 8 },
        { month: 'Oct', completed: 22, delayed: 4 },
      ],
    },
  });
});

// GET /api/analytics/workload
router.get('/workload', requireRole('admin', 'manager'), async (req, res) => {
  const workloadTrend = [
    { week: 'W1', avg: 72 },
    { week: 'W2', avg: 78 },
    { week: 'W3', avg: 85 },
    { week: 'W4', avg: 91 },
  ];

  const [{ data: depts }, { data: users }, { data: tasks }] = await Promise.all([
    supabase.from('departments').select('*'),
    supabase.from('users').select('id, department, role'),
    supabase.from('tasks').select('id, assigned_to, status'),
  ]);

  const allUsers = users || [];
  const allTasks = tasks || [];

  const byDepartment = (depts || []).map(d => {
    const deptUsers = allUsers.filter(u => u.department === d.name && u.role === 'employee');
    const deptUserIds = new Set(deptUsers.map(u => u.id));
    const deptTasks = allTasks.filter(t => deptUserIds.has(t.assigned_to));
    const active = deptTasks.filter(t => t.status !== 'completed');
    const capacity = deptUsers.length * 10;
    return {
      department: d.name,
      employees: deptUsers.length,
      activeTasks: active.length,
      utilization: capacity ? Math.round((active.length / capacity) * 100) : 0,
    };
  });

  res.json({ analytics: { workloadTrend, byDepartment } });
});

// GET /api/analytics/ai-performance
router.get('/ai-performance', requireRole('admin', 'manager'), async (req, res) => {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, delay_prob, risk_level, status');

  const allTasks = tasks || [];
  const predictions = allTasks.map(t => ({
    taskId: t.id,
    title: t.title,
    delay_prob: Number(t.delay_prob) || 0,
    risk_level: t.risk_level,
    actual_delayed: t.status === 'delayed',
  }));

  const accuracy = allTasks.length
    ? Math.round(
        (predictions.filter(p => (p.delay_prob > 0.5) === p.actual_delayed).length /
          predictions.length) *
          100
      )
    : 100;

  res.json({
    analytics: {
      modelAccuracy: accuracy,
      totalPredictions: predictions.length,
      highRiskCount: predictions.filter(p => p.delay_prob > 0.7).length,
      predictions,
      riskTrend: [
        { month: 'May', high: 2, medium: 4, low: 8 },
        { month: 'Jun', high: 3, medium: 5, low: 10 },
        { month: 'Jul', high: 2, medium: 3, low: 9 },
        { month: 'Aug', high: 4, medium: 6, low: 12 },
        { month: 'Sep', high: 5, medium: 7, low: 10 },
        { month: 'Oct', high: 3, medium: 5, low: 7 },
      ],
    },
  });
});

module.exports = router;
