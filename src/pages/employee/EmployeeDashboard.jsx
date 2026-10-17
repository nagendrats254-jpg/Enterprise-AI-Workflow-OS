import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, ProgressBar, Avatar } from '../../components/ui/Components';
import { StatusBadge, PriorityBadge, RiskChip, DelayChip } from '../../components/ui/Components';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, tasksApi } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import { DEMO_TASKS, DEMO_PROJECTS } from '../../data/demoData';

function MyTaskCard({ task, onStatusChange, onProgressChange }) {
  const [status, setStatus] = useState(task.status);
  const [progress, setProgress] = useState(task.progress || 0);

  const isOverdue = new Date(task.deadline) < new Date() && status !== 'completed';
  const isDueSoon = !isOverdue && new Date(task.deadline) - new Date() < 3 * 24 * 60 * 60 * 1000;

  async function handleStatus(newStatus) {
    setStatus(newStatus);
    if (onStatusChange) onStatusChange(task.id, newStatus);
  }

  async function handleProgress(newProgress) {
    setProgress(newProgress);
    if (onProgressChange) onProgressChange(task.id, newProgress);
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '14px 18px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.4, color: 'var(--color-text-primary)' }}>{task.title}</h3>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="meta-text" style={{ marginBottom: 10 }}>{task.project}</div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <StatusBadge status={status} />
          {isOverdue && <span className="badge badge-danger"><span className="badge-dot" />Overdue</span>}
          {isDueSoon && !isOverdue && <span className="badge badge-warning"><span className="badge-dot" />Due soon</span>}
          <RiskChip level={task.risk_level} />
        </div>

        {/* Progress control */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{progress}%</span>
          </div>
          <input
            type="range"
            min={0} max={100} step={5}
            value={progress}
            onChange={e => handleProgress(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-violet-500)', height: 4 }}
            aria-label={`Progress for ${task.title}`}
          />
        </div>
      </div>
      <div style={{
        borderTop: '1px solid var(--color-border-light)',
        padding: '9px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-surface-dim)', borderRadius: '0 0 10px 10px',
      }}>
        <span className="meta-text">Due {task.deadline}</span>
        <select
          className="form-input form-select"
          style={{ height: 26, padding: '0 26px 0 8px', fontSize: 12, width: 130 }}
          value={status}
          onChange={e => handleStatus(e.target.value)}
          aria-label={`Update status for ${task.title}`}
        >
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { data: dashData, loading, refetch } = useApi(dashboardApi.employeeOverview);
  const { mutate: updateStatus } = useMutation(tasksApi.updateStatus);
  const { mutate: updateProgress } = useMutation(tasksApi.updateProgress);

  const isLive = !!dashData?.stats;
  const stats = dashData?.stats;
  const myTasks = dashData?.upcomingTasks || DEMO_TASKS.slice(0, 4);
  const projects = dashData?.projects || DEMO_PROJECTS.slice(0, 3);

  const totalTasks = stats?.totalTasks ?? myTasks.length;
  const activeTasks = stats?.activeTasks ?? myTasks.filter(t => t.status !== 'completed').length;
  const completedTasks = stats?.completedTasks ?? 0;
  const utilization = stats?.utilization ?? 70;

  async function handleTaskStatus(id, newStatus) {
    try {
      await updateStatus(id, newStatus);
      await refetch();
    } catch (err) {
      console.error('Status update failed:', err.message);
    }
  }

  async function handleTaskProgress(id, newProgress) {
    try {
      await updateProgress(id, newProgress);
      await refetch();
    } catch (err) {
      console.error('Progress update failed:', err.message);
    }
  }

  return (
    <AppShell pageTitle="Employee Dashboard">
      <div style={{ maxWidth: 1200 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">My Dashboard</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB
              </span>
            ) : loading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Team Member'}. Here are your tasks and current commitments.
          </p>
        </div>

        {!isLive && !loading && <DemoBanner />}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Active Tasks</span>
            <span className="kpi-value">{loading ? '…' : activeTasks}</span>
            <span className="kpi-trend neutral">Of {totalTasks} assigned</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Completed</span>
            <span className="kpi-value" style={{ color: 'var(--color-success-600)' }}>{loading ? '…' : completedTasks}</span>
            <span className="kpi-trend up">All-time</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Capacity Utilization</span>
            <span className="kpi-value" style={{ color: utilization > 100 ? 'var(--color-danger-600)' : 'var(--color-text-primary)' }}>
              {loading ? '…' : `${utilization}%`}
            </span>
            <span className={`kpi-trend ${utilization > 100 ? 'down' : 'neutral'}`}>
              {stats?.capacityStatus || 'Normal load'}
            </span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">My Projects</span>
            <span className="kpi-value">{loading ? '…' : projects.length}</span>
            <span className="kpi-trend neutral">Active teams</span>
          </div>
        </div>

        {/* Task cards */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>My Active Tasks</h2>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Adjust sliders or status to update live</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {myTasks.map(task => (
              <MyTaskCard
                key={task.id}
                task={task}
                onStatusChange={handleTaskStatus}
                onProgressChange={handleTaskProgress}
              />
            ))}
            {myTasks.length === 0 && (
              <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                No active tasks assigned to you right now. Great job!
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
