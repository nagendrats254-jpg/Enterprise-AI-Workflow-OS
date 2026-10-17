import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, ProgressBar, Avatar } from '../../components/ui/Components';
import { RiskChip, DelayChip, StatusBadge } from '../../components/ui/Components';
import { dashboardApi, workloadApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_TASKS, DEMO_PROJECTS, DEMO_WORKLOAD, DEMO_RISK_ITEMS } from '../../data/demoData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function KPI({ label, value, sub, color }) {
  return (
    <div className="kpi-card">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value" style={{ color: color || 'var(--color-text-primary)' }}>{value}</span>
      {sub && <span className="kpi-trend neutral">{sub}</span>}
    </div>
  );
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dashData, loading: dashLoading } = useApi(dashboardApi.managerOverview);
  const { data: workloadData } = useApi(workloadApi.org);

  const isLive = !!dashData?.stats;
  const stats = dashData?.stats;
  const teamWorkload = workloadData?.workload || DEMO_WORKLOAD;
  const recentTasks = dashData?.recentTasks || DEMO_TASKS.slice(0, 5);
  const projectSummary = dashData?.projectSummary || DEMO_PROJECTS;

  const activeTasks    = stats ? stats.totalTasks - stats.completedTasks : DEMO_TASKS.filter(t => t.status === 'in_progress').length;
  const delayedTasks   = stats ? stats.delayedTasks : DEMO_TASKS.filter(t => t.status === 'delayed').length;
  const activeProjects = stats ? stats.activeProjects : DEMO_PROJECTS.filter(p => p.status === 'active').length;
  const overloaded     = teamWorkload.filter(w => w.status === 'overloaded').length;
  const avgWorkload    = teamWorkload.length
    ? Math.round(teamWorkload.reduce((s, w) => s + (w.utilization || 0), 0) / teamWorkload.length)
    : 0;
  const highRisk       = stats ? stats.atRiskTasks : DEMO_RISK_ITEMS.filter(r => r.severity === 'critical' || r.severity === 'high').length;

  return (
    <AppShell pageTitle="Manager Dashboard">
      <div style={{ maxWidth: 1300 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">Team Dashboard</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB
              </span>
            ) : dashLoading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Good morning, {user?.name?.split(' ')[0] || 'Manager'}. Here is your team status for today.
          </p>
        </div>

        {!isLive && !dashLoading && <DemoBanner />}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="kpi-grid">
          <KPI
            label="Active Tasks"
            value={dashLoading ? '…' : activeTasks}
            sub={`${delayedTasks} delayed`}
            color={delayedTasks > 0 ? 'var(--color-danger-600)' : undefined}
          />
          <KPI
            label="Active Projects"
            value={dashLoading ? '…' : activeProjects}
            sub="Across your scope"
          />
          <KPI
            label="Avg. Workload"
            value={dashLoading ? '…' : `${avgWorkload}%`}
            sub={`${overloaded} overloaded`}
            color={overloaded > 0 ? 'var(--color-warning-600)' : undefined}
          />
          <KPI
            label="Risk Items"
            value={dashLoading ? '…' : highRisk}
            sub="Require attention"
            color={highRisk > 0 ? 'var(--color-danger-600)' : undefined}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Team Workload */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-title">Team Workload</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/manager/workload')}>View details</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {teamWorkload.slice(0, 5).map(member => (
                <div key={member.id || member.name} style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={member.name} size={28} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{member.name}</div>
                        <div className="meta-text">{member.department} · {member.tasks} tasks</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: member.utilization > 100 ? 'var(--color-danger-600)' : member.utilization > 80 ? 'var(--color-warning-600)' : 'var(--color-success-600)'
                    }}>
                      {member.utilization}%
                    </span>
                  </div>
                  <ProgressBar value={member.utilization} />
                </div>
              ))}
            </div>
          </div>

          {/* Project Summaries */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-title">Projects</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/manager/projects')}>View all</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {projectSummary.slice(0, 5).map(p => (
                <div key={p.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{p.progress || 0}%</span>
                  </div>
                  <ProgressBar value={p.progress || 0} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span className="meta-text">Due {p.deadline}</span>
                    <span className="meta-text" style={{ textTransform: 'capitalize' }}>Status: {p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority / Delayed tasks */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="section-title">Upcoming & Attention Needed</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/manager/tasks')}>View all tasks</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</div>
                      <div className="meta-text">{t.project}</div>
                    </td>
                    <td>{t.assigned || 'Unassigned'}</td>
                    <td><span style={{ textTransform: 'capitalize' }}>{t.priority}</span></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><span className="meta-text">{t.deadline}</span></td>
                    <td><DelayChip probability={t.delay_prob || 0.1} /></td>
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
