import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { addVisit } from '../api/visitApi';
import { searchPatients } from '../api/patientApi';
import { toast } from 'react-toastify';
import { MedicalVisitOptionsList } from '../utils/enums';
import { FiSave, FiArrowLeft, FiSearch } from 'react-icons/fi';

const AddVisitPage = () => {
    const { doctor } = useAuth();
    const { t, isRtl } = useLanguage();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        patientId: '',
        doctorId: doctor?.id || '',
        type: 1,
        fee: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [patientSearch, setPatientSearch] = useState('');
    const [patientResults, setPatientResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSearchPatients = async (q) => {
        setPatientSearch(q);
        if (q.length < 1) { setPatientResults([]); setShowDropdown(false); return; }
        try {
            const result = await searchPatients(q);
            if (result.isSuccess) {
                setPatientResults(result.data || []);
                setShowDropdown(true);
            }
        } catch { }
    };

    const selectPatient = (p) => {
        setSelectedPatient(p);
        setForm({ ...form, patientId: p.id });
        setPatientSearch(p.fullName);
        setShowDropdown(false);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.patientId) { toast.error(t('addVisit.selectPatientError')); return; }
        setLoading(true);
        try {
            const dto = {
                patientId: Number(form.patientId),
                doctorId: Number(form.doctorId),
                type: Number(form.type),
                fee: Number(form.fee),
                notes: form.notes || null,
            };
            const result = await addVisit(dto);
            if (result.isSuccess) {
                toast.success(t('addVisit.success'));
                navigate('/visits');
            } else toast.error(result.message || t('addVisit.failed'));
        } catch (err) {
            toast.error(err.response?.data?.message || t('addVisit.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn--secondary btn--sm" onClick={() => navigate('/visits')}>
                    <FiArrowLeft className="icon-flip-rtl" /> {t('common.back')}
                </button>
                <div>
                    <h1 className="page-header__title">{t('addVisit.title')}</h1>
                    <p className="page-header__subtitle">{t('addVisit.subtitle')}</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
                    {/* Patient Search */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">{t('addVisit.patientLabel')}</label>
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{
                                position: 'absolute',
                                left: isRtl ? 'auto' : 14,
                                right: isRtl ? 14 : 'auto',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)',
                            }} />
                            <input
                                type="text"
                                value={patientSearch}
                                onChange={(e) => handleSearchPatients(e.target.value)}
                                onFocus={() => patientResults.length > 0 && setShowDropdown(true)}
                                className="form-input"
                                style={{
                                    paddingLeft: isRtl ? 16 : 40,
                                    paddingRight: isRtl ? 40 : 16,
                                }}
                                placeholder={t('addVisit.searchPatientPlaceholder')}
                                required
                            />
                        </div>
                        {showDropdown && patientResults.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)', maxHeight: 200, overflowY: 'auto',
                                boxShadow: 'var(--shadow-lg)', marginTop: 4
                            }}>
                                {patientResults.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => selectPatient(p)}
                                        style={{
                                            padding: '10px 16px', cursor: 'pointer', fontSize: '0.88rem',
                                            borderBottom: '1px solid var(--color-border)',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <strong>{p.fullName}</strong>
                                        <span style={{ color: 'var(--color-text-muted)', marginInlineStart: 8 }}>{p.phoneNumber}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">{t('addVisit.visitTypeLabel')}</label>
                            <select name="type" value={form.type} onChange={handleChange} className="form-select">
                                {MedicalVisitOptionsList.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.value === 1 ? t('enums.visitType.new') : t('enums.visitType.followUp')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('addVisit.feeLabel')}</label>
                            <input type="number" name="fee" value={form.fee} onChange={handleChange} className="form-input" placeholder="0.00" step="0.01" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('addVisit.notesLabel')}</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} className="form-textarea" placeholder={t('common.notesPlaceholder')} />
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : <><FiSave /> {t('addVisit.createVisit')}</>}
                        </button>
                        <button type="button" className="btn btn--secondary btn--lg" onClick={() => navigate('/visits')}>{t('common.cancel')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVisitPage;
