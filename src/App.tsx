import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import PendingJobsPage from "./pages/PendingJobsPage";
import UsersPage from "./pages/UsersPage";
import EmpresasPage from "./pages/EmpresasPage";
import PostulantesPage from "./pages/PostulantesPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import TermsPage from "./pages/TermsPage";
import MessagesPage from "./pages/MessagesPage";
import CallsPage from "./pages/CallsPage";
import CatalogsPage from "./pages/CatalogsPage";
import PlansPage from "./pages/PlansPage";
import ReportsPage from "./pages/ReportsPage";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/pending" element={<PendingJobsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/empresas" element={<EmpresasPage />} />
                <Route path="/postulantes" element={<PostulantesPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/calls" element={<CallsPage />} />
                <Route path="/options" element={<Navigate to="/catalogs" replace />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/catalogs" element={<CatalogsPage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
