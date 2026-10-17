import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner } from '../../components/ui/Components';
import { useAuth } from '../../context/AuthContext';
import { workloadApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_TASKS, DEMO_WORKLOAD } from '../../data/demoData';

export default function EmployeeWorkloadPage() {
  const { user } = useAuth();
  const { data: workloadData, loading } = useApi(workloadApi.me);

  const isLive = !!workloadData?.workload;
  const wl = workloadData?.workload;

  const myName = user?.name || 'Alex Torres';
  const myWorkload = wl || DEMO_WORKLOAD.find(w => w.name === myName) || DEMO_WORKLOAD[0];
  const activeTasks = wl?.activeTasks || DEMO_TASKS.filter(t => t.assigned === myName && t.status !== 'completed');
  const completedTasks = wl?.completedTasks || DEMO_TASKS.filter(t => t.assigned === myName && t.status === 'completed');

  const utilization = myWorkload.utilization ?? 70;
  const utilColor = utilization > 100 ? 'var(--color-danger-500)' : utilization > 80 ? 'var(--color-warning-500)' : 'var(--color-success-500)';
  const utilLabel = utilization > 100 ? 'Overloaded' : utilization > 80 ? 'High Load' : utilization > 50 ? 'Normal' : 'Available';

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedTasks = [...activeTasks].sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

  return (
    <AppShell pageTitle="My Workload">
      <div style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">My Workload</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB
              </span>
            ) : loading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Your personal capacity and task load summary calculated in real time.
          </p>
        </div>

        {!isLive && !loading && <DemoBanner />}

        {/* Capacity gauge card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="section-title">Capacity Overview</span></div>
          <div className="card-body" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Circular gauge */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <svg width={140} height={140} viewBox="0 0 140 140">
                  <circle cx={70} cy={70} r={55} fill="none" stroke="var(--color-border)" strokeWidth={10} />
                  <circle
                    cx={70} cy={70} r={55} fill="none"
                    stroke={utilColor}
                    strokeWidth={10}
                    strokeDasharray={`${Math.min(utilization, 100) * 3.456} 345.6`}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                  <text x={70} y={65} textAnchor="middle" style={{ fontSize: 24, fontWeight: 800, fill: 'var(--color-text-primary)' }}>
                    {utilization}%
                  </text>
                  <text x={70} y={84} textAnchor="middle" style={{ fontSize: 11, fill: utilColor, fontWeight: 600 }}>
                    {utilLabel}
                  </text>
                </svg>
              </div>

              {/* Stats breakdown */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>{activeTasks.length}</div>
                    <div className="meta-text">Active Tasks</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-success-600)' }}>{completedTasks.length}</div>
                    <div className="meta-text">Completed</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-muted)' }}>{myWorkload.capacity || 10}</div>
                    <div className="meta-text">Task Limit</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {utilization > 100
                    ? '⚠️ You have exceeded standard team capacity. Speak with your team lead to reassign low-priority tasks.'
                    : utilization > 80
                    ? '⚡ You are near maximum capacity. Focus on high-priority deliverables first.'
                    : '✅ Your current workload is well balanced with good bandwidth for upcoming sprints.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority task queue */}
        <div className="card">
          <div className="card-header"><span className="section-title">My Priority Queue</span></div>
          <div style={{ padding: '0 20px' }}>
            {sortedTasks.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.title}</div>
                  <div className="meta-text">Due {t.deadline} · {t.project || 'Project'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{t.progress || 0}%</span>
                  <span className={`badge badge-${t.priority === 'critical' || t.priority === 'high' ? 'danger' : 'info'}`} style={{ textTransform: 'capitalize' }}>
                    {t.priority}
                  </span>
                </div>
              </div>
            ))}
            {sortedTasks.length === 0 && (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No active tasks in your queue.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
