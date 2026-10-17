import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, ProgressBar } from '../../components/ui/Components';
import { projectsApi, tasksApi } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { DEMO_PROJECTS, DEMO_TASKS } from '../../data/demoData';

export default function EmployeeProjectsPage() {
  const { data: projData, loading: pLoading } = useApi(projectsApi.list);
  const { data: tasksData } = useApi(tasksApi.myTasks);

  const isLive = !!projData?.projects;
  const myProjects = projData?.projects || DEMO_PROJECTS.slice(0, 4);
  const myTasks = tasksData?.tasks || DEMO_TASKS;

  return (
    <AppShell pageTitle="My Projects">
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-title">My Projects</h1>
            {isLive ? (
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB
              </span>
            ) : pLoading ? (
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Projects you are currently contributing to.
          </p>
        </div>

        {!isLive && !pLoading && <DemoBanner />}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {myProjects.map(project => {
            const projectTasks = myTasks.filter(t => t.project_id === project.id || t.project === project.name);
            const doneTasks    = projectTasks.filter(t => t.status === 'completed').length;

            const statusColor = {
              active: { bg: 'var(--color-success-100)', color: 'var(--color-success-700)' },
              planning: { bg: 'var(--color-info-100)', color: 'var(--color-info-700)' },
              delayed: { bg: 'var(--color-danger-100)', color: 'var(--color-danger-700)' },
            }[project.status] || { bg: 'var(--color-slate-100)', color: 'var(--color-slate-600)' };

            return (
              <div key={project.id} className="card" style={{ padding: 0 }}>
                <div style={{ padding: '18px 20px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        {project.name}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: statusColor.bg, color: statusColor.color, textTransform: 'capitalize' }}>
                        {project.status}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                        {project.progress || 0}%
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>complete</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: 14 }}>
                    <ProgressBar value={project.progress || 0} />
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>My Tasks</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{doneTasks}/{projectTasks.length} done</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Deadline</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{project.deadline}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Department</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{project.department}</div>
                    </div>
                  </div>

                  {/* Task list preview */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      Recent Tasks
                    </div>
                    {projectTasks.slice(0, 3).map(t => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: 12 }}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{t.title}</span>
                        <span style={{ fontSize: 11, color: t.status === 'completed' ? 'var(--color-success-600)' : 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                    {projectTasks.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No tasks assigned in this project yet.</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {myProjects.length === 0 && (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No projects assigned to you yet.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
