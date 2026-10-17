// Shared demo data used by all dashboards when backend is not connected
// All data labeled as demo

export const DEMO_USERS = [
  { id: 1, name: 'Sarah Chen', email: 'sarah.chen@enterprise.ai', role: 'admin',    department: 'Operations',    status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'James Okafor', email: 'james@enterprise.ai',    role: 'manager',  department: 'Engineering',   status: 'active', joined: '2024-02-20' },
  { id: 3, name: 'Priya Nair',   email: 'priya@enterprise.ai',    role: 'manager',  department: 'Product',       status: 'active', joined: '2024-03-10' },
  { id: 4, name: 'Alex Torres',  email: 'alex@enterprise.ai',     role: 'employee', department: 'Engineering',   status: 'active', joined: '2024-04-05' },
  { id: 5, name: 'Mei Zhang',    email: 'mei@enterprise.ai',      role: 'employee', department: 'Design',        status: 'active', joined: '2024-04-12' },
  { id: 6, name: 'Ravi Kumar',   email: 'ravi@enterprise.ai',     role: 'employee', department: 'Engineering',   status: 'active', joined: '2024-05-01' },
  { id: 7, name: 'Dana White',   email: 'dana@enterprise.ai',     role: 'employee', department: 'QA',            status: 'inactive', joined: '2024-02-28' },
];

export const DEMO_DEPARTMENTS = [
  { id: 1, name: 'Engineering',  head: 'James Okafor',  employees: 12, projects: 4 },
  { id: 2, name: 'Product',      head: 'Priya Nair',    employees: 6,  projects: 3 },
  { id: 3, name: 'Design',       head: 'Mei Zhang',     employees: 4,  projects: 2 },
  { id: 4, name: 'Operations',   head: 'Sarah Chen',    employees: 5,  projects: 2 },
  { id: 5, name: 'QA',           head: 'Dana White',    employees: 3,  projects: 3 },
];

export const DEMO_PROJECTS = [
  { id: 1, name: 'Platform Core v3',         department: 'Engineering', status: 'active',   progress: 68, deadline: '2026-12-31', tasks: 24, risk: 'medium' },
  { id: 2, name: 'Customer Portal Redesign', department: 'Product',     status: 'active',   progress: 45, deadline: '2026-11-15', tasks: 18, risk: 'low'    },
  { id: 3, name: 'ML Pipeline Integration',  department: 'Engineering', status: 'active',   progress: 30, deadline: '2026-10-30', tasks: 16, risk: 'high'   },
  { id: 4, name: 'Mobile App v2',            department: 'Design',      status: 'planning', progress: 10, deadline: '2027-02-28', tasks: 12, risk: 'low'    },
  { id: 5, name: 'Data Warehouse Migration', department: 'Operations',  status: 'delayed',  progress: 55, deadline: '2026-09-30', tasks: 20, risk: 'high'   },
  { id: 6, name: 'Security Audit Suite',     department: 'QA',          status: 'active',   progress: 80, deadline: '2026-10-15', tasks: 8,  risk: 'low'    },
];

export const DEMO_TASKS = [
  { id: 1,  title: 'Implement JWT refresh token flow',   project: 'Platform Core v3',        assigned: 'Alex Torres', priority: 'high',     status: 'in_progress', deadline: '2026-10-10', progress: 70, risk_level: 'low',    delay_prob: 0.18 },
  { id: 2,  title: 'Design system token migration',      project: 'Customer Portal Redesign', assigned: 'Mei Zhang',   priority: 'medium',   status: 'in_progress', deadline: '2026-10-20', progress: 45, risk_level: 'medium', delay_prob: 0.42 },
  { id: 3,  title: 'ML model training pipeline',         project: 'ML Pipeline Integration',  assigned: 'Ravi Kumar',  priority: 'critical', status: 'not_started', deadline: '2026-10-08', progress: 0,  risk_level: 'high',   delay_prob: 0.81 },
  { id: 4,  title: 'API rate limiting middleware',       project: 'Platform Core v3',        assigned: 'Alex Torres', priority: 'medium',   status: 'completed',   deadline: '2026-09-30', progress: 100, risk_level: 'low',   delay_prob: 0.05 },
  { id: 5,  title: 'Database index optimization',        project: 'Data Warehouse Migration', assigned: 'Ravi Kumar',  priority: 'high',     status: 'delayed',     deadline: '2026-09-28', progress: 55, risk_level: 'high',   delay_prob: 0.92 },
  { id: 6,  title: 'Accessibility audit pass 1',         project: 'Customer Portal Redesign', assigned: 'Dana White',  priority: 'medium',   status: 'in_progress', deadline: '2026-10-25', progress: 30, risk_level: 'low',    delay_prob: 0.22 },
  { id: 7,  title: 'Mobile nav component',               project: 'Mobile App v2',            assigned: 'Mei Zhang',   priority: 'high',     status: 'not_started', deadline: '2026-11-10', progress: 0,  risk_level: 'low',    delay_prob: 0.15 },
  { id: 8,  title: 'Load testing report',                project: 'Security Audit Suite',     assigned: 'Dana White',  priority: 'medium',   status: 'completed',   deadline: '2026-10-05', progress: 100, risk_level: 'low',   delay_prob: 0.08 },
];

