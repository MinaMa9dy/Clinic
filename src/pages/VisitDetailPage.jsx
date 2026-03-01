import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { MedicalVisitOptions } from '../utils/enums';
import { getVisitById, updateVisit } from '../api/visitApi';
import { getPatientById } from '../api/patientApi';
import { addExamination, deleteExamination } from '../api/examinationApi';
import { addDrug, deleteDrug } from '../api/drugApi';
import { addLabTest, deleteLabTest } from '../api/labTestApi';
import { addRadiology, deleteRadiology } from '../api/radiologyApi';
import { FiArrowLeft, FiPlus, FiTrash2, FiClipboard, FiPackage, FiActivity, FiImage, FiPrinter } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import PhotoManager from '../components/PhotoManager';
import './VisitDetailPage.css';

const VisitDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { doctor } = useAuth();
    const visitId = Number(id);
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState(null);

    const [visit, setVisit] = useState(null);
    const [isEditingVisit, setIsEditingVisit] = useState(false);
    const [visitForm, setVisitForm] = useState({
        id: visitId,
        patientId: 0,
        doctorId: doctor?.id || 0,
        type: 1,
        fee: '',
        notes: ''
    });

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
                    const visitObj = result.data;
                    setVisit(visitObj);
                    setVisitForm({
                        id: visitObj.id,
                        patientId: visitObj.patientId,
                        doctorId: visitObj.doctorId || doctor?.id || 0,
                        type: visitObj.type,
                        fee: visitObj.fee,
                        notes: visitObj.notes || ''
                    });
                    setExaminations(visitObj.examinations || []);
                    setDrugs(visitObj.drugs || []);
                    setLabTests(visitObj.labTests || []);
                    setRadiologies(visitObj.radiologies || []);

                    // Fetch patient details for the prescription
                    if (visitObj.patientId) {
                        const patResult = await getPatientById(visitObj.patientId);
                        if (patResult.isSuccess) setPatient(patResult.data);
                    }
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

    const handleUpdateVisit = async (e) => {
        e.preventDefault();
        try {
            const dto = {
                id: visitForm.id,
                patientId: Number(visitForm.patientId),
                doctorId: Number(visitForm.doctorId),
                type: Number(visitForm.type),
                fee: Number(visitForm.fee),
                notes: visitForm.notes
            };
            const result = await updateVisit(dto);
            if (result.isSuccess) {
                toast.success('Visit updated successfully');
                setVisit({ ...visit, ...dto });
                setIsEditingVisit(false);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error('Failed to update visit');
        }
    };

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

    const handleDeleteRadio = (rId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Radiology',
            message: 'Are you sure you want to remove this radiology record?',
            onConfirm: async () => {
                try {
                    await deleteRadiology(rId);
                    toast.success('Radiology record removed');
                    setRadiologies(radiologies.filter(r => r.id !== rId));
                } catch { toast.error('Failed to remove radiology'); }
            }
        });
    };

    const handlePrintPrescription = () => {
        if (!drugs || drugs.length === 0) {
            toast.info('No drugs to print');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=900');
        const dateStr = new Date(visit?.visitDate).toLocaleDateString();

        const html = `
            <html>
            <head>
                <title>Prescription - ${patient?.fullName || 'Patient'}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .header { border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .clinic-name { font-size: 28px; font-weight: 800; color: #007bff; margin: 0; text-transform: uppercase; }
                    .rx-symbol { font-size: 48px; font-weight: bold; color: #007bff; margin-top: 20px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 40px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
                    .info-item b { color: #555; font-size: 0.9em; text-transform: uppercase; margin-right: 10px; }
                    .drug-list { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .drug-item { font-size: 1.1em; border-bottom: 1px solid #eee; padding: 15px 5px; }
                    .drug-name { font-weight: bold; font-size: 1.2em; }
                    .drug-dose { color: #666; margin-left: 15px; font-style: italic; }
                    .footer { margin-top: 100px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .signature { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; font-weight: bold; }
                    .doctor-info { text-align: right; }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="clinic-name">MyClinic Medical Center</h1>
                        <p style="margin: 5px 0; color: #666;">High Quality Healthcare Services</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0;"><b>Date:</b> ${dateStr}</p>
                        <p style="margin: 0;"><b>Visit ID:</b> #${visitId}</p>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item"><b>Patient:</b> ${patient?.fullName || '—'}</div>
                    <div class="info-item"><b>Age:</b> ${patient?.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / 31557600000) : '—'}</div>
                    <div class="info-item"><b>Gender:</b> ${patient?.gender === 1 ? 'Male' : 'Female'}</div>
                    <div class="info-item"><b>Blood Type:</b> ${['—', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][patient?.bloodType] || '—'}</div>
                </div>

                <div class="rx-symbol">℞</div>
                
                <div class="drug-list">
                    ${drugs.map(drug => `
                        <div class="drug-item">
                            <span class="drug-name">${drug.drugName}</span>
                            <span class="drug-dose">${drug.dose}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="footer">
                    <div class="signature">Patient's Signature</div>
                    <div class="doctor-info">
                        <p style="margin: 0; font-size: 1.1em;"><b>Dr. ${doctor?.fullName || 'Medical Practitioner'}</b></p>
                        <p style="margin: 0; color: #666; font-size: 0.9em;">Medical Practitioner</p>
                        <div style="margin-top: 40px; border-top: 1px solid #000; width: 200px; display: inline-block;">Stamp / Signature</div>
                    </div>
                </div>

                <div class="no-print" style="margin-top: 50px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em;">Print Now</button>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
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
                {!loading && visit && (
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn btn--primary btn--sm" onClick={() => setIsEditingVisit(!isEditingVisit)}>
                            {isEditingVisit ? 'Cancel Edit' : 'Edit Visit'}
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading"><div className="spinner"></div></div>
            ) : (
                <>
                    {/* Visit Info */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        {isEditingVisit ? (
                            <form onSubmit={handleUpdateVisit} className="visit-inline-form" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <label className="form-label">Type</label>
                                        <select className="form-select" value={visitForm.type} onChange={e => setVisitForm({ ...visitForm, type: parseInt(e.target.value) })}>
                                            <option value={1}>Regular</option>
                                            <option value={2}>FollowUp</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <label className="form-label">Fee</label>
                                        <input type="number" className="form-input" value={visitForm.fee} onChange={e => setVisitForm({ ...visitForm, fee: e.target.value })} required />
                                    </div>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <label className="form-label">Notes</label>
                                    <textarea className="form-textarea" value={visitForm.notes} onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })} />
                                </div>
                                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn btn--primary">Save Changes</button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid-4" style={{ gap: 16 }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Date</span>
                                    <div style={{ fontWeight: 600 }}>{new Date(visit.visitDate).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Type</span>
                                    <div><span className={`badge ${visit.type === 1 ? 'badge--primary' : 'badge--warning'}`}>{MedicalVisitOptions[visit.type]}</span></div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Fee</span>
                                    <div style={{ fontWeight: 600 }}>${visit.fee}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Notes</span>
                                    <div>{visit.notes || '—'}</div>
                                </div>
                            </div>
                        )}
                    </div>

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
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <h3>Prescriptions</h3>
                                    {drugs.length > 0 && (
                                        <button className="btn btn--secondary btn--sm" onClick={handlePrintPrescription} title="Print Prescription">
                                            <FiPrinter /> Print
                                        </button>
                                    )}
                                </div>
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
