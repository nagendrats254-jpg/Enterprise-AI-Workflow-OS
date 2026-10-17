import { useState, useMemo } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, ProgressBar, Modal, FormGroup, Input, Select, Textarea } from '../../components/ui/Components';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '../../components/ui/Icons';
import { projectsApi, departmentsApi } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import { DEMO_PROJECTS, DEMO_DEPARTMENTS } from '../../data/demoData';

const statusColors = {
  active:   { bg: 'var(--color-success-100)', color: 'var(--color-success-600)' },
  planning: { bg: 'var(--color-info-100)',    color: 'var(--color-info-600)'    },
  delayed:  { bg: 'var(--color-danger-100)',  color: 'var(--color-danger-600)'  },
  completed:{ bg: 'var(--color-slate-100)',   color: 'var(--color-slate-500)'   },
};

function ProjectCard({ project, onEdit, onDelete }) {
  const sc = statusColors[project.status] || statusColors.planning;
  const riskBadge = {
    high:   { bg: 'var(--color-danger-100)',  color: 'var(--color-danger-600)'  },
    medium: { bg: 'var(--color-warning-100)', color: 'var(--color-warning-600)' },
    low:    { bg: 'var(--color-success-100)', color: 'var(--color-success-600)' },
  }[project.risk] || { bg: 'var(--color-slate-100)', color: 'var(--color-slate-600)' };

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '16px 18px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            {project.name}
          </h3>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(project)} aria-label={`Edit ${project.name}`}>
              <IconEdit style={{ width: 13, height: 13 }} />
            </button>
            {onDelete && (
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => onDelete(project)}
                style={{ color: 'var(--color-danger-500)' }}
                aria-label={`Delete ${project.name}`}
              >
                <IconTrash style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: sc.bg, color: sc.color, textTransform: 'capitalize' }}>
            {project.status}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: riskBadge.bg, color: riskBadge.color }}>
            {project.risk} risk
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1 }}><ProgressBar value={project.progress || 0} /></div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', minWidth: 30 }}>{project.progress || 0}%</span>
        </div>
      </div>
      <div style={{
        borderTop: '1px solid var(--color-border-light)',
        padding: '9px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-surface-dim)',
        borderRadius: '0 0 10px 10px',
      }}>
        <span className="meta-text">{project.department}</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <span className="meta-text">{project.tasks || 0} tasks</span>
          <span className="meta-text">Due {project.deadline}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { data: projectsData, loading: pLoading, refetch: refetchProjects } = useApi(projectsApi.list);
  const { data: deptsData } = useApi(departmentsApi.list);

  const { mutate: createProject } = useMutation(projectsApi.create);
  const { mutate: updateProject } = useMutation(projectsApi.update);
  const { mutate: deleteProject } = useMutation(projectsApi.remove);

  const isLive = !!projectsData?.projects;
  const projects = projectsData?.projects || DEMO_PROJECTS;
  const departments = deptsData?.departments || DEMO_DEPARTMENTS;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', deadline: '', status: 'planning', description: '' });
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch =
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.department || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Project name is required.';
    if (!form.department) e.department = 'Department is required.';
    if (!form.deadline) e.deadline = 'Deadline is required.';
    return e;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      if (editProject) {
        await updateProject(editProject.id, {
          name: form.name,
          department: form.department,
          deadline: form.deadline,
          status: form.status,
          description: form.description,
        });
      } else {
        await createProject({
          name: form.name,
          department: form.department,
          deadline: form.deadline,
          status: form.status,
          description: form.description,
        });
      }

      await refetchProjects();
      setShowAdd(false);
      setEditProject(null);
      setForm({ name: '', department: departments[0]?.name || '', deadline: '', status: 'planning', description: '' });
      setErrors({});
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const openEdit = (project) => {
    setForm({
      name: project.name,
      department: project.department,
      deadline: project.deadline,
      status: project.status,
      description: project.description || '',
    });
    setEditProject(project);
    setShowAdd(true);
  };

  const handleDelete = async (project) => {
    if (window.confirm(`Delete project "${project.name}" and its associated tasks?`)) {
      try {
        await deleteProject(project.id);
        await refetchProjects();
      } catch (err) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  return (
    <AppShell pageTitle="Projects">
      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title">Projects</h1>
              {isLive ? (
                <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  ● Live DB
                </span>
              ) : pLoading ? (
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
              ) : null}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {projects.length} total projects across all departments.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditProject(null);
              setForm({ name: '', department: departments[0]?.name || '', deadline: '', status: 'planning', description: '' });
              setShowAdd(true);
            }}
          >
            <IconPlus style={{ width: 14, height: 14 }} /> New Project
          </button>
        </div>

        {!isLive && !pLoading && <DemoBanner />}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div className="topbar-search" style={{ flex: 1, maxWidth: 280 }}>
            <IconSearch style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
            <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search projects" />
          </div>
          {['all', 'active', 'planning', 'delayed', 'completed'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(s)}
              style={{ textTransform: 'capitalize' }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} onEdit={openEdit} onDelete={handleDelete} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
              No projects match your filters.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditProject(null); setErrors({}); }}
        title={editProject ? 'Edit Project' : 'New Project'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Saving...' : editProject ? 'Save Changes' : 'Create Project'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormGroup label="Project Name" required error={errors.name}>
            <Input
              placeholder="e.g. Platform Migration Q4"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              error={errors.name}
            />
          </FormGroup>
          <FormGroup label="Department" required error={errors.department}>
            <Select
              value={form.department}
              onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
              error={errors.department}
            >
              <option value="">Select department...</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Status">
            <Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </Select>
          </FormGroup>
          <FormGroup label="Deadline" required error={errors.deadline}>
            <Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} error={errors.deadline} />
          </FormGroup>
          <FormGroup label="Description">
            <Textarea
              placeholder="Optional overview or objectives..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              style={{ minHeight: 70 }}
            />
          </FormGroup>
        </div>
      </Modal>
    </AppShell>
  );
}
