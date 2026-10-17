const router = require('express').Router();
const { supabase } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// GET /api/dashboard/admin
router.get('/admin', requireRole('admin'), async (req, res) => {
  const [
    { data: users },
    { data: projects },
    { data: tasks },
    { data: depts },
    { data: auditLogs },
  ] = await Promise.all([
    supabase.from('users').select('id, role, status'),
    supabase.from('projects').select('id, status'),
    supabase.from('tasks').select('*'),
    supabase.from('departments').select('id'),
    supabase.from('audit_logs').select('*').order('id', { ascending: false }).limit(5),
  ]);

  const allTasks = tasks || [];
  const allUsers = users || [];
  const allProjects = projects || [];
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === 'completed').length;
  const delayed = allTasks.filter(t => t.status === 'delayed').length;
  const atRisk = allTasks.filter(t => t.delay_prob > 0.5).length;

  const activeEmployees = allUsers.filter(u => u.role === 'employee' && u.status === 'active');
  const overloaded = activeEmployees.filter(u => {
    const activeTasks = allTasks.filter(t => t.assigned_to === u.id && t.status !== 'completed');
    return activeTasks.length > 10;
  });

  const formattedLogs = (auditLogs || []).map(log => ({
    id: log.id,
    user: log.user_name,
    user_id: log.user_id,
    action: log.action,
    resource: log.resource,
    timestamp: log.timestamp,
    ip: log.ip,
  }));

  res.json({
    stats: {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.status === 'active').length,
      totalProjects: allProjects.length,
      activeProjects: allProjects.filter(p => p.status === 'active').length,
      totalTasks: total,
      completedTasks: completed,
      delayedTasks: delayed,
      atRiskTasks: atRisk,
      taskCompletionRate: total ? Math.round((completed / total) * 100) : 0,
      overloadedEmployees: overloaded.length,
      departments: (depts || []).length,
    },
    recentActivity: formattedLogs,
    riskItems: allTasks
      .filter(t => t.risk_level === 'high' || t.delay_prob > 0.7)
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        task: t.title,
        project: t.project,
        severity: t.risk_level === 'high' ? 'high' : 'medium',
        delay_prob: t.delay_prob,
        assigned: t.assigned,
      })),
  });
});

// GET /api/dashboard/manager
router.get('/manager', requireRole('admin', 'manager'), async (req, res) => {
  const [
    { data: projects },
    { data: tasks },
    { data: users },
  ] = await Promise.all([
    supabase.from('projects').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('users').select('id, role'),
  ]);

  const allTasks = tasks || [];
  const allProjects = projects || [];
  const allUsers = users || [];

  res.json({
    stats: {
      totalProjects: allProjects.filter(p => p.status !== 'archived').length,
      activeProjects: allProjects.filter(p => p.status === 'active').length,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === 'completed').length,
      delayedTasks: allTasks.filter(t => t.status === 'delayed').length,
      atRiskTasks: allTasks.filter(t => t.delay_prob > 0.5).length,
      teamSize: allUsers.filter(u => u.role === 'employee').length,
    },
    recentTasks: allTasks
      .filter(t => t.status !== 'completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5),
    projectSummary: allProjects.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      progress: p.progress,
      risk: p.risk,
      deadline: p.deadline,
    })),
  });
});

// GET /api/dashboard/employee
router.get('/employee', async (req, res) => {
  const [
    { data: myTasks },
    { data: projects },
  ] = await Promise.all([
    supabase.from('tasks').select('*').eq('assigned_to', req.user.id),
    supabase.from('projects').select('id, name, status, progress'),
  ]);

  const tasks = myTasks || [];
  const allProjects = projects || [];
  const active = tasks.filter(t => t.status !== 'completed');
  const completed = tasks.filter(t => t.status === 'completed');
  const upcoming = [...active].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const capacity = 10;
  const utilization = Math.round((active.length / capacity) * 100);

  res.json({
    stats: {
      totalTasks: tasks.length,
      activeTasks: active.length,
      completedTasks: completed.length,
      delayedTasks: tasks.filter(t => t.status === 'delayed').length,
      utilization,
      capacityStatus: utilization >= 100 ? 'overloaded' : utilization >= 80 ? 'normal' : 'available',
    },
    upcomingTasks: upcoming.slice(0, 5),
    recentCompletions: completed.slice(-3),
    projects: [...new Set(tasks.map(t => t.project))].map(name => {
      const proj = allProjects.find(p => p.name === name);
      return proj ? { id: proj.id, name: proj.name, status: proj.status, progress: proj.progress } : { name };
    }),
  });
});

module.exports = router;
