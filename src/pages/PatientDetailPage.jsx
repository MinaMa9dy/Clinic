import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPatientById, updateMedicalHistory, deletePatient } from '../api/patientApi';
import { getVisitsByPatient, deleteVisit } from '../api/visitApi';
import { getAllergiesByPatientId, addAllergy, deleteAllergy } from '../api/allergyApi';
import { addBloodPressure, deleteBloodPressure } from '../api/bloodPressureApi';
import { addBloodGlucose, deleteBloodGlucose } from '../api/bloodGlucoseApi';
import { toast } from 'react-toastify';
import { GenderOptions, BloodTypeOptions, MedicalVisitOptions, BloodGlucoseOptions, BloodGlucoseOptionsList } from '../utils/enums';
import { FiArrowLeft, FiUser, FiCalendar, FiPlus, FiTrash2, FiActivity, FiDroplet, FiHeart, FiAlertCircle, FiX, FiClipboard } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import './PatientDetailPage.css';

const PatientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [visits, setVisits] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Allergy form
    const [allergyForm, setAllergyForm] = useState({ name: '', description: '' });
    const [showAllergyForm, setShowAllergyForm] = useState(false);

    // Blood Pressure form
    const [bpForm, setBpForm] = useState({ systolic: '', diastolic: '', pulse: '' });
    const [showBpForm, setShowBpForm] = useState(false);

    const [bgForm, setBgForm] = useState({ type: 1, result: '' });
    const [showBgForm, setShowBgForm] = useState(false);

    // Medical History
    const [history, setHistory] = useState('');
    const [isSavingHistory, setIsSavingHistory] = useState(false);

    // Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => { },
        title: '',
        message: ''
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [patientRes, visitsRes, allergiesRes] = await Promise.all([
                getPatientById(id),
                getVisitsByPatient(id),
                getAllergiesByPatientId(id),
            ]);
            if (patientRes.isSuccess) {
                setPatient(patientRes.data);
                setHistory(patientRes.data.medicalHistory || '');
            }
            if (visitsRes.isSuccess) setVisits(visitsRes.data || []);
            if (allergiesRes.isSuccess) setAllergies(allergiesRes.data || []);
        } catch (err) {
            toast.error('Failed to load patient data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHistory = async () => {
        setIsSavingHistory(true);
        try {
            const result = await updateMedicalHistory(id, history);
            if (result.isSuccess) {
                toast.success('Medical history updated');
                setPatient(prev => ({ ...prev, medicalHistory: history }));
            } else {
                toast.error(result.message || 'Failed to update history');
            }
        } catch (error) {
            toast.error('An error occurred while saving history');
        } finally {
            setIsSavingHistory(false);
        }
    };

    const handleAddAllergy = async (e) => {
        e.preventDefault();
        try {
            const result = await addAllergy(allergyForm.name, allergyForm.description, Number(id));
            if (result.isSuccess) {
                toast.success('Allergy added');
                setAllergyForm({ name: '', description: '' });
                setShowAllergyForm(false);
                loadData();
            } else toast.error(result.message);
        } catch { toast.error('Failed to add allergy'); }
    };

    const handleAddBP = async (e) => {
        e.preventDefault();
        try {
            const dto = { patientId: Number(id), systolic: Number(bpForm.systolic), diastolic: Number(bpForm.diastolic), pulse: Number(bpForm.pulse) };
            const result = await addBloodPressure(dto);
            if (result.isSuccess) {
                toast.success('Blood pressure recorded');
                setBpForm({ systolic: '', diastolic: '', pulse: '' });
                setShowBpForm(false);
                loadData();
            } else toast.error(result.message);
        } catch { toast.error('Failed to add blood pressure'); }
    };

    const handleAddBG = async (e) => {
        e.preventDefault();
        try {
            const dto = { patientId: Number(id), type: Number(bgForm.type), result: bgForm.result };
            const result = await addBloodGlucose(dto);
            if (result.isSuccess) {
                toast.success('Blood glucose recorded');
                setBgForm({ type: 1, result: '' });
                setShowBgForm(false);
                loadData();
            } else toast.error(result.message);
        } catch { toast.error('Failed to add blood glucose'); }
    };

    const handleDeleteBP = (bpId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete BP Record',
            message: 'Are you sure you want to remove this blood pressure reading?',
            onConfirm: async () => {
                try {
                    await deleteBloodPressure(bpId);
                    toast.success('Blood pressure deleted');
                    loadData();
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const handleDeleteBG = (bgId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Glucose Record',
            message: 'Are you sure you want to remove this blood glucose reading?',
            onConfirm: async () => {
                try {
                    await deleteBloodGlucose(bgId);
                    toast.success('Blood glucose deleted');
                    loadData();
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const handleDeleteVisit = (visitId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Visit',
            message: 'Are you sure you want to permanently delete this medical visit record?',
            onConfirm: async () => {
                try {
                    const result = await deleteVisit(visitId);
                    if (result.isSuccess) {
                        toast.success('Visit deleted successfully');
                        loadData();
                    } else {
                        toast.error(result.message || 'Failed to delete visit');
                    }
                } catch {
                    toast.error('An error occurred while deleting the visit');
                }
            }
        });
    };

    const handleDeleteAllergy = (allergyId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Allergy',
            message: 'Are you sure you want to remove this allergy record?',
            onConfirm: async () => {
                try {
                    const result = await deleteAllergy(allergyId);
                    if (result.isSuccess) {
                        toast.success('Allergy removed');
                        loadData();
                    } else toast.error(result.message);
                } catch { toast.error('Failed to remove allergy'); }
            }
        });
    };

    const handleDeletePatient = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Patient Record',
            message: `Are you sure you want to permanently delete patient "${patient.fullName}"? This action cannot be undone and will remove all medical history, visits, and vital records.`,
            onConfirm: async () => {
                try {
                    const result = await deletePatient(id);
                    if (result.isSuccess) {
                        toast.success('Patient record deleted successfully');
                        navigate('/patients');
                    } else {
                        toast.error(result.message || 'Failed to delete patient');
                    }
                } catch {
                    toast.error('An error occurred while deleting the patient record');
                }
            }
        });
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!patient) return <div className="empty-state"><h3 className="empty-state__title">Patient not found</h3></div>;

    const tabs = [
        { key: 'overview', label: 'Overview', icon: <FiUser /> },
        { key: 'visits', label: 'Visits', icon: <FiCalendar /> },
        { key: 'vitals', label: 'Vitals', icon: <FiActivity /> },
        { key: 'allergies', label: 'Allergies', icon: <FiAlertCircle /> },
    ];

    return (
        <div className="patient-detail fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn--secondary btn--sm" onClick={() => navigate('/patients')}>
                    <FiArrowLeft /> Back
                </button>
                <div>
                    <h1 className="page-header__title">{patient.fullName}</h1>
                    <p className="page-header__subtitle">Patient Profile</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <button className="btn btn--danger btn--sm" onClick={handleDeletePatient}>
                        <FiTrash2 /> Delete Patient
                    </button>
                </div>
            </div>

            {/* Profile Card */}
            <div className="card patient-profile">
                <div className="patient-profile__avatar">
                    <FiUser />
                </div>
                <div className="patient-profile__grid">
                    <div className="patient-profile__item">
                        <span className="patient-profile__label">Gender</span>
                        <span className="patient-profile__value">{GenderOptions[patient.gender] || '—'}</span>
                    </div>
                    <div className="patient-profile__item">
                        <span className="patient-profile__label">Blood Type</span>
                        <span className="patient-profile__value badge badge--danger">{BloodTypeOptions[patient.bloodType] || '—'}</span>
                    </div>
                    <div className="patient-profile__item">
                        <span className="patient-profile__label">Phone</span>
                        <span className="patient-profile__value">{patient.phoneNumber || '—'}</span>
                    </div>
                    <div className="patient-profile__item">
                        <span className="patient-profile__label">Address</span>
                        <span className="patient-profile__value">{patient.address || '—'}</span>
                    </div>
                    <div className="patient-profile__item">
                        <span className="patient-profile__label">Date of Birth</span>
                        <span className="patient-profile__value">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '—'}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`detail-tabs__btn ${activeTab === tab.key ? 'detail-tabs__btn--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="detail-tab-content">
                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="grid-3">
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Total Visits</h3>
                            <p style={{ fontSize: '1.6rem', fontWeight: 800 }}>{visits.length}</p>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Allergies</h3>
                            <p style={{ fontSize: '1.6rem', fontWeight: 800 }}>{allergies.length}</p>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>BP Records</h3>
                            <p style={{ fontSize: '1.6rem', fontWeight: 800 }}>{patient.bloodPressures?.length || 0}</p>
                        </div>

                        <div className="card" style={{ gridColumn: 'span 3' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiClipboard color="var(--color-primary)" /> Medical History
                                </h3>
                                {history !== (patient.medicalHistory || '') && (
                                    <button
                                        className="btn btn--primary btn--sm"
                                        onClick={handleSaveHistory}
                                        disabled={isSavingHistory}
                                    >
                                        {isSavingHistory ? 'Saving...' : 'Save Changes'}
                                    </button>
                                )}
                            </div>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: 150, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                                placeholder="Enter patient's medical history, past surgeries, chronic conditions, etc..."
                                value={history}
                                onChange={(e) => setHistory(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Visits */}
                {activeTab === 'visits' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            <Link to="/visits/add" className="btn btn--primary btn--sm"><FiPlus /> New Visit</Link>
                        </div>
                        {visits.length === 0 ? (
                            <div className="empty-state"><p className="empty-state__text">No visits yet</p></div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Fee</th>
                                            <th>Notes</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visits.map((v) => (
                                            <tr key={v.id}>
                                                <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                                                <td><span className={`badge ${v.type === 1 ? 'badge--primary' : 'badge--warning'}`}>{MedicalVisitOptions[v.type]}</span></td>
                                                <td>${v.fee}</td>
                                                <td>{v.notes || '—'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <Link to={`/visits/${v.id}`} className="btn btn--secondary btn--sm">View</Link>
                                                        <button
                                                            onClick={() => handleDeleteVisit(v.id)}
                                                            className="btn btn--danger btn--sm"
                                                            title="Delete Visit"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Vitals */}
                {activeTab === 'vitals' && (
                    <div className="grid-2">
                        {/* Blood Pressure */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><FiHeart color="var(--color-danger)" /> Blood Pressure</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowBpForm(!showBpForm)}><FiPlus /></button>
                            </div>
                            {showBpForm && (
                                <form onSubmit={handleAddBP} style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <input type="number" placeholder="Systolic" value={bpForm.systolic} onChange={(e) => setBpForm({ ...bpForm, systolic: e.target.value })} className="form-input" style={{ flex: 1, minWidth: 80 }} required />
                                    <input type="number" placeholder="Diastolic" value={bpForm.diastolic} onChange={(e) => setBpForm({ ...bpForm, diastolic: e.target.value })} className="form-input" style={{ flex: 1, minWidth: 80 }} required />
                                    <input type="number" placeholder="Pulse" value={bpForm.pulse} onChange={(e) => setBpForm({ ...bpForm, pulse: e.target.value })} className="form-input" style={{ flex: 1, minWidth: 80 }} required />
                                    <button type="submit" className="btn btn--primary btn--sm">Add</button>
                                </form>
                            )}
                            {(patient.bloodPressures?.length || 0) === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No records</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {patient.bloodPressures?.map((bp) => (
                                        <div key={bp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--color-hover)', borderRadius: 10, fontSize: '0.85rem' }}>
                                            <span><strong>{bp.systolic}/{bp.diastolic}</strong> mmHg · Pulse: {bp.pulse}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{new Date(bp.recordedAt).toLocaleDateString()}</span>
                                                <button onClick={() => handleDeleteBP(bp.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }}><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Blood Glucose */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><FiDroplet color="var(--color-accent)" /> Blood Glucose</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowBgForm(!showBgForm)}><FiPlus /></button>
                            </div>
                            {showBgForm && (
                                <form onSubmit={handleAddBG} style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <select value={bgForm.type} onChange={(e) => setBgForm({ ...bgForm, type: e.target.value })} className="form-select" style={{ flex: 1, minWidth: 120 }}>
                                        {BloodGlucoseOptionsList.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <input type="text" placeholder="Result (mg/dL)" value={bgForm.result} onChange={(e) => setBgForm({ ...bgForm, result: e.target.value })} className="form-input" style={{ flex: 1, minWidth: 100 }} required />
                                    <button type="submit" className="btn btn--primary btn--sm">Add</button>
                                </form>
                            )}
                            {(patient.bloodGlucoses?.length || 0) === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No records</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {patient.bloodGlucoses?.map((bg) => (
                                        <div key={bg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--color-hover)', borderRadius: 10, fontSize: '0.85rem' }}>
                                            <span><strong>{bg.result}</strong> mg/dL · {BloodGlucoseOptions[bg.type]}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{new Date(bg.recordedAt).toLocaleDateString()}</span>
                                                <button onClick={() => handleDeleteBG(bg.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }}><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Allergies */}
                {activeTab === 'allergies' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Allergies</h3>
                            <button className="btn btn--primary btn--sm" onClick={() => setShowAllergyForm(!showAllergyForm)}><FiPlus /> Add</button>
                        </div>
                        {showAllergyForm && (
                            <form onSubmit={handleAddAllergy} style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <input type="text" placeholder="Allergy name" value={allergyForm.name} onChange={(e) => setAllergyForm({ ...allergyForm, name: e.target.value })} className="form-input" style={{ flex: 1, minWidth: 150 }} required />
                                <input type="text" placeholder="Description (optional)" value={allergyForm.description} onChange={(e) => setAllergyForm({ ...allergyForm, description: e.target.value })} className="form-input" style={{ flex: 1, minWidth: 150 }} />
                                <button type="submit" className="btn btn--primary btn--sm">Save</button>
                            </form>
                        )}
                        {allergies.length === 0 ? (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No allergies recorded</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {allergies.map((a) => (
                                    <div key={a.id} className="badge badge--danger" style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <FiAlertCircle size={13} />
                                            <strong>{a.name}</strong> {a.description && `— ${a.description}`}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAllergy(a.id)}
                                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 2, borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }}
                                            title="Remove Allergy"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
};

export default PatientDetailPage;
