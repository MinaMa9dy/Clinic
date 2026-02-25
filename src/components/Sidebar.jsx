import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome,
    FiUsers,
    FiCalendar,
    FiUserCheck,
    FiLogOut,
    FiMenu,
    FiX,
} from 'react-icons/fi';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: <FiHome />, label: 'Dashboard' },
    { path: '/patients', icon: <FiUsers />, label: 'Patients' },
    { path: '/visits', icon: <FiCalendar />, label: 'Visits' },
    { path: '/doctors', icon: <FiUserCheck />, label: 'Doctors' },
];

const Sidebar = ({ isOpen, onToggle }) => {
    const { doctor, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = () => {
        // Close sidebar on mobile when a link is clicked
        if (window.innerWidth <= 768) {
            onToggle();
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}

            <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar__header">
                    <div className="sidebar__brand">
                        <span className="sidebar__logo">🏥</span>
                        <h1 className="sidebar__title">MyClinic</h1>
                    </div>
                    <button className="sidebar__close-mobile" onClick={onToggle} aria-label="Close sidebar">
                        <FiX />
                    </button>
                </div>

                <nav className="sidebar__nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                            }
                            title={item.label}
                            onClick={handleNavClick}
                        >
                            <span className="sidebar__link-icon">{item.icon}</span>
                            <span className="sidebar__link-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__footer">
                    {doctor && (
                        <div className="sidebar__user">
                            <div className="sidebar__avatar">
                                {doctor.fullName?.charAt(0)?.toUpperCase() || 'D'}
                            </div>
                            <div className="sidebar__user-info">
                                <span className="sidebar__user-name">{doctor.fullName || 'Doctor'}</span>
                                <span className="sidebar__user-role">Doctor</span>
                            </div>
                        </div>
                    )}
                    <button className="sidebar__logout" onClick={handleLogout} title="Logout">
                        <FiLogOut />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
