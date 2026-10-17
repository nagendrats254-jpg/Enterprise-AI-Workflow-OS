// Central API service - all backend calls go through here
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, path, data = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (data) config.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${path}`, config);

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `Request failed: ${res.status}`);
  return json;
}

export const api = {
  get:    (path)       => request('GET',    path),
  post:   (path, data) => request('POST',   path, data),
  put:    (path, data) => request('PUT',    path, data),
  patch:  (path, data) => request('PATCH',  path, data),
  delete: (path)       => request('DELETE', path),
};

// Auth
export const authApi = {
  login:   (creds)   => api.post('/auth/login', creds),
  logout:  ()        => api.post('/auth/logout'),
  me:      ()        => api.get('/auth/me'),
};

// Users
export const usersApi = {
  list:   ()         => api.get('/users'),
  get:    (id)       => api.get(`/users/${id}`),
  create: (data)     => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id)       => api.delete(`/users/${id}`),
};

// Employees
export const employeesApi = {
  list:   ()         => api.get('/employees'),
  get:    (id)       => api.get(`/employees/${id}`),
  create: (data)     => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  remove: (id)       => api.delete(`/employees/${id}`),
};

// Departments
export const departmentsApi = {
  list:   ()         => api.get('/departments'),
  get:    (id)       => api.get(`/departments/${id}`),
  create: (data)     => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  remove: (id)       => api.delete(`/departments/${id}`),
};

// Projects
export const projectsApi = {
  list:   ()         => api.get('/projects'),
  get:    (id)       => api.get(`/projects/${id}`),
  create: (data)     => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id)       => api.delete(`/projects/${id}`),
  tasks:  (id)       => api.get(`/projects/${id}/tasks`),
};

// Tasks
export const tasksApi = {
  list:          ()                   => api.get('/tasks'),
  myTasks:       ()                   => api.get('/tasks/my'),
  get:           (id)                 => api.get(`/tasks/${id}`),
  create:        (data)               => api.post('/tasks', data),
  update:        (id, data)           => api.put(`/tasks/${id}`, data),
  remove:        (id)                 => api.delete(`/tasks/${id}`),
  updateStatus:  (id, status)         => api.patch(`/tasks/${id}/status`, { status }),
  updateProgress:(id, progress)       => api.patch(`/tasks/${id}/progress`, { progress }),
  assign:        (id, employee_id)    => api.post(`/tasks/${id}/assign`, { employee_id }),
};

// Workload
export const workloadApi = {
  org:  () => api.get('/workload'),
  me:   () => api.get('/workload/me'),
};

// Analytics
export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  tasks:    () => api.get('/analytics/tasks'),
  workload: () => api.get('/analytics/workload'),
  ai:       () => api.get('/analytics/ai-performance'),
};

// ML
export const mlApi = {
  predictRisk:  (data) => api.post('/ml/predict/risk', data),
  predictDelay: (data) => api.post('/ml/predict/delay', data),
  analyzeText:  (data) => api.post('/ml/analyze/text', data),
  predictions:  (taskId) => api.get(`/ml/predictions/${taskId}`),
};

// Chat
export const chatApi = {
  channels:       ()              => api.get('/chat/channels'),
  messages:       (channelId)     => api.get(`/chat/messages/${channelId}`),
  send:           (data)          => api.post('/chat/messages', data),
};

// Audit
export const auditApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/audit-logs${q ? `?${q}` : ''}`);
  },
};

// Analytics summary
export const dashboardApi = {
  adminOverview:   () => api.get('/dashboard/admin'),
  managerOverview: () => api.get('/dashboard/manager'),
  employeeOverview:() => api.get('/dashboard/employee'),
};

// AI Assistant
export const aiApi = {
  chat: (message) => api.post('/ai/chat', { message }),
  status: () => api.get('/ai/status'),
};

