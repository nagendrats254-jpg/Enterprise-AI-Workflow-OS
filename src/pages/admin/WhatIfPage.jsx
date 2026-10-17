import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner } from '../../components/ui/Components';
import { projectsApi, workloadApi, tasksApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_TASKS, DEMO_PROJECTS, DEMO_WORKLOAD } from '../../data/demoData';

export default function WhatIfPage() {
  const { data: projectsData, loading: pLoading } = useApi(projectsApi.list);
  const { data: workloadData } = useApi(workloadApi.org);
  const { data: tasksData } = useApi(tasksApi.list);

  const isLive = !!projectsData?.projects;
  const projects = projectsData?.projects || DEMO_PROJECTS;
  const workload = workloadData?.workload || DEMO_WORKLOAD;
  const tasks = tasksData?.tasks || DEMO_TASKS;

  const [activeScenario, setActiveScenario] = useState('add_resource');
  const [params, setParams] = useState({
    department: 'Engineering',
    capacity: 10,
    project: projects[0]?.name || 'Platform Core v3',
    weeks: 2,
    tasks_moved: 3,
  });
  const [result, setResult] = useState(null);

  const avgUtil = workload.length
    ? Math.round(workload.reduce((s, w) => s + (w.utilization || 0), 0) / workload.length)
    : 70;
  const overloadedMembers = workload.filter(w => w.status === 'overloaded');
  const availableMembers = workload.filter(w => w.status === 'available');
  const delayedTasks = tasks.filter(t => t.status === 'delayed');

  function runSimulation(scenarioId) {
    if (scenarioId === 'add_resource') {
      const newUtil = Math.round((avgUtil * workload.length) / (workload.length + 1));
      setResult({
        before: { avgUtil: `${avgUtil}%`, overloaded: overloadedMembers.length, delayedTasks: delayedTasks.length },
        after:  { avgUtil: `${newUtil}%`, overloaded: Math.max(0, overloadedMembers.length - 1), delayedTasks: Math.max(0, delayedTasks.length - 1) },
        insight: `Adding 1 team member to ${params.department || 'Engineering'} reduces average utilization from ${avgUtil}% to ${newUtil}% and helps recover delayed deliverables.`,
      });
    } else if (scenarioId === 'extend_deadline') {
      const proj = projects.find(p => p.name === params.project) || projects[0];
      const weeks = Number(params.weeks) || 2;
      const riskDrop = Math.min(30, weeks * 7);
      setResult({
        before: { risk: proj?.risk || 'medium', progress: `${proj?.progress || 0}%`, deadline: proj?.deadline || 'Upcoming', delayProb: '75%' },
        after:  { risk: riskDrop > 15 ? 'low' : 'medium', progress: `${proj?.progress || 0}%`, deadline: `+${weeks} wks extension`, delayProb: `${Math.max(10, 75 - riskDrop)}%` },
        insight: `Extending "${proj?.name}" by ${weeks} week(s) reduces delay probability to ${Math.max(10, 75 - riskDrop)}% and lowers delivery risk.`,
      });
    } else if (scenarioId === 'redistribute_tasks') {
      const moved = Number(params.tasks_moved) || 3;
      const newOverloaded = Math.max(0, overloadedMembers.length - 1);
      setResult({
        before: { overloaded: overloadedMembers.length, available: availableMembers.length, avgUtil: `${avgUtil}%` },
        after:  { overloaded: newOverloaded, available: availableMembers.length, avgUtil: `${Math.max(40, avgUtil - 6)}%` },
        insight: `Reallocating ${moved} task(s) from overloaded members to available teammates balances the sprint and resolves bottleneck risk.`,
      });
    }
  }

  return (
    <AppShell pageTitle="What-If Simulation">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">What-If Simulation Engine</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB Context
              </span>
            ) : pLoading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Simulate operational adjustments using your live team capacity and project milestones.
          </p>
        </div>

        {!isLive && !pLoading && <DemoBanner />}

        {/* Scenario selector tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { id: 'add_resource', title: 'Add Capacity', desc: 'Simulate adding headcount to teams' },
            { id: 'extend_deadline', title: 'Extend Deadline', desc: 'Simulate milestone extensions on delivery risk' },
            { id: 'redistribute_tasks', title: 'Redistribute Workload', desc: 'Simulate task reallocation between members' },
          ].map(s => {
            const active = activeScenario === s.id;
            return (
              <div
                key={s.id}
                onClick={() => { setActiveScenario(s.id); setResult(null); }}
                className="card"
                style={{
                  cursor: 'pointer',
                  border: active ? '2px solid var(--color-violet-500)' : '1px solid var(--color-border)',
                  background: active ? 'rgba(124,58,237,0.04)' : 'var(--color-surface)',
                  padding: '16px 20px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: active ? 'var(--color-violet-700)' : 'var(--color-text-primary)', marginBottom: 4 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls & Output */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Controls */}
          <div className="card">
            <div className="card-header"><span className="section-title">Scenario Parameters</span></div>
            <div className="card-body" style={{ padding: '20px' }}>
              {activeScenario === 'add_resource' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Target Department</label>
                    <select
                      className="form-input form-select"
                      value={params.department}
                      onChange={e => setParams(p => ({ ...p, department: e.target.value }))}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="QA">QA</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Capacity (tasks/sprint)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={params.capacity}
                      onChange={e => setParams(p => ({ ...p, capacity: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {activeScenario === 'extend_deadline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Select Project</label>
                    <select
                      className="form-input form-select"
                      value={params.project}
                      onChange={e => setParams(p => ({ ...p, project: e.target.value }))}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Extension Duration (weeks)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={params.weeks}
                      onChange={e => setParams(p => ({ ...p, weeks: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {activeScenario === 'redistribute_tasks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Number of Tasks to Reallocate</label>
                    <input
                      className="form-input"
                      type="number"
                      min={1} max={10}
                      value={params.tasks_moved}
                      onChange={e => setParams(p => ({ ...p, tasks_moved: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={() => runSimulation(activeScenario)}
                style={{ width: '100%', marginTop: 20 }}
              >
                Run Simulation
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <div className="card-header"><span className="section-title">Predicted Impact</span></div>
            <div className="card-body" style={{ padding: '20px' }}>
              {result ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    <div style={{ padding: 14, background: 'var(--color-surface-dim)', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Current State</div>
                      {Object.entries(result.before).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                          <strong>{v}</strong>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 14, background: 'rgba(124,58,237,0.06)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.2)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-violet-700)', textTransform: 'uppercase', marginBottom: 8 }}>Simulated Result</div>
                      {Object.entries(result.after).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                          <strong style={{ color: 'var(--color-violet-700)' }}>{v}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    padding: '12px 16px', background: 'var(--color-success-100)',
                    borderRadius: 8, border: '1px solid #86efac', fontSize: 13,
                    color: 'var(--color-success-700)', lineHeight: 1.5,
                  }}>
                    💡 {result.insight}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                  Configure your parameters and click "Run Simulation" to model the outcome.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
