import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPatient } from '../api/patientApi';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { GenderOptionsList, BloodTypeOptionsList } from '../utils/enums';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const AddPatientPage = () => {
    const { t } = useLanguage();
    const [form, setForm] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: 1,
        bloodType: 1,
        address: '',
        phoneNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dto = {
                ...form,
                gender: Number(form.gender),
                bloodType: Number(form.bloodType),
            };
            const result = await addPatient(dto);
            if (result.isSuccess) {
                toast.success(t('addPatient.success'));
                navigate('/patients');
            } else {
                toast.error(result.message || t('addPatient.failed'));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t('addPatient.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn--secondary btn--sm" onClick={() => navigate('/patients')}>
                    <FiArrowLeft className="icon-flip-rtl" /> {t('common.back')}
                </button>
                <div>
                    <h1 className="page-header__title">{t('addPatient.title')}</h1>
                    <p className="page-header__subtitle">{t('addPatient.subtitle')}</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 700 }}>
                <form onSubmit={handleSubmit}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">{t('addPatient.fullNameLabel')}</label>
                            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="form-input" placeholder={t('addPatient.fullNamePlaceholder')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addPatient.phoneLabel')}</label>
                            <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-input" placeholder={t('addPatient.phonePlaceholder')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addPatient.dobLabel')}</label>
                            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addPatient.genderLabel')}</label>
                            <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                                {GenderOptionsList.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.value === 1 ? t('enums.gender.male') : t('enums.gender.female')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addPatient.bloodTypeLabel')}</label>
                            <select name="bloodType" value={form.bloodType} onChange={handleChange} className="form-select">
                                {BloodTypeOptionsList.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addPatient.addressLabel')}</label>
                            <input type="text" name="address" value={form.address} onChange={handleChange} className="form-input" placeholder={t('addPatient.addressPlaceholder')} required />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : <><FiSave /> {t('addPatient.savePatient')}</>}
                        </button>
                        <button type="button" className="btn btn--secondary btn--lg" onClick={() => navigate('/patients')}>
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientPage;
