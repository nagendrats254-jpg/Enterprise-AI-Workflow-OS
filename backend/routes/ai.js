const router = require('express').Router();
const { supabase } = require('../db');
const { auth } = require('../middleware/auth');

router.use(auth);

// POST /api/ai/chat - AI assistant chat endpoint
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'message is required' });

  const [{ data: tasks }, { data: projects }, { data: users }] = await Promise.all([
    supabase.from('tasks').select('title, status, priority, progress, risk_level, delay_prob, deadline, assigned, project'),
    supabase.from('projects').select('name, status, progress, deadline, risk'),
    supabase.from('users').select('id, name, role').eq('role', 'employee'),
  ]);

  const allTasks = tasks || [];
  const allProjects = projects || [];
  const allUsers = users || [];

  const workload = allUsers.map(u => {
    const active = allTasks.filter(t => t.assigned === u.name && t.status !== 'completed').length;
    return { name: u.name, activeTasks: active, utilization: Math.round((active / 10) * 100) };
  });

  const context = `
You are an intelligent enterprise SaaS assistant. You help team members with project management, task tracking, and workload analysis.

Current system data:
- Tasks: ${JSON.stringify(allTasks)}
- Projects: ${JSON.stringify(allProjects)}
- Workload: ${JSON.stringify(workload)}

Respond concisely and helpfully. Use bullet points when listing items. Keep responses under 300 words.
`;

  // Try real LLM if API key configured
  if (process.env.AI_API_KEY) {
    try {
      const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
      let response;

      if (provider === 'gemini') {
        const model = process.env.AI_MODEL || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.AI_API_KEY}`;
        const body = {
          contents: [{ role: 'user', parts: [{ text: context + '\n\nUser: ' + message }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        };
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await r.json();
        if (data.error) {
          console.error('[Gemini API error]', data.error);
        } else {
          response = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }
      } else {
        const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
        const model = process.env.AI_MODEL || 'gpt-4o-mini';
        const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
        const body = {
          model,
          messages: [
            { role: 'system', content: context },
            { role: 'user', content: message },
          ],
          max_tokens: 1024,
          temperature: 0.7,
        };
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.AI_API_KEY}`,
          },
          body: JSON.stringify(body),
        });
        const data = await r.json();
        if (data.error) {
          console.error('[OpenAI API error]', data.error);
        } else {
          response = data?.choices?.[0]?.message?.content || null;
        }
      }

      if (response) {
        return res.json({ response, model: process.env.AI_MODEL || provider });
      }
    } catch (err) {
      console.warn('[AI API error, falling back to heuristics]', err.message);
    }
  }

  // Fallback: Smart heuristic response based on live database data
  const q = message.toLowerCase();
  let reply = '';

  if (q.includes('risk') || q.includes('delayed') || q.includes('problem')) {
    const atRisk = allTasks.filter(t => t.risk_level === 'high' || t.status === 'delayed');
    if (atRisk.length) {
      reply = `There are ${atRisk.length} tasks flagged as at-risk or delayed:\n` +
        atRisk.map(t => `* ${t.title} (${t.project}) - status: ${t.status}, risk: ${t.risk_level}, assigned to ${t.assigned}`).join('\n') +
        '\n\nRecommendation: Review these tasks and consider reallocating resources or extending deadlines.';
    } else {
      reply = 'All tasks are currently within acceptable risk parameters.';
    }
  } else if (q.includes('workload') || q.includes('capacity') || q.includes('overloaded')) {
    const highLoad = workload.filter(w => w.utilization >= 80);
    if (highLoad.length) {
      reply = `Team members near or above capacity:\n` +
        highLoad.map(w => `* ${w.name}: ${w.activeTasks} active tasks (${w.utilization}% capacity)`).join('\n') +
        '\n\nConsider redistributing tasks from these team members.';
    } else {
      reply = 'Team workload is evenly balanced across all members.';
    }
  } else if (q.includes('project') || q.includes('progress')) {
    reply = `Current project status:\n` +
      allProjects.map(p => `* ${p.name}: ${p.progress}% complete, status: ${p.status}, deadline: ${p.deadline}`).join('\n');
  } else {
    const pending = allTasks.filter(t => t.status !== 'completed').length;
    reply = `Overview: ${allProjects.length} active projects, ${pending} pending tasks.\n\n` +
      'You can ask me about:\n' +
      '* At-risk or delayed tasks\n' +
      '* Team workload and capacity\n' +
      '* Project completion and deadlines';
  }

  res.json({ response: reply, model: 'heuristic-engine' });
});

// GET /api/ai/status - report AI configuration status
router.get('/status', (req, res) => {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  const isConfigured = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.trim() !== '');
  res.json({
    configured: isConfigured,
    provider: isConfigured ? provider : 'heuristic-engine',
    model: isConfigured
      ? process.env.AI_MODEL || (provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini')
      : 'local-heuristics',
  });
});

module.exports = router;

