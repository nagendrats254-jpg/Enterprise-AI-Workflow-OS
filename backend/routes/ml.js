const router = require('express').Router();
const { supabase } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth);

// POST /api/ml/predict/risk — predict risk for a task
router.post('/predict/risk', requireRole('admin', 'manager'), async (req, res) => {
  const { task_id, title, progress, deadline, priority, assigned_to } = req.body;

  let risk_score = 0;
  const factors = [];

  if (deadline) {
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) {
      risk_score += 0.4;
      factors.push('Past deadline');
    } else if (daysLeft < 3) {
      risk_score += 0.3;
      factors.push('Less than 3 days remaining');
    } else if (daysLeft < 7) {
      risk_score += 0.1;
      factors.push('Less than 1 week remaining');
    }
  }

  if (progress !== undefined) {
    if (progress === 0) {
      risk_score += 0.3;
      factors.push('No progress recorded');
    } else if (progress < 30) {
      risk_score += 0.15;
      factors.push('Low progress');
    }
  }

  if (priority === 'critical') {
    risk_score += 0.1;
    factors.push('Critical priority');
  }

  if (assigned_to) {
    const { data: assignee } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', parseInt(assigned_to))
      .single();

    if (assignee) {
      const { data: activeTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('assigned_to', assignee.id)
        .neq('status', 'completed');

      if ((activeTasks || []).length > 8) {
        risk_score += 0.15;
        factors.push(`${assignee.name} is heavily loaded`);
      }
    }
  }

  risk_score = Math.min(risk_score, 1);
  const risk_level = risk_score >= 0.7 ? 'high' : risk_score >= 0.4 ? 'medium' : 'low';

  // Update task in Supabase if task_id given
  if (task_id) {
    await supabase
      .from('tasks')
      .update({
        delay_prob: parseFloat(risk_score.toFixed(2)),
        risk_level,
      })
      .eq('id', parseInt(task_id));
  }

  res.json({
    prediction: {
      delay_probability: parseFloat(risk_score.toFixed(2)),
      risk_level,
      confidence: 0.78,
      factors,
      recommendation:
        risk_score >= 0.7
          ? 'Immediate attention required — consider reassigning or extending deadline.'
          : risk_score >= 0.4
          ? 'Monitor closely — check in with assignee and review blockers.'
          : 'On track — continue as planned.',
    },
  });
});

// POST /api/ml/predict/delay
router.post('/predict/delay', requireRole('admin', 'manager'), async (req, res) => {
  const { project_id } = req.body;

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', parseInt(project_id))
    .single();

  if (!project) return res.status(404).json({ message: 'Project not found' });

  const { data: projectTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', parseInt(project_id));

  const tasks = projectTasks || [];
  const delayedTasks = tasks.filter(t => t.status === 'delayed');
  const highRisk = tasks.filter(t => t.delay_prob > 0.6);

  const delay_prob = tasks.length
    ? parseFloat(((delayedTasks.length * 0.4 + highRisk.length * 0.3) / tasks.length).toFixed(2))
    : 0.1;

  const daysToDeadline = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const projectedDelay = delay_prob > 0.5 ? Math.round(delay_prob * 14) : 0;

  res.json({
    prediction: {
      project: project.name,
      delay_probability: Math.min(delay_prob, 1),
      projected_delay_days: projectedDelay,
      confidence: 0.74,
      days_to_deadline: daysToDeadline,
      at_risk_tasks: highRisk.length,
      delayed_tasks: delayedTasks.length,
    },
  });
});

// POST /api/ml/analyze/text — basic NLP task description analysis
router.post('/analyze/text', auth, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Text required' });

  const lower = text.toLowerCase();
  const urgencyWords = ['urgent', 'critical', 'asap', 'immediately', 'deadline', 'blocker'];
  const complexityWords = ['integrate', 'migrate', 'refactor', 'architect', 'optimize', 'design'];

  const urgencyScore = urgencyWords.filter(w => lower.includes(w)).length / urgencyWords.length;
  const complexityScore = complexityWords.filter(w => lower.includes(w)).length / complexityWords.length;

  const suggestedPriority = urgencyScore > 0.3 ? 'high' : complexityScore > 0.3 ? 'medium' : 'low';
  const estimatedHours = Math.round(5 + complexityScore * 20 + urgencyScore * 5);

  res.json({
    analysis: {
      urgency_score: parseFloat(urgencyScore.toFixed(2)),
      complexity_score: parseFloat(complexityScore.toFixed(2)),
      suggested_priority: suggestedPriority,
      estimated_hours: estimatedHours,
      keywords: [
        ...urgencyWords.filter(w => lower.includes(w)),
        ...complexityWords.filter(w => lower.includes(w)),
      ],
    },
  });
});

// GET /api/ml/predictions/:taskId
router.get('/predictions/:taskId', requireRole('admin', 'manager'), async (req, res) => {
  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, delay_prob, risk_level, status, progress')
    .eq('id', parseInt(req.params.taskId))
    .single();

  if (!task) return res.status(404).json({ message: 'Task not found' });

  res.json({
    predictions: {
      task_id: task.id,
      title: task.title,
      delay_probability: Number(task.delay_prob) || 0,
      risk_level: task.risk_level,
      status: task.status,
      progress: task.progress,
      confidence: 0.81,
    },
  });
});

module.exports = router;
