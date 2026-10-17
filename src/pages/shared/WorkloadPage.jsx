import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, Avatar } from '../../components/ui/Components';
import { workloadApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_WORKLOAD } from '../../data/demoData';

function WorkloadBar({ member }) {
  const util = member.utilization;
  const color = util > 100 ? 'var(--color-danger-500)' : util > 80 ? 'var(--color-warning-500)' : 'var(--color-success-500)';
  const statusLabel = util > 100 ? 'Overloaded' : util > 80 ? 'High Load' : util > 50 ? 'Normal' : 'Available';
  const statusBadge = util > 100 ? 'badge-danger' : util > 80 ? 'badge-warning' : util > 50 ? 'badge-info' : 'badge-success';

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 10, padding: '16px 20px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={member.name} size={36} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{member.name}</div>
            <div className="meta-text">{member.department}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{util}%</div>
          <span className={`badge ${statusBadge}`} style={{ fontSize: 10 }}>
            <span className="badge-dot" />{statusLabel}
          </span>
        </div>
      </div>

      <div className="progress-bar" style={{ height: 8, marginBottom: 10 }}>
        <div style={{
          height: '100%', width: `${Math.min(util, 100)}%`,
          background: color, borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
        <span>{member.tasks} active tasks</span>
        <span>Capacity: {member.capacity} tasks</span>
      </div>
    </div>
  );
}

export default function WorkloadPage() {
  const { data: liveData, loading } = useApi(workloadApi.org);

  const isLive = !!liveData?.workload;
  const workload = liveData?.workload || DEMO_WORKLOAD;

  const overloaded = workload.filter(w => w.status === 'overloaded');
  const normal     = workload.filter(w => w.status === 'normal');
  const available  = workload.filter(w => w.status === 'available');
  const avgUtil    = workload.length
    ? Math.round(workload.reduce((s, w) => s + (w.utilization || 0), 0) / workload.length)
    : 0;

  return (
    <AppShell pageTitle="Workload">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">Team Workload</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB
              </span>
            ) : loading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Calculating...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Current task capacity and utilization calculated live across your team.
          </p>
        </div>

        {!isLive && !loading && <DemoBanner />}

        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Avg. Utilization</span>
            <span className="kpi-value" style={{ color: avgUtil > 85 ? 'var(--color-warning-600)' : 'var(--color-text-primary)' }}>
              {loading ? '…' : `${avgUtil}%`}
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Overloaded</span>
            <span className="kpi-value" style={{ color: overloaded.length > 0 ? 'var(--color-danger-600)' : 'var(--color-text-primary)' }}>
              {loading ? '…' : overloaded.length}
            </span>
            <span className="kpi-trend down">Above 100% capacity</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Normal Load</span>
            <span className="kpi-value">{loading ? '…' : normal.length}</span>
            <span className="kpi-trend neutral">50-100% capacity</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Available</span>
            <span className="kpi-value" style={{ color: 'var(--color-success-600)' }}>
              {loading ? '…' : available.length}
            </span>
            <span className="kpi-trend up">Below 50% capacity</span>
          </div>
        </div>

        {/* Overloaded alert */}
        {overloaded.length > 0 && (
          <div style={{
            padding: '12px 16px', marginBottom: 20,
            background: 'var(--color-danger-100)', border: '1px solid #fca5a5',
            borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="var(--color-danger-600)" strokeWidth="1.8" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10 2L2 17h16L10 2z"/><path d="M10 8v4M10 14v1"/>
            </svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-danger-700)' }}>Capacity Warning</div>
              <div style={{ fontSize: 12, color: 'var(--color-danger-600)', marginTop: 2 }}>
                {overloaded.map(o => o.name).join(', ')} {overloaded.length > 1 ? 'are' : 'is'} currently operating over maximum capacity. Consider redistributing pending tasks.
              </div>
            </div>
          </div>
        )}

        {/* Member cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {workload.map(member => (
            <WorkloadBar key={member.id || member.name} member={member} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
