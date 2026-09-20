import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import { DoctorRoute, AdminRoute } from './components/RoleRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AddDoctorPage from './pages/AddDoctorPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AddPatientPage from './pages/AddPatientPage';
import PatientDetailPage from './pages/PatientDetailPage';
import VisitsPage from './pages/VisitsPage';
import AddVisitPage from './pages/AddVisitPage';
import VisitDetailPage from './pages/VisitDetailPage';
import DoctorsPage from './pages/DoctorsPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Doctor-only routes (Admin redirected to /doctors) */}
            <Route element={<DoctorRoute />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/add" element={<AddPatientPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/visits" element={<VisitsPage />} />
              <Route path="/visits/add" element={<AddVisitPage />} />
              <Route path="/visits/:id" element={<VisitDetailPage />} />
            </Route>

            {/* Accessible to both Doctor and Admin */}
            <Route path="/doctors" element={<DoctorsPage />} />

            {/* Admin-only routes (Doctor redirected to /doctors) */}
            <Route element={<AdminRoute />}>
              <Route path="/doctors/add" element={<AddDoctorPage />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          theme="dark"
          toastStyle={{
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
