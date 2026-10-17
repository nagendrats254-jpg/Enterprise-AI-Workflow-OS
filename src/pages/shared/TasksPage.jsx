import { useState, useMemo } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, Modal, FormGroup, Input, Select, Textarea } from '../../components/ui/Components';
import { StatusBadge, PriorityBadge, RiskChip, DelayChip } from '../../components/ui/Components';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '../../components/ui/Icons';
import { tasksApi, projectsApi, usersApi } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import { DEMO_TASKS, DEMO_PROJECTS, DEMO_USERS } from '../../data/demoData';

export default function TasksPage({ role = 'admin' }) {
  // Fetch tasks based on user role
  const fetchTasksFn = role === 'employee' ? tasksApi.myTasks : tasksApi.list;
  const { data: liveData, loading: tasksLoading, refetch: refetchTasks } = useApi(fetchTasksFn);
  const { data: projectsData } = useApi(projectsApi.list);
  const { data: usersData } = useApi(usersApi.list);

  // Mutations
  const { mutate: createTask } = useMutation(tasksApi.create);
  const { mutate: updateTask } = useMutation(tasksApi.update);
  const { mutate: deleteTask } = useMutation(tasksApi.remove);
  const { mutate: patchStatus } = useMutation(tasksApi.updateStatus);

  const isLive = !!liveData?.tasks;
  const tasks = liveData?.tasks || DEMO_TASKS;
  const projects = projectsData?.projects || DEMO_PROJECTS;
  const users = usersData?.users || DEMO_USERS;
  const employees = users.filter(u => u.role === 'employee' || u.role === 'manager');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    project: '',
    project_id: '',
    assigned: '',
    assigned_to: '',
    priority: 'medium',
    status: 'not_started',
    deadline: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const q = search.toLowerCase();
      const matchSearch =
        (t.title || '').toLowerCase().includes(q) ||
        (t.project || '').toLowerCase().includes(q) ||
        (t.assigned || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Task title is required.';
    if (!form.project_id && !form.project) e.project = 'Project is required.';
    if (!form.deadline) e.deadline = 'Deadline is required.';
    return e;
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      // Find selected project
      const selectedProj = projects.find(
        p => String(p.id) === String(form.project_id) || p.name === form.project
      );
      const projId = selectedProj ? selectedProj.id : (projects[0]?.id || 1);

      // Find assigned user ID
      const assignedUser = employees.find(
        u => String(u.id) === String(form.assigned_to) || u.name === form.assigned
      );
      const assigneeId = assignedUser ? assignedUser.id : null;

      if (editTask) {
        await updateTask(editTask.id, {
          title: form.title,
          project_id: projId,
          priority: form.priority,
          status: form.status,
          deadline: form.deadline,
          description: form.description,
          assigned_to: assigneeId,
        });
      } else {
        await createTask({
          title: form.title,
          project_id: projId,
          priority: form.priority,
          status: form.status,
          deadline: form.deadline,
          description: form.description,
          assigned_to: assigneeId,
        });
      }

      await refetchTasks();
      setShowAdd(false);
      setEditTask(null);
      setForm({
        title: '',
        project: '',
        project_id: '',
        assigned: '',
        assigned_to: '',
        priority: 'medium',
        status: 'not_started',
        deadline: '',
        description: '',
      });
      setErrors({});
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(taskId, newStatus) {
    try {
      await patchStatus(taskId, newStatus);
      await refetchTasks();
    } catch (err) {
      console.error('Failed to update status:', err.message);
    }
  }

  const openEdit = task => {
    setForm({
      title: task.title,
      project: task.project,
      project_id: task.project_id || '',
      assigned: task.assigned,
      assigned_to: task.assigned_to || '',
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      description: task.description || '',
    });
    setEditTask(task);
    setShowAdd(true);
  };

  const handleDelete = async task => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      try {
        await deleteTask(task.id);
        await refetchTasks();
      } catch (err) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  return (
    <AppShell pageTitle="Tasks">
      <div style={{ maxWidth: 1300 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title">Tasks</h1>
              {isLive ? (
                <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  ● Live DB
                </span>
              ) : tasksLoading ? (
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Loading...</span>
              ) : null}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              {filtered.length} of {tasks.length} tasks shown.
            </p>
          </div>
          {role !== 'employee' && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditTask(null);
                setForm({
                  title: '',
                  project: projects[0]?.name || '',
                  project_id: projects[0]?.id || '',
                  assigned: '',
                  assigned_to: '',
                  priority: 'medium',
                  status: 'not_started',
                  deadline: '',
                  description: '',
                });
                setShowAdd(true);
              }}
            >
              <IconPlus style={{ width: 14, height: 14 }} /> New Task
            </button>
          )}
        </div>

        {!isLive && !tasksLoading && <DemoBanner />}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="topbar-search" style={{ flex: 1, maxWidth: 300 }}>
            <IconSearch style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
            <input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select style={{ width: 150, height: 34, fontSize: 13 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </Select>
          <Select style={{ width: 150, height: 34, fontSize: 13 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 240 }}>Task</th>
                  <th>Project</th>
                  <th>Assigned</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Risk</th>
                  <th>Delay</th>
                  {role !== 'employee' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                      No tasks match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(task => (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-text-primary)' }}>{task.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>Progress: {task.progress}%</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{task.project}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13 }}>{task.assigned || 'Unassigned'}</span>
                      </td>
                      <td>
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td>
                        {role !== 'employee' ? (
                          <select
                            className="form-input form-select"
                            style={{ height: 28, padding: '0 28px 0 8px', fontSize: 12, width: 120 }}
                            value={task.status}
                            onChange={e => handleStatusChange(task.id, e.target.value)}
                            aria-label={`Status for ${task.title}`}
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                          </select>
                        ) : (
                          <StatusBadge status={task.status} />
                        )}
                      </td>
                      <td>
                        <span className="meta-text">{task.deadline}</span>
                      </td>
                      <td>
                        <RiskChip level={task.risk_level} />
                      </td>
                      <td>
                        <DelayChip probability={task.delay_prob} />
                      </td>
                      {role !== 'employee' && (
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(task)} aria-label={`Edit ${task.title}`}>
                              <IconEdit style={{ width: 13, height: 13 }} />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => handleDelete(task)}
                              style={{ color: 'var(--color-danger-500)' }}
                              aria-label={`Delete ${task.title}`}
                            >
                              <IconTrash style={{ width: 13, height: 13 }} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={showAdd}
        onClose={() => {
          setShowAdd(false);
          setEditTask(null);
          setErrors({});
        }}
        title={editTask ? 'Edit Task' : 'New Task'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FormGroup label="Task Title" required error={errors.title}>
              <Input
                placeholder="Describe the task..."
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                error={errors.title}
              />
            </FormGroup>
          </div>
          <FormGroup label="Project" required error={errors.project}>
            <Select
              value={form.project_id}
              onChange={e => {
                const p = projects.find(proj => String(proj.id) === e.target.value);
                setForm(prev => ({ ...prev, project_id: e.target.value, project: p?.name || '' }));
              }}
              error={errors.project}
            >
              <option value="">Select project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Assign To">
            <Select
              value={form.assigned_to}
              onChange={e => {
                const u = employees.find(emp => String(emp.id) === e.target.value);
                setForm(prev => ({ ...prev, assigned_to: e.target.value, assigned: u?.name || '' }));
              }}
            >
              <option value="">Unassigned</option>
              {employees.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.department})
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Priority">
            <Select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </FormGroup>
          <FormGroup label="Status">
            <Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </Select>
          </FormGroup>
          <FormGroup label="Deadline" required error={errors.deadline}>
            <Input
              type="date"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              error={errors.deadline}
            />
          </FormGroup>
          <div style={{ gridColumn: '1/-1' }}>
            <FormGroup label="Description">
              <Textarea
                placeholder="Additional context, requirements, or notes..."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ minHeight: 80 }}
              />
            </FormGroup>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
