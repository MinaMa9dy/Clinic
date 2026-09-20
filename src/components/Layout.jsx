import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './Layout.css';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <div className="layout">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Mobile header with hamburger */}
            <div className="layout__mobile-header">
                <button className="layout__hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                    <FiMenu />
                </button>
                <span className="layout__mobile-title">🏥 {t('nav.brand')}</span>
            </div>

            <main className="layout__main">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
