import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import DiagnosticProcessing from './pages/DiagnosticProcessing';
import MyResult from './pages/MyResult';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Entreprises = lazy(() => import('./pages/Entreprises'));
const Questionnaires = lazy(() => import('./pages/Questionnaires'));
const Diagnostics = lazy(() => import('./pages/Diagnostics'));
const AccountManagers = lazy(() => import('./pages/AccountManagers'));
const Team = lazy(() => import('./pages/Team'));
const TakeDiagnostic = lazy(() => import('./pages/TakeDiagnostic'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-brand-soft-bg">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-brand-turquoise border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Pulse Initialisation...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!profile) return <Navigate to="/login" replace />;

  return <AppShell>{children}</AppShell>;
};

const AppContent: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={profile ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={profile ? <Navigate to="/" replace /> : <SignUp />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/entreprises" element={<ProtectedRoute><Entreprises /></ProtectedRoute>} />
        <Route path="/questionnaires" element={<ProtectedRoute><Questionnaires /></ProtectedRoute>} />
        <Route path="/diagnostics" element={<ProtectedRoute><Diagnostics /></ProtectedRoute>} />
        <Route path="/diagnostics" element={<ProtectedRoute><Diagnostics /></ProtectedRoute>} />
        <Route path="/charges-de-compte" element={<ProtectedRoute><AccountManagers /></ProtectedRoute>} />
        <Route path="/equipes" element={<ProtectedRoute><Team /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/diagnostic/start" element={<ProtectedRoute><TakeDiagnostic /></ProtectedRoute>} />
        <Route path="/diagnostic/processing" element={<ProtectedRoute><DiagnosticProcessing /></ProtectedRoute>} />
        <Route path="/diagnostic/result" element={<ProtectedRoute><MyResult /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
