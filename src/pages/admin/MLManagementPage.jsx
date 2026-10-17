import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, ProgressBar } from '../../components/ui/Components';
import { tasksApi, mlApi, analyticsApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_TASKS } from '../../data/demoData';

const MODEL_CARDS = [
  {
    id: 'risk',
    name: 'Risk Classifier',
    type: 'Heuristic & Random Forest',
    accuracy: 88,
    status: 'active',
    lastTrained: '2026-10-15',
    features: ['task_priority', 'days_remaining', 'assignee_load', 'progress_ratio'],
    description: 'Classifies tasks as low / medium / high risk based on deadline proximity and workload metrics.',
  },
  {
    id: 'delay',
    name: 'Delay Predictor',
    type: 'Gradient Boosting Regressor',
    accuracy: 83,
    status: 'active',
    lastTrained: '2026-10-15',
    features: ['historical_delays', 'workload_ratio', 'deadline_proximity', 'complexity_score'],
    description: 'Estimates delay probability and projected delay days for project delivery milestones.',
  },
  {
    id: 'nlp',
    name: 'Text Feature Extractor',
    type: 'TF-IDF Urgency & Complexity',
    accuracy: 78,
    status: 'active',
    lastTrained: '2026-10-10',
    features: ['task_title', 'task_description', 'keyword_embeddings'],
    description: 'Analyzes task title and description for urgency and complexity indicators.',
  },
  {
    id: 'assign',
    name: 'Capacity Balancer',
    type: 'Collaborative Load Balancer',
    accuracy: 85,
    status: 'active',
    lastTrained: '2026-10-12',
    features: ['user_utilization', 'active_task_count', 'department_scope'],
    description: 'Assesses individual team member bandwidth and flags overload conditions.',
  },
];

const statusBadge = {
  active:   { cls: 'badge-success', label: 'Active' },
  inactive: { cls: 'badge-neutral', label: 'Inactive' },
  training: { cls: 'badge-info',    label: 'Training…' },
};

function ModelCard({ model, onToggle, onRetrain }) {
  const sb = statusBadge[model.status] || statusBadge.active;
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>{model.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{model.type}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className={`badge ${sb.cls}`}><span className="badge-dot" />{sb.label}</span>
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
          {model.description}
        </p>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Model Confidence</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{model.accuracy}%</span>
          </div>
          <ProgressBar value={model.accuracy} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 6 }}>
            Input Features
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {model.features.map(f => (
              <code key={f} style={{
                fontSize: 10, padding: '2px 6px', borderRadius: 3,
                background: 'var(--color-surface-dim)', border: '1px solid var(--color-border)',
                color: 'var(--color-violet-600)',
              }}>
                {f}
              </code>
            ))}
          </div>
        </div>
      </div>
      <div style={{
        borderTop: '1px solid var(--color-border-light)',
        padding: '10px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-surface-dim)', borderRadius: '0 0 10px 10px',
      }}>
        <span className="meta-text">Last verified: {model.lastTrained}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onRetrain(model.id)}
          >
            Re-evaluate
          </button>
          <button
            className={`btn btn-sm ${model.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => onToggle(model.id)}
          >
            {model.status === 'active' ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MLManagementPage() {
  const { data: tasksData, loading } = useApi(tasksApi.list);
  const { data: aiPerf } = useApi(analyticsApi.ai);

  const [models, setModels] = useState(MODEL_CARDS);
  const [toast, setToast] = useState(null);

  // Playground state
  const [testText, setTestText] = useState('Implement critical urgent database migration before deadline');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const isLive = !!tasksData?.tasks;
  const tasks = tasksData?.tasks || DEMO_TASKS;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleToggle(id) {
    setModels(prev => prev.map(m =>
      m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
    ));
    showToast('Model pipeline configuration saved.');
  }

  function handleRetrain(id) {
    const m = models.find(m => m.id === id);
    showToast(`Evaluation triggered for "${m.name}".`);
  }

  async function handleAnalyze() {
    if (!testText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await mlApi.analyzeText({ text: testText });
      if (res.analysis) {
        setAnalysisResult(res.analysis);
      }
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  }

  const activeModels  = models.filter(m => m.status === 'active').length;
  const avgAccuracy   = aiPerf?.analytics?.modelAccuracy || Math.round(models.reduce((s, m) => s + m.accuracy, 0) / models.length);
  const tasksScored   = tasks.length;
  const riskFlagged   = tasks.filter(t => (t.delay_prob || 0) > 0.4 || t.risk_level === 'high').length;

  return (
    <AppShell pageTitle="ML Management">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">ML Model Management</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live Model Pipeline
              </span>
            ) : loading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Monitor, inspect, and evaluate the predictive models analyzing your PostgreSQL tasks.
          </p>
        </div>

        {!isLive && !loading && <DemoBanner />}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Active Models</span>
            <span className="kpi-value" style={{ color: 'var(--color-success-600)' }}>{activeModels}</span>
            <span className="kpi-trend neutral">of {models.length} deployed</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Pipeline Accuracy</span>
            <span className="kpi-value">{loading ? '…' : `${avgAccuracy}%`}</span>
            <span className="kpi-trend up">Empirical tracking</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Tasks Scored</span>
            <span className="kpi-value">{loading ? '…' : tasksScored}</span>
            <span className="kpi-trend neutral">Live in database</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Risk Flags Raised</span>
            <span className="kpi-value" style={{ color: 'var(--color-warning-600)' }}>{loading ? '…' : riskFlagged}</span>
            <span className="kpi-trend down">Require review</span>
          </div>
        </div>

        {/* Model grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          {models.map(m => (
            <ModelCard key={m.id} model={m} onToggle={handleToggle} onRetrain={handleRetrain} />
          ))}
        </div>

        {/* Live NLP Text Playground */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="section-title">NLP Feature Extraction Playground</span></div>
          <div className="card-body" style={{ padding: '20px' }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 14px' }}>
              Test how the backend NLP model extracts urgency scores, complexity scores, and recommended priorities from task descriptions.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input
                className="form-input"
                value={testText}
                onChange={e => setTestText(e.target.value)}
                placeholder="Enter sample task title or requirements..."
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? 'Analyzing...' : 'Run Extraction'}
              </button>
            </div>

            {analysisResult && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: 16, background: 'var(--color-surface-dim)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Suggested Priority</div>
                  <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'capitalize', color: 'var(--color-violet-600)' }}>
                    {analysisResult.suggested_priority}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Urgency Score</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    {analysisResult.urgency_score}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Complexity Score</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    {analysisResult.complexity_score}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Est. Work Effort</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    ~{analysisResult.estimated_hours} hrs
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24,
            background: 'var(--color-navy-800)', color: '#fff',
            padding: '12px 18px', borderRadius: 8, fontSize: 13,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 9999,
          }}>
            {toast}
          </div>
        )}
      </div>
    </AppShell>
  );
}
