import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
    const { t, lang, isRtl } = useLanguage();
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

    const [activeTab, setActiveTab] = useState('examinations');

    // Local lists
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

    const handleUpdateVisit = async (e) => {
        e.preventDefault();
        try {
            const dto = {
                ...visitForm,
                patientId: Number(visitForm.patientId),
                doctorId: Number(visitForm.doctorId),
                type: Number(visitForm.type),
                fee: Number(visitForm.fee),
                notes: visitForm.notes || null,
            };
            const result = await updateVisit(dto);
            if (result.isSuccess) {
                toast.success(t('common.save'));
                setVisit({ ...visit, ...dto });
                setIsEditingVisit(false);
            } else {
                toast.error(result.message || 'Failed to update visit');
            }
        } catch (error) {
            toast.error('Failed to update visit');
        }
    };

    // Sub-item handlers
    const handleAddExam = async (e) => {
        e.preventDefault();
        try {
            const result = await addExamination(examForm.notes, visitId);
            if (result.isSuccess) {
                toast.success(t('common.save'));
                setExaminations([...examinations, result.data]);
                setExamForm({ notes: '' });
                setShowForm(false);
            } else toast.error(result.message);
        } catch { toast.error('Failed to add examination'); }
    };

    const handleAddDrug = async (e) => {
        e.preventDefault();
        try {
            const result = await addDrug(drugForm.drugName, drugForm.dose, visitId);
            if (result.isSuccess) {
                toast.success(t('common.save'));
                setDrugs([...drugs, result.data]);
                setDrugForm({ drugName: '', dose: '' });
                setShowForm(false);
            } else toast.error(result.message);
        } catch { toast.error('Failed to add drug'); }
    };

    const handleAddLab = async (e) => {
        e.preventDefault();
        try {
            const result = await addLabTest(labForm.notes, visitId);
            if (result.isSuccess) {
                toast.success(t('common.save'));
                setLabTests([...labTests, result.data]);
                setLabForm({ notes: '' });
                setShowForm(false);
            } else toast.error(result.message);
        } catch { toast.error('Failed to add lab test'); }
    };

    const handleAddRadio = async (e) => {
        e.preventDefault();
        try {
            const result = await addRadiology(radioForm.notes, visitId);
            if (result.isSuccess) {
                toast.success(t('common.save'));
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
            title: t('visitDetail.deleteExamTitle'),
            message: t('visitDetail.deleteExamConfirm'),
            onConfirm: async () => {
                try {
                    await deleteExamination(examId);
                    setExaminations(examinations.filter(e => e.id !== examId));
                    toast.success(t('common.delete'));
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const handleDeleteDrug = (drugId) => {
        setConfirmModal({
            isOpen: true,
            title: t('visitDetail.deleteDrugTitle'),
            message: t('visitDetail.deleteDrugConfirm'),
            onConfirm: async () => {
                try {
                    await deleteDrug(drugId);
                    setDrugs(drugs.filter(d => d.id !== drugId));
                    toast.success(t('common.delete'));
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const handleDeleteLab = (labId) => {
        setConfirmModal({
            isOpen: true,
            title: t('visitDetail.deleteLabTitle'),
            message: t('visitDetail.deleteLabConfirm'),
            onConfirm: async () => {
                try {
                    await deleteLabTest(labId);
                    setLabTests(labTests.filter(l => l.id !== labId));
                    toast.success(t('common.delete'));
                } catch { toast.error('Failed to delete'); }
            }
        });
    };

    const handleDeleteRadio = (rId) => {
        setConfirmModal({
            isOpen: true,
            title: t('visitDetail.deleteRadioTitle'),
            message: t('visitDetail.deleteRadioConfirm'),
            onConfirm: async () => {
                try {
                    await deleteRadiology(rId);
                    toast.success(t('common.remove'));
                    setRadiologies(radiologies.filter(r => r.id !== rId));
                } catch { toast.error('Failed to remove radiology'); }
            }
        });
    };

    const handlePrintPrescription = () => {
        if (!drugs || drugs.length === 0) {
            toast.info(t('visitDetail.noDrugsToPrint'));
            return;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=900');
        const dateStr = new Date(visit?.visitDate).toLocaleDateString();

        const html = `
            <html dir="${isRtl ? 'rtl' : 'ltr'}" lang="${lang}">
            <head>
                <title>${isRtl ? 'روشتة طبية' : 'Prescription'} - ${patient?.fullName || 'Patient'}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; direction: ${isRtl ? 'rtl' : 'ltr'}; }
                    .header { border-bottom: 3px solid #14b8a6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .clinic-name { font-size: 28px; font-weight: 800; color: #14b8a6; margin: 0; text-transform: uppercase; }
                    .rx-symbol { font-size: 48px; font-weight: bold; color: #14b8a6; margin-top: 20px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 40px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
                    .info-item b { color: #555; font-size: 0.9em; text-transform: uppercase; margin-inline-end: 10px; }
                    .drug-list { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .drug-item { font-size: 1.1em; border-bottom: 1px solid #eee; padding: 15px 5px; }
                    .drug-name { font-weight: bold; font-size: 1.2em; }
                    .drug-dose { color: #666; margin-inline-start: 15px; font-style: italic; }
                    .footer { margin-top: 100px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .signature { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 10px; font-weight: bold; }
                    .doctor-info { text-align: ${isRtl ? 'left' : 'right'}; }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="clinic-name">🏥 ${t('nav.brand')}</h1>
                        <p style="margin: 5px 0 0; color: #666;">${isRtl ? 'العيادة التخصصية المتكاملة' : 'Specialized Medical Clinic'}</p>
                    </div>
                    <div class="doctor-info">
                        <h3 style="margin: 0;">${t('nav.doctorPrefix')}${doctor?.fullName || 'Doctor'}</h3>
                        <p style="margin: 0; color: #666;">${doctor?.email || ''}</p>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item"><b>${t('addVisit.patientLabel').replace('*', '').trim()}:</b> ${patient?.fullName || '—'}</div>
                    <div class="info-item"><b>${t('common.date')}:</b> ${dateStr}</div>
                    <div class="info-item"><b>${t('patientDetail.phone')}:</b> ${patient?.phoneNumber || '—'}</div>
                    <div class="info-item"><b>${t('patientDetail.bloodType')}:</b> ${patient?.bloodType ? patient.bloodType : '—'}</div>
                </div>

                <div class="rx-symbol">℞</div>

                <table class="drug-list">
                    <tbody>
                        ${drugs.map((d, index) => `
                            <tr class="drug-item">
                                <td style="width: 40px; font-weight: bold; color: #888;">${index + 1}.</td>
                                <td>
                                    <span class="drug-name">${d.drugName}</span>
                                    <span class="drug-dose">(${d.dose})</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <div>
                        <p style="font-size: 0.85em; color: #888; margin: 0;">${isRtl ? 'نتمنى لكم الشفاء العاجل' : 'Wishing you a speedy recovery'}</p>
                    </div>
                    <div class="signature">
                        ${isRtl ? 'توقيع الطبيب' : "Doctor's Signature"}
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const tabs = [
        { key: 'examinations', label: t('visitDetail.tabExaminations'), icon: <FiClipboard /> },
        { key: 'drugs', label: t('visitDetail.tabDrugs'), icon: <FiPackage /> },
        { key: 'labTests', label: t('visitDetail.tabLabTests'), icon: <FiActivity /> },
        { key: 'radiology', label: t('visitDetail.tabRadiology'), icon: <FiImage /> },
    ];

    return (
        <div className="visit-detail fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn--secondary btn--sm" onClick={() => navigate('/visits')}>
                    <FiArrowLeft className="icon-flip-rtl" /> {t('common.back')}
                </button>
                <div>
                    <h1 className="page-header__title">{t('visitDetail.visitNumber', { id: visitId })}</h1>
                    <p className="page-header__subtitle">{t('visitDetail.subtitle')}</p>
                </div>
                {!loading && visit && (
                    <div style={{ marginInlineStart: 'auto' }}>
                        <button className="btn btn--primary btn--sm" onClick={() => setIsEditingVisit(!isEditingVisit)}>
                            {isEditingVisit ? t('visitDetail.cancelEdit') : t('visitDetail.editVisit')}
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
                                        <label className="form-label">{t('common.type')}</label>
                                        <select className="form-select" value={visitForm.type} onChange={e => setVisitForm({ ...visitForm, type: parseInt(e.target.value) })}>
                                            <option value={1}>{t('visitDetail.regularType')}</option>
                                            <option value={2}>{t('visitDetail.followUpType')}</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <label className="form-label">{t('common.fee')}</label>
                                        <input type="number" className="form-input" value={visitForm.fee} onChange={e => setVisitForm({ ...visitForm, fee: e.target.value })} required />
                                    </div>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <label className="form-label">{t('common.notes')}</label>
                                    <textarea className="form-textarea" value={visitForm.notes} onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })} />
                                </div>
                                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn btn--primary">{t('patientDetail.saveChanges')}</button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid-4" style={{ gap: 16 }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('common.date')}</span>
                                    <div style={{ fontWeight: 600 }}>{new Date(visit.visitDate).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('common.type')}</span>
                                    <div>
                                        <span className={`badge ${visit.type === 1 ? 'badge--primary' : 'badge--warning'}`}>
                                            {visit.type === 1 ? t('enums.visitType.new') : t('enums.visitType.followUp')}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('common.fee')}</span>
                                    <div style={{ fontWeight: 600 }}>${visit.fee}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('common.notes')}</span>
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
                                <h3>{t('visitDetail.tabExaminations')}</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(!showForm)}><FiPlus /> {t('common.add')}</button>
                            </div>
                            {showForm && (
                                <form onSubmit={handleAddExam} className="visit-inline-form">
                                    <textarea value={examForm.notes} onChange={(e) => setExamForm({ notes: e.target.value })} className="form-textarea" placeholder={t('visitDetail.examinationNotesPlaceholder')} />
                                    <button type="submit" className="btn btn--primary btn--sm">{t('common.save')}</button>
                                </form>
                            )}
                            {examinations.length === 0 ? (
                                <p className="visit-empty-text">{t('visitDetail.noExaminations')}</p>
                            ) : (
                                <div className="visit-items-list">
                                    {examinations.map((item) => (
                                        <div key={item.id} className="visit-item">
                                            <span>{item.notes || '—'}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => setPhotoModal({ isOpen: true, ownerId: item.id, ownerType: 1, title: t('visitDetail.examPhotosTitle') })}
                                                    className="btn btn--secondary btn--sm"
                                                    style={{ padding: '4px 8px' }}
                                                    title={t('common.photos')}
                                                >
                                                    <FiImage size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteExam(item.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }} title={t('common.delete')}><FiTrash2 size={14} /></button>
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
                                    <h3>{t('visitDetail.prescriptions')}</h3>
                                    {drugs.length > 0 && (
                                        <button className="btn btn--secondary btn--sm" onClick={handlePrintPrescription} title={t('visitDetail.printPrescription')}>
                                            <FiPrinter /> {t('common.print')}
                                        </button>
                                    )}
                                </div>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(!showForm)}><FiPlus /> {t('common.add')}</button>
                            </div>
                            {showForm && (
                                <form onSubmit={handleAddDrug} className="visit-inline-form" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    <input type="text" value={drugForm.drugName} onChange={(e) => setDrugForm({ ...drugForm, drugName: e.target.value })} className="form-input" placeholder={t('visitDetail.drugName')} style={{ flex: 1, minWidth: 150 }} required />
                                    <input type="text" value={drugForm.dose} onChange={(e) => setDrugForm({ ...drugForm, dose: e.target.value })} className="form-input" placeholder={t('visitDetail.dose')} style={{ flex: 1, minWidth: 100 }} required />
                                    <button type="submit" className="btn btn--primary btn--sm">{t('common.save')}</button>
                                </form>
                            )}
                            {drugs.length === 0 ? (
                                <p className="visit-empty-text">{t('visitDetail.noDrugsPrescribed')}</p>
                            ) : (
                                <div className="visit-items-list">
                                    {drugs.map((item) => (
                                        <div key={item.id} className="visit-item">
                                            <div>
                                                <strong>{item.drugName}</strong>
                                                <span style={{ color: 'var(--color-text-muted)', marginInlineStart: 8 }}>{t('visitDetail.dose')}: {item.dose}</span>
                                            </div>
                                            <button onClick={() => handleDeleteDrug(item.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }} title={t('common.delete')}><FiTrash2 size={14} /></button>
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
                                <h3>{t('visitDetail.tabLabTests')}</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(!showForm)}><FiPlus /> {t('common.add')}</button>
                            </div>
                            {showForm && (
                                <form onSubmit={handleAddLab} className="visit-inline-form">
                                    <textarea value={labForm.notes} onChange={(e) => setLabForm({ notes: e.target.value })} className="form-textarea" placeholder={t('visitDetail.labTestNotesPlaceholder')} />
                                    <button type="submit" className="btn btn--primary btn--sm">{t('common.save')}</button>
                                </form>
                            )}
                            {labTests.length === 0 ? (
                                <p className="visit-empty-text">{t('visitDetail.noLabTests')}</p>
                            ) : (
                                <div className="visit-items-list">
                                    {labTests.map((item) => (
                                        <div key={item.id} className="visit-item">
                                            <span>{item.notes || '—'}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => setPhotoModal({ isOpen: true, ownerId: item.id, ownerType: 2, title: t('visitDetail.labPhotosTitle') })}
                                                    className="btn btn--secondary btn--sm"
                                                    style={{ padding: '4px 8px' }}
                                                    title={t('common.photos')}
                                                >
                                                    <FiImage size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteLab(item.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }} title={t('common.delete')}><FiTrash2 size={14} /></button>
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
                                <h3>{t('visitDetail.tabRadiology')}</h3>
                                <button className="btn btn--primary btn--sm" onClick={() => setShowForm(!showForm)}><FiPlus /> {t('common.add')}</button>
                            </div>
                            {showForm && (
                                <form onSubmit={handleAddRadio} className="visit-inline-form">
                                    <textarea value={radioForm.notes} onChange={(e) => setRadioForm({ notes: e.target.value })} className="form-textarea" placeholder={t('visitDetail.radiologyNotesPlaceholder')} />
                                    <button type="submit" className="btn btn--primary btn--sm">{t('common.save')}</button>
                                </form>
                            )}
                            {radiologies.length === 0 ? (
                                <p className="visit-empty-text">{t('visitDetail.noRadiology')}</p>
                            ) : (
                                <div className="visit-items-list">
                                    {radiologies.map((item) => (
                                        <div key={item.id} className="visit-item">
                                            <span>{item.notes || '—'}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => setPhotoModal({ isOpen: true, ownerId: item.id, ownerType: 3, title: t('visitDetail.radiologyPhotosTitle') })}
                                                    className="btn btn--secondary btn--sm"
                                                    style={{ padding: '4px 8px' }}
                                                    title={t('common.photos')}
                                                >
                                                    <FiImage size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteRadio(item.id)} className="btn btn--danger btn--sm" style={{ padding: '4px 8px' }} title={t('common.delete')}><FiTrash2 size={14} /></button>
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
