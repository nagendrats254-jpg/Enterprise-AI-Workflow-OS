import { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, Avatar, FormGroup, Input } from '../../components/ui/Components';
import { useAuth } from '../../context/AuthContext';
import { usersApi, tasksApi } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import { DEMO_TASKS } from '../../data/demoData';

const SKILLS_OPTIONS = [
  'React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX Design',
  'Data Analysis', 'DevOps', 'QA Testing', 'Project Management', 'SQL',
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: myTasksData } = useApi(tasksApi.myTasks);
  const { mutate: updateUser } = useMutation(usersApi.update);

  const [form, setForm] = useState({
    name: user?.name || 'Alex Torres',
    email: user?.email || 'alex@enterprise.ai',
    role: user?.role || 'employee',
    department: user?.department || 'Engineering',
    phone: '+1 (555) 234-5678',
    bio: 'Full-stack engineer focused on backend systems and API design. Passionate about clean code and automation.',
    skills: ['React', 'Node.js', 'Python', 'SQL'],
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.role || prev.role,
        department: user.department || prev.department,
      }));
    }
  }, [user]);

  const tasks = myTasksData?.tasks || DEMO_TASKS.slice(0, 6);
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateUser(user.id, {
        name: form.name,
        email: form.email,
        department: form.department,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  function toggleSkill(skill) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  }

  const roleLabel = { admin: 'Administrator', manager: 'Manager', employee: 'Employee' }[form.role] || 'Employee';

  return (
    <AppShell pageTitle="Profile">
      <div style={{ maxWidth: 860 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title">My Profile</h1>
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                ● Live DB Account
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Manage your personal information, department details, and skill sets.
            </p>
          </div>
          {!editing ? (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profile</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {saved && (
          <div style={{
            padding: '12px 16px', marginBottom: 20,
            background: 'var(--color-success-100)', border: '1px solid #86efac',
            borderRadius: 8, color: 'var(--color-success-700)', fontSize: 13, fontWeight: 600,
          }}>
            ✓ Profile changes saved to database!
          </div>
        )}

        {/* Profile Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
              <Avatar name={form.name} size={64} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>{form.name}</h2>
                  <span className="badge badge-info">{roleLabel}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  {form.department} · {form.email}
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {form.bio}
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
              padding: '16px 20px', background: 'var(--color-surface-dim)',
              borderRadius: 8, marginBottom: 24,
            }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>{tasks.length}</div>
                <div className="meta-text">Total Tasks</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-success-600)' }}>{completed}</div>
                <div className="meta-text">Completed</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-warning-600)' }}>{inProgress}</div>
                <div className="meta-text">In Progress</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-violet-600)' }}>{completionRate}%</div>
                <div className="meta-text">Completion Rate</div>
              </div>
            </div>

            {/* Edit form or view */}
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormGroup label="Full Name" required>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </FormGroup>
                <FormGroup label="Email" required>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </FormGroup>
                <FormGroup label="Department">
                  <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                </FormGroup>
                <FormGroup label="Phone">
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </FormGroup>
                <div style={{ gridColumn: '1/-1' }}>
                  <FormGroup label="Bio">
                    <Input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                  </FormGroup>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Skills Card */}
        <div className="card">
          <div className="card-header"><span className="section-title">Skills & Competencies</span></div>
          <div className="card-body" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SKILLS_OPTIONS.map(skill => {
                const active = form.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => editing && toggleSkill(skill)}
                    style={{
                      padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                      border: active ? '1px solid var(--color-violet-500)' : '1px solid var(--color-border)',
                      background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                      color: active ? 'var(--color-violet-700)' : 'var(--color-text-muted)',
                      cursor: editing ? 'pointer' : 'default',
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
