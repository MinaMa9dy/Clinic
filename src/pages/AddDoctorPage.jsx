import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { addDoctor } from '../api/doctorApi';
import { toast } from 'react-toastify';
import { GenderOptionsList } from '../utils/enums';
import { FiUserPlus, FiArrowLeft, FiShield } from 'react-icons/fi';

const AddDoctorPage = () => {
    const { doctor } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

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

    // Redirect non-admins
    if (doctor?.role !== 'Admin') {
        return (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
                <div style={{ fontSize: '3rem' }}>🔒</div>
                <h2 style={{ color: 'var(--color-text)', fontWeight: 700 }}>Access Denied</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Only administrators can add new doctors.</p>
                <Link to="/doctors" className="btn btn--secondary">← Back to Doctors</Link>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error(t('addDoctor.passwordsDoNotMatch'));
            return;
        }
        setLoading(true);
        try {
            const dto = { ...form, gender: Number(form.gender) };
            const result = await addDoctor(dto);
            if (result.isSuccess) {
                toast.success(t('addDoctor.success'));
                navigate('/doctors');
            } else {
                toast.error(result.message || t('addDoctor.failed'));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || t('addDoctor.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => navigate('/doctors')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <FiArrowLeft /> {t('common.back')}
                    </button>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: 20,
                        padding: '3px 10px',
                    }}>
                        <FiShield size={11} /> Admin Only
                    </span>
                </div>
                <h1 className="page-header__title" style={{ marginTop: 12 }}>{t('addDoctor.title')}</h1>
                <p className="page-header__subtitle">{t('addDoctor.subtitle')}</p>
            </div>

            <div className="card" style={{ maxWidth: 680, margin: '0 auto', padding: '36px 40px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="auth-form-grid">
                        <div className="form-group">
                            <label className="form-label">{t('addDoctor.fullName')} *</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder={t('addDoctor.fullNamePlaceholder')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addDoctor.email')} *</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" placeholder="doctor@myclinic.com" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addDoctor.dateOfBirth')} *</label>
                            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addDoctor.gender')} *</label>
                            <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                                {GenderOptionsList.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.value === 1 ? t('enums.gender.male') : t('enums.gender.female')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addDoctor.phoneNumber')} *</label>
                            <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-input" placeholder={t('addDoctor.phonePlaceholder')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addDoctor.password')} *</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} className="form-input" placeholder={t('addDoctor.minCharacters')} required />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 4 }}>
                        <label className="form-label">{t('addDoctor.confirmPassword')} *</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-input" placeholder={t('addDoctor.confirmPassword')} required />
                    </div>

                    <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
                        <button type="submit" className="btn btn--primary btn--lg" disabled={loading} style={{ flex: 1 }}>
                            {loading
                                ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                : <><FiUserPlus /> {t('addDoctor.addDoctorBtn')}</>
                            }
                        </button>
                        <button type="button" className="btn btn--secondary btn--lg" onClick={() => navigate('/doctors')} style={{ minWidth: 110 }}>
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDoctorPage;
