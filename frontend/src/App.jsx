import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NewInterviewPage = lazy(() => import('./pages/NewInterviewPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));

// Simple auth guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b0f19]">
      <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Loading spinner
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#0b0f19]">
    <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/interview/new" element={<ProtectedRoute><NewInterviewPage /></ProtectedRoute>} />
        <Route path="/interview/:id/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}
