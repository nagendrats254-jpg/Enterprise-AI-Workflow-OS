import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, Badge, ProgressBar, Avatar } from '../../components/ui/Components';
import { StatusBadge, PriorityBadge } from '../../components/ui/Components';
import { IconTrendUp, IconTrendDown, IconPlus, IconUsers, IconFolders, IconTasks, IconBuilding } from '../../components/ui/Icons';
import { dashboardApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import {
  DEMO_USERS, DEMO_DEPARTMENTS, DEMO_PROJECTS, DEMO_TASKS,
  DEMO_AUDIT_LOGS,
} from '../../data/demoData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function KPICard({ label, value, trend, trendLabel, icon, accent }) {
  const up = trend === 'up';
  const down = trend === 'down';
  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span className="kpi-label">{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: accent || 'var(--color-violet-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-violet-500)',
        }}>
          {icon}
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      {trendLabel && (
        <div className={`kpi-trend ${up ? 'up' : down ? 'down' : 'neutral'}`}>
          {up && <IconTrendUp style={{ width: 12, height: 12 }} />}
          {down && <IconTrendDown style={{ width: 12, height: 12 }} />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

function QuickAction({ label, onClick, icon }) {
  return (
    <button
      className="btn btn-secondary"
      onClick={onClick}
      style={{ justifyContent: 'flex-start', gap: 8, width: '100%' }}
    >
      <span style={{ color: 'var(--color-violet-500)' }}>{icon}</span>
      {label}
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: liveData, loading, error } = useApi(dashboardApi.adminOverview);

  // Merge live stats with demo fallbacks
  const stats   = liveData?.stats   || null;
  const activity= liveData?.recentActivity || DEMO_AUDIT_LOGS;
  const riskItems= liveData?.riskItems   || [];

  const totalUsers    = stats?.totalUsers    ?? DEMO_USERS.length;
  const activeUsers   = stats?.activeUsers   ?? DEMO_USERS.filter(u => u.status === 'active').length;
  const totalProjects = stats?.totalProjects ?? DEMO_PROJECTS.length;
  const activeProjecs = stats?.activeProjects?? DEMO_PROJECTS.filter(p => p.status === 'active').length;
  const deptCount     = stats?.departments   ?? DEMO_DEPARTMENTS.length;
  const totalTasks    = stats?.totalTasks    ?? DEMO_TASKS.length;
  const completedTasks= stats?.completedTasks?? DEMO_TASKS.filter(t => t.status === 'completed').length;
  const delayedTasks  = stats?.delayedTasks  ?? DEMO_TASKS.filter(t => t.status === 'delayed').length;
  const atRisk        = stats?.atRiskTasks   ?? DEMO_TASKS.filter(t => t.delay_prob > 0.5).length;
  const notStarted    = DEMO_TASKS.filter(t => t.status === 'not_started').length;
  const inProgress    = DEMO_TASKS.filter(t => t.status === 'in_progress').length;

  const tasksByStatus = { not_started: notStarted, in_progress: inProgress, completed: completedTasks, delayed: delayedTasks };
  const isLive = !!stats;

  return (
    <AppShell pageTitle="Dashboard">
      <div style={{ maxWidth: 1400 }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 className="page-title">Organization Overview</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>● Live</span>
            ) : loading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Connecting…</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Good morning, {user?.name?.split(' ')[0] || 'Admin'}. Here is the current state of your organization.
          </p>
        </div>

        {!isLive && !loading && <DemoBanner />}

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="kpi-grid">
          <KPICard
            label="Total Users"
            value={loading ? '…' : totalUsers}
            trend="up"
            trendLabel={`${activeUsers} active`}
            icon={<IconUsers style={{ width: 16, height: 16 }} />}
          />
          <KPICard
            label="Departments"
            value={loading ? '…' : deptCount}
            trend="neutral"
            trendLabel="Across the org"
            icon={<IconBuilding style={{ width: 16, height: 16 }} />}
            accent="var(--color-info-100)"
          />
          <KPICard
            label="Active Projects"
            value={loading ? '…' : activeProjecs}
            trend="up"
            trendLabel={`${totalProjects} total`}
            icon={<IconFolders style={{ width: 16, height: 16 }} />}
            accent="var(--color-success-100)"
          />
          <KPICard
            label="Total Tasks"
            value={loading ? '…' : totalTasks}
            trend={delayedTasks > 2 ? 'down' : 'up'}
            trendLabel={`${delayedTasks} delayed`}
            icon={<IconTasks style={{ width: 16, height: 16 }} />}
            accent={delayedTasks > 2 ? 'var(--color-danger-100)' : 'var(--color-warning-100)'}
          />
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 20 }}>

          {/* Task Status Overview */}
          <div className="card">
            <div className="card-header">
              <span className="section-title">Task Status Distribution</span>
            </div>
            <div className="card-body" style={{ padding: '16px 20px' }}>
              {[
                { key: 'not_started', label: 'Not Started', color: 'var(--color-slate-300)' },
                { key: 'in_progress', label: 'In Progress',  color: 'var(--color-info-500)'  },
                { key: 'completed',   label: 'Completed',    color: 'var(--color-success-500)'},
                { key: 'delayed',     label: 'Delayed',      color: 'var(--color-danger-500)' },
              ].map(s => {
                const count = tasksByStatus[s.key] || 0;
                const pct   = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={s.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {count} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="section-title">Active Projects</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/projects')}>View all</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {DEMO_PROJECTS.filter(p => p.status === 'active').slice(0, 4).map(project => (
                <div key={project.id} style={{
                  padding: '10px 20px',
                  borderBottom: '1px solid var(--color-border-light)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{project.name}</span>
                    <span className={`badge badge-${project.risk === 'high' ? 'danger' : project.risk === 'medium' ? 'warning' : 'success'}`} style={{ fontSize: 10 }}>
                      {project.risk} risk
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}><ProgressBar value={project.progress} /></div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: 32 }}>{project.progress}%</span>
                  </div>
                  <span className="meta-text">{project.department} · Due {project.deadline}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <span className="section-title">Quick Actions</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <QuickAction label="Add User"       icon={<IconPlus style={{ width: 14, height: 14 }} />} onClick={() => navigate('/admin/organization')} />
                <QuickAction label="Add Department" icon={<IconPlus style={{ width: 14, height: 14 }} />} onClick={() => navigate('/admin/organization')} />
                <QuickAction label="View Projects"  icon={<IconFolders style={{ width: 14, height: 14 }} />} onClick={() => navigate('/admin/projects')} />
                <QuickAction label="Audit Logs"     icon={<IconBuilding style={{ width: 14, height: 14 }} />} onClick={() => navigate('/admin/audit')} />
              </div>
            </div>

            {/* Department summary */}
            <div className="card">
              <div className="card-header">
                <span className="section-title">Departments</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {DEMO_DEPARTMENTS.map(dept => (
                  <div key={dept.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 18px', borderBottom: '1px solid var(--color-border-light)',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{dept.name}</div>
                      <div className="meta-text">{dept.employees} members</div>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--color-violet-600)',
                      background: 'var(--color-violet-50)', padding: '2px 8px', borderRadius: 4,
                    }}>{dept.projects} projects</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="section-title">Recent Activity</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/audit')}>View audit log</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {activity.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={log.user} size={24} />
                        <span style={{ fontSize: 13 }}>{log.user}</span>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{log.action}</span></td>
                    <td><span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{log.resource}</span></td>
                    <td><span className="meta-text">{log.timestamp}</span></td>
                    <td><code style={{ fontSize: 11, background: 'var(--color-surface-dim)', padding: '2px 6px', borderRadius: 3 }}>{log.ip}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
