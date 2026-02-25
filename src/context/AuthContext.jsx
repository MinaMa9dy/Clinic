import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [doctor, setDoctor] = useState(() => {
        const saved = localStorage.getItem('doctor');
        return saved ? JSON.parse(saved) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(!!doctor);

    useEffect(() => {
        if (doctor) {
            localStorage.setItem('doctor', JSON.stringify(doctor));
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('doctor');
            setIsAuthenticated(false);
        }
    }, [doctor]);

    const login = (doctorData) => {
        setDoctor(doctorData);
    };

    const logout = () => {
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
