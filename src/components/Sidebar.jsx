import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    FiHome,
    FiUsers,
    FiCalendar,
    FiUserCheck,
    FiLogOut,
    FiX,
    FiGlobe,
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
    const { doctor, logout } = useAuth();
    const { lang, toggleLang, t } = useLanguage();
    const navigate = useNavigate();

    const isAdmin = doctor?.role === 'Admin';

    const navItems = isAdmin
        ? [
            { path: '/doctors', icon: <FiUserCheck />, label: t('nav.doctors') },
          ]
        : [
            { path: '/', icon: <FiHome />, label: t('nav.dashboard') },
            { path: '/patients', icon: <FiUsers />, label: t('nav.patients') },
            { path: '/visits', icon: <FiCalendar />, label: t('nav.visits') },
            { path: '/doctors', icon: <FiUserCheck />, label: t('nav.doctors') },
          ];

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
                        <h1 className="sidebar__title">{t('nav.brand')}</h1>
                    </div>
                    <button className="sidebar__close-mobile" onClick={onToggle} aria-label="Close sidebar">
                        <FiX />
                    </button>
                </div>

                {/* Language Switcher pill in Sidebar */}
                <div className="sidebar__lang-wrapper">
                    <button
                        className="sidebar__lang-btn"
                        onClick={toggleLang}
                        title={lang === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
                        type="button"
                    >
                        <FiGlobe className="sidebar__lang-icon" />
                        <span className="sidebar__lang-current">
                            {lang === 'en' ? 'English' : 'العربية'}
                        </span>
                        <span className="sidebar__lang-badge">
                            {lang === 'en' ? 'عربي' : 'EN'}
                        </span>
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
                                {isAdmin ? '👑' : (doctor.fullName?.charAt(0)?.toUpperCase() || 'D')}
                            </div>
                            <div className="sidebar__user-info">
                                <span className="sidebar__user-name">
                                    {isAdmin 
                                        ? (doctor.fullName || t('nav.adminRole')) 
                                        : `${t('nav.doctorPrefix')}${doctor.fullName || t('nav.doctorRole')}`}
                                </span>
                                <span className="sidebar__user-role">
                                    {isAdmin ? t('nav.adminRole') : t('nav.doctorRole')}
                                </span>
                            </div>
                        </div>
                    )}
                    <button className="sidebar__logout" onClick={handleLogout} title={t('nav.logout')}>
                        <FiLogOut />
                        <span>{t('nav.logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
