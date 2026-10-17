import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Lazy-loaded pages (code-split per route) ---

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

// Admin
const AdminDashboard        = lazy(() => import('./pages/admin/AdminDashboard'));
const OrganizationPage      = lazy(() => import('./pages/admin/OrganizationPage'));
const ProjectsPage          = lazy(() => import('./pages/admin/ProjectsPage'));
const ReportsPage           = lazy(() => import('./pages/admin/ReportsPage'));
const MLManagementPage      = lazy(() => import('./pages/admin/MLManagementPage'));
const WhatIfPage            = lazy(() => import('./pages/admin/WhatIfPage'));
const AuditLogsPage         = lazy(() => import('./pages/admin/AuditLogsPage'));
const SettingsPage          = lazy(() => import('./pages/admin/SettingsPage'));

// Manager
const ManagerDashboard      = lazy(() => import('./pages/manager/ManagerDashboard'));

// Employee
const EmployeeDashboard     = lazy(() => import('./pages/employee/EmployeeDashboard'));
const EmployeeProjectsPage  = lazy(() => import('./pages/employee/EmployeeProjectsPage'));
const EmployeeWorkloadPage  = lazy(() => import('./pages/employee/EmployeeWorkloadPage'));
const ProfilePage           = lazy(() => import('./pages/employee/ProfilePage'));

// Shared
const TasksPage             = lazy(() => import('./pages/shared/TasksPage'));
const TeamChatPage          = lazy(() => import('./pages/shared/TeamChatPage'));
const WorkloadPage          = lazy(() => import('./pages/shared/WorkloadPage'));
const RiskAnalysisPage      = lazy(() => import('./pages/shared/RiskAnalysisPage'));
const AIAssistantPage       = lazy(() => import('./pages/shared/AIAssistantPage'));

// Full-screen loading fallback
function PageLoader() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-navy-900)',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Loading...</span>
    </div>
  );
}

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dest = { admin: '/admin', manager: '/manager', employee: '/employee' }[user.role] || '/employee';
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Redirect root based on role */}
        <Route path="/" element={
          user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />
        } />

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin"               element={<AdminDashboard />} />
          <Route path="/admin/organization"  element={<OrganizationPage />} />
          <Route path="/admin/projects"      element={<ProjectsPage />} />
          <Route path="/admin/tasks"         element={<TasksPage role="admin" />} />
          <Route path="/admin/chat"          element={<TeamChatPage />} />
          <Route path="/admin/workload"      element={<WorkloadPage />} />
          <Route path="/admin/reports"       element={<ReportsPage />} />
          <Route path="/admin/ml"            element={<MLManagementPage />} />
          <Route path="/admin/ai-control"    element={<AIAssistantPage />} />
          <Route path="/admin/ai-analysis"   element={<RiskAnalysisPage />} />
          <Route path="/admin/whatif"        element={<WhatIfPage />} />
          <Route path="/admin/audit"         element={<AuditLogsPage />} />
          <Route path="/admin/settings"      element={<SettingsPage />} />
        </Route>

        {/* MANAGER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'admin']} />}>
          <Route path="/manager"             element={<ManagerDashboard />} />
          <Route path="/manager/projects"    element={<ProjectsPage />} />
          <Route path="/manager/tasks"       element={<TasksPage role="manager" />} />
          <Route path="/manager/chat"        element={<TeamChatPage />} />
          <Route path="/manager/workload"    element={<WorkloadPage />} />
          <Route path="/manager/reports"     element={<ReportsPage />} />
          <Route path="/manager/risk"        element={<RiskAnalysisPage />} />
          <Route path="/manager/assistant"   element={<AIAssistantPage />} />
        </Route>

        {/* EMPLOYEE ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['employee', 'manager', 'admin']} />}>
          <Route path="/employee"            element={<EmployeeDashboard />} />
          <Route path="/employee/tasks"      element={<TasksPage role="employee" />} />
          <Route path="/employee/projects"   element={<EmployeeProjectsPage />} />
          <Route path="/employee/workload"   element={<EmployeeWorkloadPage />} />
          <Route path="/employee/assistant"  element={<AIAssistantPage />} />
          <Route path="/employee/profile"    element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
