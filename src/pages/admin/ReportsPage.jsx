import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner } from '../../components/ui/Components';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { analyticsApi, tasksApi, projectsApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_ANALYTICS, DEMO_TASKS, DEMO_PROJECTS, DEMO_WORKLOAD } from '../../data/demoData';

const VIOLET = '#7c3aed';
const DANGER  = '#ef4444';
const SUCCESS = '#22c55e';
const WARNING = '#f59e0b';
const INFO    = '#3b82f6';

const PIE_COLORS = [SUCCESS, INFO, DANGER, WARNING];

function SectionCard({ title, children, action }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="section-title">{title}</span>
        {action}
      </div>
      <div className="card-body" style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--color-border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [range, setRange] = useState('6m');

  const { data: overviewData, loading: oLoading } = useApi(analyticsApi.overview);
  const { data: tasksAnalytics } = useApi(analyticsApi.tasks);
  const { data: workloadAnalytics } = useApi(analyticsApi.workload);
  const { data: projectsData } = useApi(projectsApi.list);
  const { data: tasksData } = useApi(tasksApi.list);

  const isLive = !!overviewData?.analytics;
  const tasks = tasksData?.tasks || DEMO_TASKS;
  const projects = projectsData?.projects || DEMO_PROJECTS;

  const tasksByStatus = [
    { name: 'Not Started', value: tasks.filter(t => t.status === 'not_started').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Completed',   value: tasks.filter(t => t.status === 'completed').length },
    { name: 'Delayed',     value: tasks.filter(t => t.status === 'delayed').length },
  ];

  const completionRate = tasks.length
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
    : 0;

  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length)
    : 0;

  const trendData = tasksAnalytics?.analytics?.trend || DEMO_ANALYTICS.taskCompletion;
  const wlTrend = workloadAnalytics?.analytics?.workloadTrend || DEMO_ANALYTICS.workloadTrend;

  return (
    <AppShell pageTitle="Reports">
      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title">Reports & Analytics</h1>
              {isLive ? (
                <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  ● Live DB
                </span>
              ) : oLoading ? (
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
              ) : null}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Organization performance overview and trend analysis calculated from PostgreSQL.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['1m', '3m', '6m'].map(r => (
              <button
                key={r}
                className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {!isLive && !oLoading && <DemoBanner message="Charts are generated from demo data. Live metrics stream from PostgreSQL." />}

        {/* KPI summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }} className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Task Completion Rate</span>
            <span className="kpi-value" style={{ color: completionRate > 70 ? 'var(--color-success-600)' : 'var(--color-warning-600)' }}>
              {oLoading ? '…' : `${completionRate}%`}
            </span>
            <span className="kpi-trend up">of all {tasks.length} tasks</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Avg. Project Progress</span>
            <span className="kpi-value">{oLoading ? '…' : `${avgProgress}%`}</span>
            <span className="kpi-trend neutral">across {projects.length} projects</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Active Projects</span>
            <span className="kpi-value" style={{ color: 'var(--color-violet-600)' }}>
              {oLoading ? '…' : projects.filter(p => p.status === 'active').length}
            </span>
            <span className="kpi-trend neutral">In delivery</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Delayed Tasks</span>
            <span className="kpi-value" style={{ color: 'var(--color-danger-600)' }}>
              {oLoading ? '…' : tasks.filter(t => t.status === 'delayed').length}
            </span>
            <span className="kpi-trend down">Need attention</span>
          </div>
        </div>

        {/* Task Completion Trend */}
        <SectionCard title="Task Completion vs Delays (Monthly)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="completed" name="Completed" fill={VIOLET} radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayed"   name="Delayed"   fill={DANGER}  radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Workload Trend */}
          <SectionCard title="Team Workload Trend (Last 4 Weeks)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={wlTrend}>
                <defs>
                  <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={VIOLET} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[60, 100]} unit="%" />
                <Tooltip content={<CustomTooltip />} formatter={(v) => `${v}%`} />
                <Area
                  type="monotone" dataKey="avg" name="Avg Utilization"
                  stroke={VIOLET} strokeWidth={2}
                  fill="url(#wlGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Risk Trend */}
          <SectionCard title="Risk Distribution by Month">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={DEMO_ANALYTICS.riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="high"   name="High"   stroke={DANGER}  strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="medium" name="Medium" stroke={WARNING} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="low"    name="Low"    stroke={SUCCESS} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Task Distribution Pie */}
          <SectionCard title="Task Status Distribution">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={tasksByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {tasksByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasksByStatus.map((s, i) => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] }} />
                      <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Project Health */}
          <SectionCard title="Project Health Overview">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.map(p => {
                const riskColor = { high: DANGER, medium: WARNING, low: SUCCESS }[p.risk] || SUCCESS;
                return (
                  <div key={p.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: riskColor, fontWeight: 600 }}>{p.risk || 'low'} risk</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{p.progress || 0}%</span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${p.progress || 0}%`,
                        background: (p.progress || 0) >= 80 ? SUCCESS : (p.progress || 0) >= 50 ? VIOLET : WARNING,
                        borderRadius: 99, transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
