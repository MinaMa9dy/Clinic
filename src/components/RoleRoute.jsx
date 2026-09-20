import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard for Doctor-only pages (Dashboard, Patients, Visits, etc.)
 * If an Admin attempts to access, redirect them to /doctors.
 */
export const DoctorRoute = () => {
    const { doctor } = useAuth();
    if (doctor?.role === 'Admin') {
        return <Navigate to="/doctors" replace />;
    }
    return <Outlet />;
};

/**
 * Route guard for Admin-only pages (e.g. Add Doctor)
 * If a non-Admin attempts to access, redirect them to /doctors.
 */
export const AdminRoute = () => {
    const { doctor } = useAuth();
    if (doctor?.role !== 'Admin') {
        return <Navigate to="/doctors" replace />;
    }
    return <Outlet />;
};
