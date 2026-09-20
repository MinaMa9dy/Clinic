import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { loginDoctor } from '../api/authApi';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn, FiGlobe } from 'react-icons/fi';
import './LoginPage.css';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { lang, toggleLang, t } = useLanguage();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await loginDoctor(form);
            if (result.isSuccess) {
                const loggedUser = login(result.data);
                toast.success(t('auth.welcomeBack'));
                if (loggedUser?.role === 'Admin') {
                    navigate('/doctors');
                } else {
                    navigate('/');
                }
            } else {
                toast.error(result.message || t('auth.loginFailed'));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || t('auth.loginFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-page__bg">
                <div className="auth-page__orb auth-page__orb--1"></div>
                <div className="auth-page__orb auth-page__orb--2"></div>
                <div className="auth-page__orb auth-page__orb--3"></div>
            </div>

            {/* Language toggle at top corner */}
            <div className="auth-lang-toggle">
                <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={toggleLang}
                >
                    <FiGlobe /> {lang === 'en' ? 'العربية' : 'English'}
                </button>
            </div>

            <div className="auth-card fade-in">
                <div className="auth-card__header">
                    <span className="auth-card__logo">🏥</span>
                    <h1 className="auth-card__title">{t('nav.brand')}</h1>
                    <p className="auth-card__subtitle">{t('auth.loginTitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-card__form">
                    <div className="form-group">
                        <label className="form-label">{t('auth.email')}</label>
                        <div className="auth-input-wrapper">
                            <FiMail className="auth-input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="form-input auth-input"
                                placeholder="doctor@myclinic.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.password')}</label>
                        <div className="auth-input-wrapper">
                            <FiLock className="auth-input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="form-input auth-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary btn--lg btn--block"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : <><FiLogIn /> {t('auth.signIn')}</>}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default LoginPage;
