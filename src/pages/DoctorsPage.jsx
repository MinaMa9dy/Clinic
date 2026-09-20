import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, deleteDoctor } from '../api/doctorApi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiUserPlus, FiTrash2 } from 'react-icons/fi';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const { t } = useLanguage();
    const { doctor } = useAuth();
    const navigate = useNavigate();
    const isAdmin = doctor?.role === 'Admin';

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const result = await getDoctors();
            if (result.isSuccess) {
                setDoctors(result.data || []);
            } else {
                toast.error(result.message || t('doctors.loadFailed'));
            }
        } catch {
            toast.error(t('doctors.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (doc) => {
        setDoctorToDelete(doc);
        setDeleteModalOpen(true);
    };

    const handleDeleteDoctor = async () => {
        if (!doctorToDelete) return;
        setDeleting(true);
        try {
            const result = await deleteDoctor(doctorToDelete.id);
            if (result.isSuccess !== false) {
                toast.success(t('doctors.deleteSuccess'));
                setDoctors((prev) => prev.filter((d) => d.id !== doctorToDelete.id));
            } else {
                toast.error(result.message || t('doctors.deleteFailed'));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || t('doctors.deleteFailed'));
        } finally {
            setDeleting(false);
            setDoctorToDelete(null);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-header__title">{t('doctors.title')}</h1>
                    <p className="page-header__subtitle">{t('doctors.subtitle')}</p>
                </div>
                {isAdmin && (
                    <button
                        className="btn btn--primary"
                        onClick={() => navigate('/doctors/add')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <FiUserPlus /> {t('doctors.addDoctorBtn')}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading"><div className="spinner"></div></div>
            ) : doctors.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">👨‍⚕️</div>
                    <h3 className="empty-state__title">{t('doctors.noDoctorsFound')}</h3>
                    <p className="empty-state__text">{t('doctors.noDoctorsSub')}</p>
                </div>
            ) : (
                <div className="grid-3">
                    {doctors.map((doc) => (
                        <div key={doc.id} className="card" style={{ textAlign: 'center', padding: 28, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: 14,
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 14px',
                                fontSize: '1.4rem',
                                color: '#fff',
                            }}>
                                {doc.fullName?.charAt(0)?.toUpperCase() || <FiUser />}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{doc.fullName}</h3>
                            <span className="badge badge--primary" style={{ marginBottom: 12, alignSelf: 'center' }}>
                                {doc.gender === 1 ? t('enums.gender.male') : doc.gender === 2 ? t('enums.gender.female') : '—'}
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 8, flex: 1 }}>
                                {doc.email && (<span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><FiMail size={13} /> {doc.email}</span>)}
                                {doc.phoneNumber && (<span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><FiPhone size={13} /> {doc.phoneNumber}</span>)}
                            </div>

                            {/* Admin only: Delete Doctor Button */}
                            {isAdmin && (
                                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                                    <button
                                        type="button"
                                        className="btn btn--danger btn--sm btn--block"
                                        onClick={() => openDeleteModal(doc)}
                                        disabled={deleting && doctorToDelete?.id === doc.id}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                    >
                                        <FiTrash2 size={14} /> {t('doctors.deleteDoctorBtn')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal for Admin */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDoctorToDelete(null);
                }}
                onConfirm={handleDeleteDoctor}
                title={t('doctors.deleteTitle')}
                message={
                    doctorToDelete
                        ? `${t('doctors.deleteConfirm')} (${doctorToDelete.fullName || doctorToDelete.email})`
                        : t('doctors.deleteConfirm')
                }
                confirmText={deleting ? t('doctors.deleting') : t('common.delete')}
                type="danger"
            />
        </div>
    );
};

export default DoctorsPage;
