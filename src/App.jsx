import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/add" element={<AddPatientPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/visits" element={<VisitsPage />} />
            <Route path="/visits/add" element={<AddVisitPage />} />
            <Route path="/visits/:id" element={<VisitDetailPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
          </Route>
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
  );
}

export default App;
