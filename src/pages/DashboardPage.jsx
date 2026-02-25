import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiUserCheck, FiActivity, FiPlusCircle, FiSearch } from 'react-icons/fi';
import './DashboardPage.css';

const DashboardPage = () => {
    const { doctor } = useAuth();

    const quickActions = [
        { icon: <FiPlusCircle />, label: 'New Patient', path: '/patients/add', color: 'var(--color-primary)' },
        { icon: <FiCalendar />, label: 'New Visit', path: '/visits/add', color: 'var(--color-accent)' },
        { icon: <FiSearch />, label: 'Search Patients', path: '/patients', color: 'var(--color-info)' },
        { icon: <FiUsers />, label: 'View Doctors', path: '/doctors', color: '#8b5cf6' },
    ];

    const statCards = [
        { icon: <FiUsers />, label: 'Patients', value: '—', color: 'var(--color-primary)', bg: 'var(--color-primary-alpha)' },
        { icon: <FiCalendar />, label: 'Visits Today', value: '—', color: 'var(--color-accent)', bg: 'rgba(6, 182, 212, 0.12)' },
        { icon: <FiUserCheck />, label: 'Doctors', value: '—', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
        { icon: <FiActivity />, label: 'Active Cases', value: '—', color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.12)' },
    ];

    return (
        <div className="dashboard fade-in">
            {/* Welcome Card */}
            <div className="dashboard__welcome card card--glass">
                <div className="dashboard__welcome-content">
                    <h1 className="dashboard__welcome-title">
                        Welcome back, <span className="dashboard__welcome-name">{doctor?.fullName || 'Doctor'}</span>
                    </h1>
                    <p className="dashboard__welcome-sub">
                        Here's an overview of your clinic management dashboard.
                    </p>
                </div>
                <div className="dashboard__welcome-art">
                    <span className="dashboard__welcome-emoji">👨‍⚕️</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 28 }}>
                {statCards.map((stat, i) => (
                    <div key={i} className="card dashboard__stat-card">
                        <div className="dashboard__stat-icon" style={{ background: stat.bg, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="dashboard__stat-info">
                            <span className="dashboard__stat-value">{stat.value}</span>
                            <span className="dashboard__stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="page-header">
                <h2 className="page-header__title" style={{ fontSize: '1.2rem' }}>Quick Actions</h2>
            </div>
            <div className="grid-4">
                {quickActions.map((action, i) => (
                    <Link key={i} to={action.path} className="card dashboard__action-card">
                        <div className="dashboard__action-icon" style={{ color: action.color }}>
                            {action.icon}
                        </div>
                        <span className="dashboard__action-label">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;
