import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerDoctor } from '../api/authApi';
import { toast } from 'react-toastify';
import { GenderOptionsList } from '../utils/enums';
import { FiUserPlus } from 'react-icons/fi';
import './LoginPage.css';

const RegisterPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        birthDate: '',
        gender: 1,
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const dto = { ...form, gender: Number(form.gender) };
            const result = await registerDoctor(dto);
            if (result.isSuccess) {
                login(result.data);
                toast.success(result.message || 'Registration successful!');
                navigate('/');
            } else {
                toast.error(result.message || 'Registration failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
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

            <div className="auth-card auth-card--wide fade-in">
                <div className="auth-card__header">
                    <span className="auth-card__logo">🏥</span>
                    <h1 className="auth-card__title">MyClinic</h1>
                    <p className="auth-card__subtitle">Create your doctor account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-card__form">
                    <div className="auth-form-grid">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Dr. John Smith" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" placeholder="doctor@myclinic.com" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date of Birth</label>
                            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                                {GenderOptionsList.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-input" placeholder="+20 1XX XXX XXXX" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Min 6 characters" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-input" placeholder="Re-enter password" required />
                    </div>

                    <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={loading}>
                        {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : <><FiUserPlus /> Create Account</>}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
