// In-memory data store — mirrors the frontend demo data exactly
// Replace with a real database (Supabase, Postgres, etc.) when ready

const bcrypt = require('bcryptjs');

// Pre-hashed passwords: admin123, manager123, employee123
const HASH_ADMIN    = bcrypt.hashSync('admin123',    10);
const HASH_MANAGER  = bcrypt.hashSync('manager123',  10);
const HASH_EMPLOYEE = bcrypt.hashSync('employee123', 10);

const store = {
  users: [
    { id: 1, name: 'Sarah Chen',    email: 'admin@enterprise.ai',    password: HASH_ADMIN,    role: 'admin',    department: 'Operations',  status: 'active',   joined: '2024-01-15' },
    { id: 2, name: 'James Okafor',  email: 'manager@enterprise.ai',  password: HASH_MANAGER,  role: 'manager',  department: 'Engineering', status: 'active',   joined: '2024-02-20' },
    { id: 3, name: 'Priya Nair',    email: 'priya@enterprise.ai',    password: HASH_MANAGER,  role: 'manager',  department: 'Product',     status: 'active',   joined: '2024-03-10' },
    { id: 4, name: 'Alex Torres',   email: 'employee@enterprise.ai', password: HASH_EMPLOYEE, role: 'employee', department: 'Engineering', status: 'active',   joined: '2024-04-05' },
    { id: 5, name: 'Mei Zhang',     email: 'mei@enterprise.ai',      password: HASH_EMPLOYEE, role: 'employee', department: 'Design',      status: 'active',   joined: '2024-04-12' },
    { id: 6, name: 'Ravi Kumar',    email: 'ravi@enterprise.ai',     password: HASH_EMPLOYEE, role: 'employee', department: 'Engineering', status: 'active',   joined: '2024-05-01' },
    { id: 7, name: 'Dana White',    email: 'dana@enterprise.ai',     password: HASH_EMPLOYEE, role: 'employee', department: 'QA',          status: 'inactive', joined: '2024-02-28' },
  ],

  departments: [
    { id: 1, name: 'Engineering', head: 'James Okafor', employees: 12, projects: 4 },
    { id: 2, name: 'Product',     head: 'Priya Nair',   employees: 6,  projects: 3 },
    { id: 3, name: 'Design',      head: 'Mei Zhang',    employees: 4,  projects: 2 },
    { id: 4, name: 'Operations',  head: 'Sarah Chen',   employees: 5,  projects: 2 },
    { id: 5, name: 'QA',          head: 'Dana White',   employees: 3,  projects: 3 },
  ],

  projects: [
    { id: 1, name: 'Platform Core v3',         department: 'Engineering', status: 'active',   progress: 68, deadline: '2026-12-31', tasks: 24, risk: 'medium', description: 'Core platform infrastructure upgrade', manager_id: 2 },
    { id: 2, name: 'Customer Portal Redesign', department: 'Product',     status: 'active',   progress: 45, deadline: '2026-11-15', tasks: 18, risk: 'low',    description: 'Full redesign of the customer-facing portal', manager_id: 3 },
    { id: 3, name: 'ML Pipeline Integration',  department: 'Engineering', status: 'active',   progress: 30, deadline: '2026-10-30', tasks: 16, risk: 'high',   description: 'Integrate machine learning pipeline into production', manager_id: 2 },
    { id: 4, name: 'Mobile App v2',            department: 'Design',      status: 'planning', progress: 10, deadline: '2027-02-28', tasks: 12, risk: 'low',    description: 'Second version of the mobile application', manager_id: 3 },
    { id: 5, name: 'Data Warehouse Migration', department: 'Operations',  status: 'delayed',  progress: 55, deadline: '2026-09-30', tasks: 20, risk: 'high',   description: 'Migrate data warehouse to new infrastructure', manager_id: 2 },
    { id: 6, name: 'Security Audit Suite',     department: 'QA',          status: 'active',   progress: 80, deadline: '2026-10-15', tasks: 8,  risk: 'low',    description: 'Comprehensive security audit toolchain', manager_id: 2 },
  ],

  tasks: [
    { id: 1, title: 'Implement JWT refresh token flow', project_id: 1, project: 'Platform Core v3',        assigned_to: 4, assigned: 'Alex Torres', priority: 'high',     status: 'in_progress', deadline: '2026-10-10', progress: 70,  risk_level: 'low',    delay_prob: 0.18, description: 'Add refresh token mechanism to JWT auth flow' },
    { id: 2, title: 'Design system token migration',    project_id: 2, project: 'Customer Portal Redesign', assigned_to: 5, assigned: 'Mei Zhang',   priority: 'medium',   status: 'in_progress', deadline: '2026-10-20', progress: 45,  risk_level: 'medium', delay_prob: 0.42, description: 'Migrate all design tokens to new system' },
    { id: 3, title: 'ML model training pipeline',       project_id: 3, project: 'ML Pipeline Integration',  assigned_to: 6, assigned: 'Ravi Kumar',  priority: 'critical', status: 'not_started', deadline: '2026-10-08', progress: 0,   risk_level: 'high',   delay_prob: 0.81, description: 'Set up automated model training pipeline' },
    { id: 4, title: 'API rate limiting middleware',     project_id: 1, project: 'Platform Core v3',        assigned_to: 4, assigned: 'Alex Torres', priority: 'medium',   status: 'completed',   deadline: '2026-09-30', progress: 100, risk_level: 'low',   delay_prob: 0.05, description: 'Implement rate limiting for all API endpoints' },
    { id: 5, title: 'Database index optimization',     project_id: 5, project: 'Data Warehouse Migration', assigned_to: 6, assigned: 'Ravi Kumar',  priority: 'high',     status: 'delayed',     deadline: '2026-09-28', progress: 55,  risk_level: 'high',   delay_prob: 0.92, description: 'Optimize database indexes for performance' },
    { id: 6, title: 'Accessibility audit pass 1',      project_id: 2, project: 'Customer Portal Redesign', assigned_to: 7, assigned: 'Dana White',  priority: 'medium',   status: 'in_progress', deadline: '2026-10-25', progress: 30,  risk_level: 'low',    delay_prob: 0.22, description: 'First pass accessibility audit of portal' },
    { id: 7, title: 'Mobile nav component',            project_id: 4, project: 'Mobile App v2',            assigned_to: 5, assigned: 'Mei Zhang',   priority: 'high',     status: 'not_started', deadline: '2026-11-10', progress: 0,   risk_level: 'low',    delay_prob: 0.15, description: 'Build mobile navigation component' },
    { id: 8, title: 'Load testing report',             project_id: 6, project: 'Security Audit Suite',     assigned_to: 7, assigned: 'Dana White',  priority: 'medium',   status: 'completed',   deadline: '2026-10-05', progress: 100, risk_level: 'low',   delay_prob: 0.08, description: 'Generate comprehensive load testing report' },
  ],

  chatChannels: [
    { id: 1, name: 'Engineering', members: 12, lastMessage: 'Build pipeline fixed', lastTime: '10:24 AM' },
    { id: 2, name: 'Product',     members: 6,  lastMessage: 'Review the new mockups', lastTime: '9:45 AM'  },
    { id: 3, name: 'General',     members: 30, lastMessage: 'Team lunch at 1pm', lastTime: '8:30 AM'   },
    { id: 4, name: 'QA Team',     members: 4,  lastMessage: 'Test report uploaded', lastTime: 'Yesterday' },
  ],

  chatMessages: {
    1: [
      { id: 1, sender: 'James Okafor', sender_id: 2, content: 'Good morning team. Standup in 10 minutes.',                      time: '9:00 AM', createdAt: new Date().toISOString() },
      { id: 2, sender: 'Alex Torres',  sender_id: 4, content: 'Ready. I will share the sprint status.',                         time: '9:02 AM', createdAt: new Date().toISOString() },
      { id: 3, sender: 'Ravi Kumar',   sender_id: 6, content: 'ML pipeline training finished overnight. Results look good.',    time: '9:15 AM', createdAt: new Date().toISOString() },
      { id: 4, sender: 'James Okafor', sender_id: 2, content: 'Great news Ravi. Lets review the metrics after standup.',        time: '9:16 AM', createdAt: new Date().toISOString() },
    ],
    2: [
      { id: 1, sender: 'Priya Nair',  sender_id: 3, content: 'New mockups are ready for review.',    time: '9:45 AM', createdAt: new Date().toISOString() },
    ],
    3: [
      { id: 1, sender: 'Sarah Chen',  sender_id: 1, content: 'Team lunch at 1pm today.', time: '8:30 AM', createdAt: new Date().toISOString() },
    ],
    4: [
      { id: 1, sender: 'Dana White', sender_id: 7, content: 'Test report has been uploaded to the shared drive.', time: 'Yesterday', createdAt: new Date().toISOString() },
    ],
  },

  auditLogs: [
    { id: 1, user: 'Sarah Chen',   user_id: 1, action: 'Created user',        resource: 'User: Ravi Kumar',          timestamp: '2026-10-02 08:12:44', ip: '192.168.1.5'  },
    { id: 2, user: 'James Okafor', user_id: 2, action: 'Created project',     resource: 'ML Pipeline Integration',   timestamp: '2026-10-02 09:00:11', ip: '192.168.1.8'  },
    { id: 3, user: 'Alex Torres',  user_id: 4, action: 'Updated task status', resource: 'Task: API rate limiting',   timestamp: '2026-10-02 09:44:02', ip: '192.168.1.12' },
    { id: 4, user: 'Ravi Kumar',   user_id: 6, action: 'Uploaded file',       resource: 'Project: ML Pipeline',      timestamp: '2026-10-02 10:05:33', ip: '192.168.1.14' },
    { id: 5, user: 'Sarah Chen',   user_id: 1, action: 'Exported report',     resource: 'Reports: October 2026',     timestamp: '2026-10-02 10:30:00', ip: '192.168.1.5'  },
  ],

  // Auto-increment counters
  _nextId: { users: 8, departments: 6, projects: 7, tasks: 9, chatMessages: 5, auditLogs: 6 },
};

// Helper to add audit log entry
store.addAudit = function (userId, action, resource, ip = '127.0.0.1') {
  const user = store.users.find(u => u.id === userId);
  const entry = {
    id: store._nextId.auditLogs++,
    user: user ? user.name : 'Unknown',
    user_id: userId,
    action,
    resource,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    ip,
  };
  store.auditLogs.unshift(entry);
};

module.exports = store;
