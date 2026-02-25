import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addVisit } from '../api/visitApi';
import { searchPatients } from '../api/patientApi';
import { toast } from 'react-toastify';
import { MedicalVisitOptionsList } from '../utils/enums';
import { FiSave, FiArrowLeft, FiSearch } from 'react-icons/fi';

const AddVisitPage = () => {
    const { doctor } = useAuth();
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
        if (!form.patientId) { toast.error('Please select a patient'); return; }
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
                toast.success('Visit created!');
                navigate('/visits');
            } else toast.error(result.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create visit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn--secondary btn--sm" onClick={() => navigate('/visits')}>
                    <FiArrowLeft /> Back
                </button>
                <div>
                    <h1 className="page-header__title">New Visit</h1>
                    <p className="page-header__subtitle">Schedule a new medical visit</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
                    {/* Patient Search */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Patient *</label>
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                value={patientSearch}
                                onChange={(e) => handleSearchPatients(e.target.value)}
                                onFocus={() => patientResults.length > 0 && setShowDropdown(true)}
                                className="form-input"
                                style={{ paddingLeft: 40 }}
                                placeholder="Search patient by name..."
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
                                        <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>{p.phoneNumber}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Visit Type *</label>
                            <select name="type" value={form.type} onChange={handleChange} className="form-select">
                                {MedicalVisitOptionsList.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fee *</label>
                            <input type="number" name="fee" value={form.fee} onChange={handleChange} className="form-input" placeholder="0.00" step="0.01" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} className="form-textarea" placeholder="Any additional notes..." />
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : <><FiSave /> Create Visit</>}
                        </button>
                        <button type="button" className="btn btn--secondary btn--lg" onClick={() => navigate('/visits')}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVisitPage;
