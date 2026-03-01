import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // doctor info derived from local storage
    const [doctor, setDoctor] = useState(() => {
        const saved = localStorage.getItem('doctor');
        return saved ? JSON.parse(saved) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        if (!token) return false;
        try {
            const decoded = jwtDecode(token);
            const isExpired = decoded.exp * 1000 <= Date.now();

            // If token is expired but we have a refresh token, we stay "authenticated" 
            // and let the Axios interceptor handle the background refresh.
            if (isExpired && !refreshToken) {
                return false;
            }
            return true;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        if (doctor) {
            localStorage.setItem('doctor', JSON.stringify(doctor));
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('doctor');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
        }
    }, [doctor]);

    // authData = { token, refreshToken, fullName, email, expiresAt }
    const login = (authData) => {
        localStorage.setItem('token', authData.token);
        if (authData.refreshToken) {
            localStorage.setItem('refreshToken', authData.refreshToken);
        }
        // Decode token to get role and id, then merge with authData
        let role = 'Doctor';
        let id = null;
        try {
            const decoded = jwtDecode(authData.token);
            role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Doctor';
            id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
        } catch { /* ignore */ }

        const doctorData = {
            fullName: authData.fullName,
            email: authData.email,
            role,
            id,
        };
        setDoctor(doctorData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setDoctor(null);
    };

    return (
        <AuthContext.Provider value={{ doctor, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
