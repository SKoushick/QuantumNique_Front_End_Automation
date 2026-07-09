import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout/AppLayout';

const Login          = lazy(() => import('./pages/Auth/Login'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/Auth/ResetPassword'));
const Dashboard      = lazy(() => import('./pages/Dashboard/Dashboard'));
const EmployeeList   = lazy(() => import('./pages/Employees/EmployeeList'));
const EmployeeDetail = lazy(() => import('./pages/Employees/EmployeeDetail'));
const EmployeeForm   = lazy(() => import('./pages/Employees/EmployeeForm'));
const Departments    = lazy(() => import('./pages/Departments/Departments'));
const Attendance     = lazy(() => import('./pages/Attendance/Attendance'));
const Leave          = lazy(() => import('./pages/Leave/Leave'));
const Payroll        = lazy(() => import('./pages/Payroll/Payroll'));
const Tasks          = lazy(() => import('./pages/Tasks/Tasks'));
const Projects       = lazy(() => import('./pages/Projects/Projects'));
const Performance    = lazy(() => import('./pages/Performance/Performance'));
const Announcements  = lazy(() => import('./pages/Announcements/Announcements'));
const Documents      = lazy(() => import('./pages/Documents/Documents'));
const Assets         = lazy(() => import('./pages/Assets/Assets'));
const Reports        = lazy(() => import('./pages/Reports/Reports'));
const Audit          = lazy(() => import('./pages/Audit/Audit'));
const Settings       = lazy(() => import('./pages/Settings/Settings'));

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__spinner" aria-hidden="true" />
    </div>
  );
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
        <Route path="/reset-password" element={<PublicOnly><ResetPassword /></PublicOnly>} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<ProtectedRoute roles={['admin','hr','manager']}><EmployeeList /></ProtectedRoute>} />
          <Route path="employees/add" element={<ProtectedRoute roles={['admin','hr']}><EmployeeForm /></ProtectedRoute>} />
          <Route path="employees/:id/edit" element={<ProtectedRoute roles={['admin','hr']}><EmployeeForm /></ProtectedRoute>} />
          <Route path="employees/:id" element={<ProtectedRoute roles={['admin','hr','manager']}><EmployeeDetail /></ProtectedRoute>} />
          <Route path="departments" element={<ProtectedRoute roles={['admin','hr']}><Departments /></ProtectedRoute>} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<Leave />} />
          <Route path="payroll" element={<ProtectedRoute roles={['admin','hr']}><Payroll /></ProtectedRoute>} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="projects" element={<Projects />} />
          <Route path="performance" element={<Performance />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="documents" element={<Documents />} />
          <Route path="assets" element={<ProtectedRoute roles={['admin','hr']}><Assets /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute roles={['admin','hr','manager']}><Reports /></ProtectedRoute>} />
          <Route path="audit" element={<ProtectedRoute roles={['admin']}><Audit /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute roles={['admin','hr','manager','employee']}><Settings /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