export const DEMO_CHAT_CHANNELS = [
  { id: 1, name: 'Engineering',  members: 12, lastMessage: 'Build pipeline fixed', lastTime: '10:24 AM' },
  { id: 2, name: 'Product',      members: 6,  lastMessage: 'Review the new mockups', lastTime: '9:45 AM'  },
  { id: 3, name: 'General',      members: 30, lastMessage: 'Team lunch at 1pm', lastTime: '8:30 AM'   },
  { id: 4, name: 'QA Team',      members: 4,  lastMessage: 'Test report uploaded', lastTime: 'Yesterday' },
];

export const DEMO_CHAT_MESSAGES = [
  { id: 1, sender: 'James Okafor', content: 'Good morning team. Standup in 10 minutes.', time: '9:00 AM', mine: false },
  { id: 2, sender: 'Alex Torres',  content: 'Ready. I will share the sprint status.', time: '9:02 AM', mine: false },
  { id: 3, sender: 'Me',           content: 'On my way.',                              time: '9:03 AM', mine: true  },
  { id: 4, sender: 'Ravi Kumar',   content: 'ML pipeline training finished overnight. Results look good.', time: '9:15 AM', mine: false },
  { id: 5, sender: 'James Okafor', content: 'Great news Ravi. Lets review the metrics after standup.', time: '9:16 AM', mine: false },
];

export const DEMO_AUDIT_LOGS = [
  { id: 1, user: 'Sarah Chen',    action: 'Created user',        resource: 'User: Ravi Kumar',   timestamp: '2026-10-02 08:12:44', ip: '192.168.1.5'  },
  { id: 2, user: 'James Okafor',  action: 'Created project',     resource: 'ML Pipeline Integration', timestamp: '2026-10-02 09:00:11', ip: '192.168.1.8' },
  { id: 3, user: 'Alex Torres',   action: 'Updated task status', resource: 'Task: API rate limiting', timestamp: '2026-10-02 09:44:02', ip: '192.168.1.12' },
  { id: 4, user: 'Ravi Kumar',    action: 'Uploaded file',       resource: 'Project: ML Pipeline', timestamp: '2026-10-02 10:05:33', ip: '192.168.1.14' },
  { id: 5, user: 'Sarah Chen',    action: 'Exported report',     resource: 'Reports: October 2026', timestamp: '2026-10-02 10:30:00', ip: '192.168.1.5'  },
];

export const DEMO_WORKLOAD = [
  { name: 'Alex Torres',  tasks: 8,  capacity: 10, utilization: 80, department: 'Engineering', status: 'normal'     },
  { name: 'Ravi Kumar',   tasks: 12, capacity: 10, utilization: 120, department: 'Engineering', status: 'overloaded' },
  { name: 'Mei Zhang',    tasks: 5,  capacity: 10, utilization: 50, department: 'Design',       status: 'available'  },
  { name: 'Dana White',   tasks: 7,  capacity: 8,  utilization: 87, department: 'QA',           status: 'normal'     },
  { name: 'Priya Nair',   tasks: 9,  capacity: 10, utilization: 90, department: 'Product',      status: 'normal'     },
];

export const DEMO_RISK_ITEMS = [
  {
    id: 1,
    task: 'ML model training pipeline',
    project: 'ML Pipeline Integration',
    severity: 'critical',
    cause: 'No progress recorded with 2 days to deadline',
    status: 'open',
    recommendation: 'Assign additional resources or extend the deadline by 5 business days.',
    prediction_confidence: 0.91,
  },
  {
    id: 2,
    task: 'Database index optimization',
    project: 'Data Warehouse Migration',
    severity: 'high',
    cause: 'Task already past deadline with blocking dependencies',
    status: 'open',
    recommendation: 'Conduct an immediate root-cause review and escalate to project owner.',
    prediction_confidence: 0.87,
  },
  {
    id: 3,
    task: 'Design system token migration',
    project: 'Customer Portal Redesign',
    severity: 'medium',
    cause: 'Below expected progress rate at 42% delay probability',
    status: 'monitoring',
    recommendation: 'Check for scope creep and confirm capacity with assignee.',
    prediction_confidence: 0.72,
  },
];

export const DEMO_ANALYTICS = {
  taskCompletion: [
    { month: 'May',  completed: 28, delayed: 3 },
    { month: 'Jun',  completed: 34, delayed: 5 },
    { month: 'Jul',  completed: 31, delayed: 4 },
    { month: 'Aug',  completed: 40, delayed: 6 },
    { month: 'Sep',  completed: 38, delayed: 8 },
    { month: 'Oct',  completed: 22, delayed: 4 },
  ],
  workloadTrend: [
    { week: 'W1', avg: 72 },
    { week: 'W2', avg: 78 },
    { week: 'W3', avg: 85 },
    { week: 'W4', avg: 91 },
  ],
  riskTrend: [
    { month: 'May', high: 2, medium: 4, low: 8  },
    { month: 'Jun', high: 3, medium: 5, low: 10 },
    { month: 'Jul', high: 2, medium: 3, low: 9  },
    { month: 'Aug', high: 4, medium: 6, low: 12 },
    { month: 'Sep', high: 5, medium: 7, low: 10 },
    { month: 'Oct', high: 3, medium: 5, low: 7  },
  ],
};
