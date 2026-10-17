import { useState, useRef, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner } from '../../components/ui/Components';
import { IconSend, IconAI } from '../../components/ui/Icons';
import { aiApi } from '../../services/api';
import { DEMO_TASKS, DEMO_PROJECTS, DEMO_WORKLOAD, DEMO_RISK_ITEMS } from '../../data/demoData';
import { useAuth } from '../../context/AuthContext';

// Offline fallback response based on keywords
function generateDemoResponse(question) {
  const q = question.toLowerCase();

  if (q.includes('pending') || (q.includes('task') && q.includes('my'))) {
    const activeTasks = DEMO_TASKS.filter(t => t.status !== 'completed');
    return {
      text: `You have ${activeTasks.length} active tasks. The most urgent are:\n\n${activeTasks.slice(0, 3).map(t => `- ${t.title} (${t.priority} priority, due ${t.deadline})`).join('\n')}\n\nWould you like details on any specific task?`,
      isDemo: true,
    };
  }
  if (q.includes('risk')) {
    const high = DEMO_RISK_ITEMS.filter(r => r.severity === 'critical' || r.severity === 'high');
    return {
      text: `${high.length} tasks are currently flagged as high risk:\n\n${high.map(r => `- ${r.task}: ${r.cause}`).join('\n')}\n\nThe model recommends reviewing these immediately.`,
      isDemo: true,
    };
  }
  if (q.includes('due') || q.includes('deadline') || q.includes('next')) {
    const upcoming = [...DEMO_TASKS].filter(t => t.status !== 'completed').sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const next = upcoming[0];
    return {
      text: next
        ? `Your next upcoming deadline is:\n\n"${next.title}" — due ${next.deadline}\nCurrent status: ${next.status.replace('_', ' ')}\nProgress: ${next.progress}%\n\nPriority: ${next.priority}`
        : 'No upcoming deadlines found.',
      isDemo: true,
    };
  }
  if (q.includes('workload') || q.includes('capacity')) {
    const overloaded = DEMO_WORKLOAD.filter(w => w.status === 'overloaded');
    const avg = Math.round(DEMO_WORKLOAD.reduce((s, w) => s + w.utilization, 0) / DEMO_WORKLOAD.length);
    return {
      text: `Current team workload:\n- Average utilization: ${avg}%\n- Overloaded members: ${overloaded.length}\n\n${overloaded.length > 0 ? `${overloaded.map(w => w.name).join(', ')} are above 100% capacity. Consider redistributing tasks.` : 'All team members are within normal capacity.'}`,
      isDemo: true,
    };
  }
  if (q.includes('attention') || q.includes('delayed') || q.includes('problem')) {
    const delayed = DEMO_TASKS.filter(t => t.status === 'delayed');
    return {
      text: `${delayed.length} tasks need immediate attention:\n\n${delayed.map(t => `- ${t.title} (${t.project})`).join('\n')}\n\nThese tasks are past their expected completion points.`,
      isDemo: true,
    };
  }
  if (q.includes('project')) {
    const active = DEMO_PROJECTS.filter(p => p.status === 'active');
    return {
      text: `There are ${active.length} active projects:\n\n${active.map(p => `- ${p.name}: ${p.progress}% complete (due ${p.deadline})`).join('\n')}`,
      isDemo: true,
    };
  }
  return {
    text: "I can help you with:\n\n- Checking your pending tasks\n- Identifying at-risk tasks\n- Finding your next deadline\n- Reviewing team workload\n- Listing active projects\n\nTry asking: \"What tasks need attention?\" or \"Which tasks are at risk?\"",
    isDemo: true,
  };
}

const QUICK_QUESTIONS = [
  'What are my pending tasks?',
  'Which tasks are at risk?',
  'What is my next deadline?',
  'How is the team workload?',
  'Which tasks need attention?',
];

export default function AIAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello, ${user?.name?.split(' ')[0] || 'there'}. I am connected to your enterprise database. I can help analyze project risks, track pending deadlines, and review team workload. What would you like to know?`,
      isDemo: false,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [aiStatus, setAiStatus] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    aiApi.status()
      .then(res => {
        if (res) setAiStatus(res);
      })
      .catch(() => setAiStatus(null));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await aiApi.chat(text);
      if (data && data.response) {
        setIsLiveConnected(true);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          model: data.model,
          isDemo: false,
        }]);
      } else {
        throw new Error('No response from AI route');
      }
    } catch (err) {
      // Fallback
      setIsLiveConnected(false);
      const fallback = generateDemoResponse(text);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: fallback.text,
        isDemo: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <AppShell pageTitle="AI Assistant">
      <div style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">AI Workflow Assistant</h1>
            {isLiveConnected ? (
              aiStatus?.configured ? (
                <span style={{ fontSize: 11, background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  ✦ Live LLM: {aiStatus.provider.toUpperCase()} ({aiStatus.model})
                </span>
              ) : (
                <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  ● PostgreSQL Heuristic Engine
                </span>
              )
            ) : (
              <span style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ○ Demo Fallback
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Ask questions about tasks, workload, deadlines, and risk powered by live PostgreSQL metrics.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 580, padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--color-border-light)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--color-surface)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: 'var(--color-violet-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconAI style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>Workflow Assistant</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Context: Live Tasks, Projects & Workload</div>
            </div>
          </div>

          {/* Quick prompt buttons */}
          <div style={{
            padding: '10px 20px', background: 'var(--color-surface-dim)',
            borderBottom: '1px solid var(--color-border-light)',
            display: 'flex', gap: 8, flexWrap: 'wrap',
          }}>
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                className="btn btn-secondary btn-sm"
                onClick={() => sendMessage(q)}
                style={{ fontSize: 11, padding: '4px 10px' }}
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages scroll area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 18,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'var(--color-violet-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <IconAI style={{ width: 14, height: 14, color: '#fff' }} />
                  </div>
                )}
                <div style={{ maxWidth: '80%' }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: msg.role === 'user' ? 'var(--color-violet-500)' : 'var(--color-surface)',
                    color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && (
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4, paddingLeft: 4 }}>
                      {msg.model ? `Engine: ${msg.model}` : 'Enterprise AI'}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'var(--color-violet-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconAI style={{ width: 14, height: 14, color: '#fff' }} />
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  fontSize: 13, color: 'var(--color-text-muted)',
                }}>
                  Analyzing database context...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input box */}
          <form onSubmit={handleSubmit} style={{
            padding: '12px 20px', borderTop: '1px solid var(--color-border-light)',
            display: 'flex', gap: 10, background: 'var(--color-surface)',
          }}>
            <input
              className="form-input"
              placeholder="Ask anything about tasks, workload, or deadlines..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1 }}
              disabled={loading}
              aria-label="Ask assistant a question"
            />
            <button
              type="submit"
              className="btn btn-primary btn-icon"
              disabled={!input.trim() || loading}
              aria-label="Send question"
            >
              <IconSend style={{ width: 14, height: 14 }} />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
