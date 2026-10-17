import { useState, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DemoBanner, Avatar, Modal, FormGroup, Input, Select, Tabs } from '../../components/ui/Components';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '../../components/ui/Icons';
import { usersApi, departmentsApi } from '../../services/api';
import { useApi, useMutation } from '../../hooks/useApi';
import { DEMO_USERS, DEMO_DEPARTMENTS } from '../../data/demoData';

function UserRow({ user, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user.name} size={30} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
            <div className="meta-text">{user.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 4,
          fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
          background: user.role === 'admin' ? 'var(--color-violet-100)' : user.role === 'manager' ? 'var(--color-info-100)' : 'var(--color-slate-100)',
          color: user.role === 'admin' ? 'var(--color-violet-700)' : user.role === 'manager' ? 'var(--color-info-600)' : 'var(--color-slate-500)',
        }}>{user.role}</span>
      </td>
      <td><span style={{ fontSize: 13 }}>{user.department}</span></td>
      <td>
        <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
          <span className="badge-dot" />{user.status}
        </span>
      </td>
      <td><span className="meta-text">{user.joined}</span></td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(user)} aria-label={`Edit ${user.name}`}>
            <IconEdit style={{ width: 13, height: 13 }} />
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onDelete(user)} aria-label={`Delete ${user.name}`}
            style={{ color: 'var(--color-danger-500)' }}>
            <IconTrash style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function DeptRow({ dept }) {
  return (
    <tr>
      <td style={{ fontWeight: 500, fontSize: 13 }}>{dept.name}</td>
      <td style={{ fontSize: 13 }}>{dept.head}</td>
      <td>
        <span style={{
          fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)',
        }}>{dept.employees}</span>
      </td>
      <td>
        <span style={{
          fontWeight: 600, fontSize: 14, color: 'var(--color-violet-600)',
        }}>{dept.projects}</span>
      </td>
      <td>
        <button className="btn btn-ghost btn-icon btn-sm">
          <IconEdit style={{ width: 13, height: 13 }} />
        </button>
      </td>
    </tr>
  );
}

export default function OrganizationPage() {
  const [tab, setTab] = useState('users');
  const [search, setSearch] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee', department: '' });
  const [errors, setErrors] = useState({});

  // Live data
  const { data: usersData,  loading: uLoading, refetch: refetchUsers } = useApi(usersApi.list);
  const { data: deptsData,  loading: dLoading, refetch: refetchDepts } = useApi(departmentsApi.list);
  const { mutate: createUser }   = useMutation(usersApi.create);
  const { mutate: deleteUser }   = useMutation(usersApi.remove);
  const { mutate: updateUser }   = useMutation(usersApi.update);

  const isLive = !!usersData;
  const users = usersData?.users  || DEMO_USERS;
  const depts = deptsData?.departments || DEMO_DEPARTMENTS;

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAddUser(e) {
    e.preventDefault();
    const errs = {};
    if (!newUser.name.trim()) errs.name = 'Name is required.';
    if (!newUser.email.trim()) errs.email = 'Email is required.';
    if (!newUser.department.trim()) errs.department = 'Department is required.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      if (editUser) {
        await updateUser(editUser.id, newUser);
      } else {
        await createUser({ ...newUser, password: 'password123' });
      }
      await refetchUsers();
    } catch (_) { /* fallback — just close */ }
    setShowAddUser(false);
    setNewUser({ name: '', email: '', role: 'employee', department: '' });
    setEditUser(null);
    setErrors({});
  }

  async function handleDeleteUser(userObj) {
    if (!window.confirm(`Delete ${userObj.name}?`)) return;
    try {
      await deleteUser(userObj.id);
      await refetchUsers();
    } catch (_) { /* ignore */ }
  }

  function handleEditUser(userObj) {
    setEditUser(userObj);
    setNewUser({ name: userObj.name, email: userObj.email, role: userObj.role, department: userObj.department });
    setShowAddUser(true);
  }

  return (
    <AppShell pageTitle="Organization">
      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Organization</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Manage users, employees, and departments.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddUser(true)}>
            <IconPlus style={{ width: 14, height: 14 }} /> Add User
          </button>
        </div>

        {!isLive && <DemoBanner />}

        <div className="card">
          <div className="card-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
            <Tabs
              tabs={[
                { id: 'users',       label: 'Users',       count: users.length },
                { id: 'departments', label: 'Departments',  count: depts.length },
              ]}
              active={tab}
              onChange={setTab}
            />
          </div>

          {tab === 'users' && (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border-light)' }}>
                <div className="topbar-search" style={{ maxWidth: 300 }}>
                  <IconSearch style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
                  <input
                    type="search"
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Search users"
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No users found.</td></tr>
                    ) : filtered.map(u => (
                      <UserRow key={u.id} user={u} onEdit={handleEditUser} onDelete={handleDeleteUser} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'departments' && (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Head</th>
                    <th>Members</th>
                    <th>Projects</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depts.map(d => <DeptRow key={d.id} dept={d} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        open={showAddUser}
        onClose={() => { setShowAddUser(false); setErrors({}); }}
        title="Add New User"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddUser}>Add User</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormGroup label="Full Name" required error={errors.name}>
            <Input
              placeholder="e.g. Jordan Smith"
              value={newUser.name}
              onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
              error={errors.name}
            />
          </FormGroup>
          <FormGroup label="Email Address" required error={errors.email}>
            <Input
              type="email"
              placeholder="user@enterprise.ai"
              value={newUser.email}
              onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
              error={errors.email}
            />
          </FormGroup>
          <FormGroup label="Role" required>
            <Select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </Select>
          </FormGroup>
          <FormGroup label="Department" required error={errors.department}>
            <Select value={newUser.department} onChange={e => setNewUser(p => ({ ...p, department: e.target.value }))} error={errors.department}>
              <option value="">Select department...</option>
              {DEMO_DEPARTMENTS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </Select>
          </FormGroup>
        </div>
      </Modal>
    </AppShell>
  );
}
