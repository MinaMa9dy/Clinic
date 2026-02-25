import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MedicalVisitOptions } from '../utils/enums';
import { getVisitById } from '../api/visitApi';
import { addExamination, deleteExamination } from '../api/examinationApi';
import { addDrug, deleteDrug } from '../api/drugApi';
import { addLabTest, deleteLabTest } from '../api/labTestApi';
import { addRadiology, deleteRadiology } from '../api/radiologyApi';
import { FiArrowLeft, FiPlus, FiTrash2, FiClipboard, FiPackage, FiActivity, FiImage } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import PhotoManager from '../components/PhotoManager';
import './VisitDetailPage.css';

const VisitDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const visitId = Number(id);
    const [loading, setLoading] = useState(true);

    // We'll store visit data from the visits we loaded earlier
    // Since there's no direct "get visit by id" endpoint, we pass data via location state or re-fetch by patient/doctor
    const [activeTab, setActiveTab] = useState('examinations');

    // Local lists (populated from visit data that gets returned with sub-items)
    const [examinations, setExaminations] = useState([]);
    const [drugs, setDrugs] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [radiologies, setRadiologies] = useState([]);

    // Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        onConfirm: () => { },
        title: '',
        message: ''
    });

    // Photo Modal state
    const [photoModal, setPhotoModal] = useState({
        isOpen: false,
        ownerId: null,
        ownerType: null,
        title: ''
    });

    useEffect(() => {
        const fetchVisit = async () => {
            setLoading(true);
            try {
                const result = await getVisitById(visitId);
                if (result.isSuccess) {
                    const visit = result.data;
                    setExaminations(visit.examinations || []);
                    setDrugs(visit.drugs || []);
                    setLabTests(visit.labTests || []);
                    setRadiologies(visit.radiologies || []);
                } else {
                    toast.error(result.message || 'Failed to load visit details');
                }
            } catch (error) {
                toast.error('Error fetching visit details');
            } finally {
                setLoading(false);
            }
        };
        if (visitId) fetchVisit();
    }, [visitId]);
    // Forms
    const [examForm, setExamForm] = useState({ notes: '' });
    const [drugForm, setDrugForm] = useState({ drugName: '', dose: '' });
    const [labForm, setLabForm] = useState({ notes: '' });
    const [radioForm, setRadioForm] = useState({ notes: '' });

    const [showForm, setShowForm] = useState(false);

    // Add handlers
    const handleAddExam = async (e) => {
        e.preventDefault();
        try {
            const result = await addExamination({ medicalVisitId: visitId, notes: examForm.notes || null });
            if (result.isSuccess) {
                toast.success('Examination added');
                setExaminations([...examinations, result.data]);
                setExamForm({ notes: '' });
                setShowForm(false);
            } else toast.error(result.message);
        } catch { toast.error('Failed to add examination'); }
    };

    const handleAddDrug = async (e) => {
        e.preventDefault();
        try {
            const result = await addDrug({ medicalVisitId: visitId, drugName: drugForm.drugName, dose: drugForm.dose });
            if (result.isSuccess) {
                toast.success('Drug added');
                setDrugs([...drugs, result.data]);
                setDrugForm({ drugName: '', dose: '' });
                setShowForm(false);
            } else toast.error(result.message);
        } catch { toast.error('Failed to add drug'); }
    };

    const handleAddLab = async (e) => {
        e.preventDefault();
        try {
            const result = await addLabTest({ medicalVisitId: visitId, notes: labForm.notes || null });
            if (result.isSuccess) {
                toast.success('Lab test added');
                setLabTests([...labTests, result.data]);
                setLabForm({ notes: '' });
                setShowForm(false);
            } else toast.error(result.message);
        } catch { toast.error('Failed to add lab test'); }
    };

    const handleAddRadio = async (e) => {
        e.preventDefault();
        try {
            const result = await addRadiology({ medicalVisitId: visitId, notes: radioForm.notes || null });
            if (result.isSuccess) {
                toast.success('Radiology added');
                setRadiologies([...radiologies, result.data]);
                setRadioForm({ notes: '' });
                setShowForm(false);
            } else toast.error(result.message);
        } catch { toast.error('Failed to add radiology'); }
    };

    // Delete handlers
    const handleDeleteExam = (examId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Examination',
            message: 'Are you sure you want to remove this examination record?',
            onConfirm: async () => {
                try {
                    await deleteExamination(examId);
                    setExaminations(examinations.filter(e => e.id !== examId));
                    toast.success('Examination deleted');
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const handleDeleteDrug = (drugId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Drug',
            message: 'Are you sure you want to remove this prescription?',
            onConfirm: async () => {
                try {
                    await deleteDrug(drugId);
                    setDrugs(drugs.filter(d => d.id !== drugId));
                    toast.success('Drug deleted');
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const handleDeleteLab = (labId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Lab Test',
            message: 'Are you sure you want to remove this lab test result?',
            onConfirm: async () => {
                try {
                    await deleteLabTest(labId);
                    setLabTests(labTests.filter(l => l.id !== labId));
                    toast.success('Lab test deleted');
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const handleDeleteRadio = (radioId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Radiology',
            message: 'Are you sure you want to remove this radiology record?',
            onConfirm: async () => {
                try {
                    await deleteRadiology(radioId);
                    setRadiologies(radiologies.filter(r => r.id !== radioId));
                    toast.success('Radiology deleted');
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const tabs = [
        { key: 'examinations', label: 'Examinations', icon: <FiClipboard /> },
        { key: 'drugs', label: 'Drugs', icon: <FiPackage /> },
        { key: 'labTests', label: 'Lab Tests', icon: <FiActivity /> },
        { key: 'radiology', label: 'Radiology', icon: <FiImage /> },
    ];

    return (
        <div className="visit-detail fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn--secondary btn--sm" onClick={() => navigate('/visits')}>
                    <FiArrowLeft /> Back
                </button>
                <div>
                    <h1 className="page-header__title">Visit #{visitId}</h1>
                    <p className="page-header__subtitle">View and manage visit details</p>
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner"></div></div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="detail-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                className={`detail-tabs__btn ${activeTab === tab.key ? 'detail-tabs__btn--active' : ''}`}
                                onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Examinations */}
                    {activeTab === 'examinations' && (
                        <div className="card">
                            <div className="visit-section-header">
                                <h3>Examinations</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(!showForm)}><FiPlus /> Add</button>
                            </div>
                            {showForm && (
                                <form onSubmit={handleAddExam} className="visit-inline-form">
                                    <textarea value={examForm.notes} onChange={(e) => setExamForm({ notes: e.target.value })} className="form-textarea" placeholder="Examination notes..." />
                                    <button type="submit" className="btn btn--primary btn--sm">Save</button>
                                </form>
                            )}
                            {examinations.length === 0 ? (
                                <p className="visit-empty-text">No examinations added</p>
                            ) : (
                                <div className="visit-items-list">
                                    {examinations.map((item) => (
                                        <div key={item.id} className="visit-item">
                                            <span>{item.notes || 'No notes'}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => setPhotoModal({ isOpen: true, ownerId: item.id, ownerType: 1, title: 'Examination Photos' })}
                                                    className="btn btn--secondary btn--sm"
                                                    style={{ padding: '4px 8px' }}
                                                    title="Photos"
                                                >
                                                    <FiImage size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteExam(item.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }}><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Drugs */}
                    {activeTab === 'drugs' && (
                        <div className="card">
                            <div className="visit-section-header">
                                <h3>Prescriptions</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(!showForm)}><FiPlus /> Add</button>
                            </div>
                            {showForm && (
                                <form onSubmit={handleAddDrug} className="visit-inline-form" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    <input type="text" value={drugForm.drugName} onChange={(e) => setDrugForm({ ...drugForm, drugName: e.target.value })} className="form-input" placeholder="Drug name" style={{ flex: 1, minWidth: 150 }} required />
                                    <input type="text" value={drugForm.dose} onChange={(e) => setDrugForm({ ...drugForm, dose: e.target.value })} className="form-input" placeholder="Dose" style={{ flex: 1, minWidth: 100 }} required />
                                    <button type="submit" className="btn btn--primary btn--sm">Save</button>
                                </form>
                            )}
                            {drugs.length === 0 ? (
                                <p className="visit-empty-text">No drugs prescribed</p>
                            ) : (
                                <div className="visit-items-list">
                                    {drugs.map((item) => (
                                        <div key={item.id} className="visit-item">
                                            <div>
                                                <strong>{item.drugName}</strong>
                                                <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>Dose: {item.dose}</span>
                                            </div>
                                            <button onClick={() => handleDeleteDrug(item.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }}><FiTrash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lab Tests */}
                    {activeTab === 'labTests' && (
                        <div className="card">
                            <div className="visit-section-header">
                                <h3>Lab Tests</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(!showForm)}><FiPlus /> Add</button>
                            </div>
                            {showForm && (
                                <form onSubmit={handleAddLab} className="visit-inline-form">
                                    <textarea value={labForm.notes} onChange={(e) => setLabForm({ notes: e.target.value })} className="form-textarea" placeholder="Lab test notes..." />
                                    <button type="submit" className="btn btn--primary btn--sm">Save</button>
                                </form>
                            )}
                            {labTests.length === 0 ? (
                                <p className="visit-empty-text">No lab tests added</p>
                            ) : (
                                <div className="visit-items-list">
                                    {labTests.map((item) => (
                                        <div key={item.id} className="visit-item">
                                            <span>{item.notes || 'No notes'}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => setPhotoModal({ isOpen: true, ownerId: item.id, ownerType: 2, title: 'Lab Test Photos' })}
                                                    className="btn btn--secondary btn--sm"
                                                    style={{ padding: '4px 8px' }}
                                                    title="Photos"
                                                >
                                                    <FiImage size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteLab(item.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }}><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Radiology */}
                    {activeTab === 'radiology' && (
                        <div className="card">
                            <div className="visit-section-header">
                                <h3>Radiology</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(!showForm)}><FiPlus /> Add</button>
                            </div>
                            {showForm && (
                                <form onSubmit={handleAddRadio} className="visit-inline-form">
                                    <textarea value={radioForm.notes} onChange={(e) => setRadioForm({ notes: e.target.value })} className="form-textarea" placeholder="Radiology notes..." />
                                    <button type="submit" className="btn btn--primary btn--sm">Save</button>
                                </form>
                            )}
                            {radiologies.length === 0 ? (
                                <p className="visit-empty-text">No radiology records</p>
                            ) : (
                                <div className="visit-items-list">
                                    {radiologies.map((item) => (
                                        <div key={item.id} className="visit-item">
                                            <span>{item.notes || 'No notes'}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => setPhotoModal({ isOpen: true, ownerId: item.id, ownerType: 3, title: 'Radiology Photos' })}
                                                    className="btn btn--secondary btn--sm"
                                                    style={{ padding: '4px 8px' }}
                                                    title="Photos"
                                                >
                                                    <FiImage size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteRadio(item.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }}><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

            <PhotoManager
                isOpen={photoModal.isOpen}
                onClose={() => setPhotoModal({ ...photoModal, isOpen: false })}
                ownerId={photoModal.ownerId}
                ownerType={photoModal.ownerType}
                title={photoModal.title}
            />
        </div>
    );
};

export default VisitDetailPage;
