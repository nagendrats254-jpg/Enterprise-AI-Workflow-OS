import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner } from '../../components/ui/Components';
import { tasksApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_RISK_ITEMS } from '../../data/demoData';

function SeverityBar({ label, value, max, color }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function RiskCard({ item }) {
  const colors = {
    critical: { border: '#fca5a5', bg: '#fff5f5', badge: 'badge-danger',  accent: 'var(--color-danger-600)'  },
    high:     { border: '#fde68a', bg: '#fffbeb', badge: 'badge-warning', accent: 'var(--color-warning-600)' },
    medium:   { border: '#bfdbfe', bg: '#eff6ff', badge: 'badge-info',    accent: 'var(--color-info-600)'    },
  };
  const c = colors[item.severity] || colors.medium;

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      padding: '18px 20px',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>{item.task}</div>
          <div className="meta-text">{item.project} · Assigned to: {item.assigned || 'Team member'}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span className={`badge ${c.badge}`}><span className="badge-dot" />{item.severity}</span>
          <span className={`badge ${item.status === 'open' || item.status === 'delayed' ? 'badge-danger' : 'badge-warning'}`}>
            <span className="badge-dot" />{item.status || 'flagged'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Detected Pattern
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{item.cause}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
            Recommended Action
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{item.recommendation}</div>
        </div>
      </div>

      <div style={{
        borderTop: `1px solid ${c.border}`, paddingTop: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Risk score:
          <strong style={{ color: c.accent, marginLeft: 4 }}>{Math.round((item.prediction_confidence || item.delay_prob || 0.75) * 100)}%</strong>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Deadline: {item.deadline || 'Pending'}</span>
      </div>
    </div>
  );
}

export default function RiskAnalysisPage() {
  const { data: tasksData, loading } = useApi(tasksApi.list);

  const isLive = !!tasksData?.tasks;
  const tasks = tasksData?.tasks;

  // Derive risk items from live tasks if available, otherwise fall back to demo items
  const riskItems = isLive
    ? tasks
        .filter(t => (t.delay_prob || 0) > 0.3 || t.risk_level === 'high' || t.status === 'delayed')
        .map(t => {
          const sev = t.status === 'delayed' || (t.delay_prob || 0) > 0.7 ? 'critical' : (t.delay_prob || 0) > 0.4 ? 'high' : 'medium';
          let cause = 'Low sprint progress relative to deadline.';
          if (t.status === 'delayed') cause = 'Task deadline has elapsed without completion.';
          else if (t.priority === 'critical') cause = 'High complexity critical path item with pending blockers.';

          let recommendation = 'Review task blockers with assignee.';
          if (sev === 'critical') recommendation = 'Immediate intervention required: reassign or extend target completion date.';

          return {
            id: t.id,
            task: t.title,
            project: t.project,
            assigned: t.assigned,
            severity: sev,
            status: t.status,
            cause,
            recommendation,
            prediction_confidence: t.delay_prob || 0.7,
            deadline: t.deadline,
          };
        })
    : DEMO_RISK_ITEMS;

  const displayItems = riskItems.length ? riskItems : DEMO_RISK_ITEMS;
  const critical = displayItems.filter(r => r.severity === 'critical').length;
  const high     = displayItems.filter(r => r.severity === 'high').length;
  const medium   = displayItems.filter(r => r.severity === 'medium').length;

  return (
    <AppShell pageTitle="Risk Analysis">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">Risk Analysis</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB
              </span>
            ) : loading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Analyzing tasks...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Tasks identified as potentially at risk, based on PostgreSQL deadlines and progress metrics.
          </p>
        </div>

        {!isLive && !loading && (
          <DemoBanner message="Risk predictions are generated by heuristic models. Connect live tasks to analyze in real time." />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 24 }}>
          {/* Risk items */}
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
              <span className="section-title">Detected Risk Items</span>
              <span className="badge badge-danger"><span className="badge-dot" />{displayItems.length} items</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {displayItems.map(item => <RiskCard key={item.id} item={item} />)}
            </div>
          </div>

          {/* Risk summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header"><span className="section-title">Severity Distribution</span></div>
              <div className="card-body">
                <SeverityBar label="Critical" value={critical} max={displayItems.length} color="var(--color-danger-500)" />
                <SeverityBar label="High"     value={high}     max={displayItems.length} color="var(--color-warning-500)" />
                <SeverityBar label="Medium"   value={medium}   max={displayItems.length} color="var(--color-info-500)" />
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="section-title">Model Diagnostics</span></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 3 }}>Risk Model</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>Heuristic Risk & Progress Model</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 3 }}>Source Data</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>Supabase PostgreSQL Tasks</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 3 }}>Threshold</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>Delay Prob &gt; 30% / Delayed status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
