import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginDoctor } from '../api/authApi';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import './LoginPage.css';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
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
                login(result.data);
                toast.success('Welcome back!');
                navigate('/');
            } else {
                toast.error(result.message || 'Login failed');
            }
        } catch (err) {
            toast.error(err.response?.data || 'Login failed. Please try again.');
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

            <div className="auth-card fade-in">
                <div className="auth-card__header">
                    <span className="auth-card__logo">🏥</span>
                    <h1 className="auth-card__title">MyClinic</h1>
                    <p className="auth-card__subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-card__form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
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
                        <label className="form-label">Password</label>
                        <div className="auth-input-wrapper">
                            <FiLock className="auth-input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="form-input auth-input"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary btn--lg btn--block"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : <><FiLogIn /> Sign In</>}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
