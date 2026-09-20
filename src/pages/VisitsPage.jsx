import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getVisitsByDoctor, deleteVisit } from '../api/visitApi';
import { toast } from 'react-toastify';
import { FiCalendar, FiPlus, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import './VisitsPage.css';

const VisitsPage = () => {
    const { doctor } = useAuth();
    const { t } = useLanguage();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, visitId: null });

    const handleDeleteVisit = (e, visitId) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmModal({ isOpen: true, visitId });
    };

    const confirmDelete = async () => {
        try {
            const result = await deleteVisit(confirmModal.visitId);
            if (result.isSuccess) {
                toast.success(t('visits.deleteSuccess'));
                fetchVisits(page);
            } else toast.error(result.message || t('visits.deleteFailed'));
        } catch { toast.error(t('visits.deleteFailed')); } finally {
            setConfirmModal({ isOpen: false, visitId: null });
        }
    };

    useEffect(() => {
        fetchVisits(1);
    }, [doctor?.id]);

    const fetchVisits = async (pageNum = 1) => {
        setLoading(true);
        try {
            if (doctor?.id) {
                const result = await getVisitsByDoctor(doctor.id, pageNum, PAGE_SIZE);
                if (result.isSuccess) {
                    setVisits(result.data || []);
                    setHasMore((result.data || []).length === PAGE_SIZE);
                    setPage(pageNum);
                }
                else toast.error(result.message || t('visits.loadFailed'));
            }
        } catch {
            toast.error(t('visits.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        fetchVisits(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="visits-page fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 className="page-header__title">{t('visits.title')}</h1>
                    <p className="page-header__subtitle">{t('visits.subtitle')}</p>
                </div>
                <Link to="/visits/add" className="btn btn--primary">
                    <FiPlus /> {t('visits.newVisit')}
                </Link>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner"></div></div>
            ) : visits.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">📋</div>
                    <h3 className="empty-state__title">{t('visits.noVisitsFound')}</h3>
                    <p className="empty-state__text">{t('visits.noVisitsSub')}</p>
                </div>
            ) : (
                <div className="visits-list">
                    {visits.map((visit) => (
                        <Link key={visit.id} to={`/visits/${visit.id}`} className="card visit-card">
                            <div className="visit-card__icon">
                                <FiCalendar />
                            </div>
                            <div className="visit-card__info">
                                {visit.patientName && (
                                    <div className="visit-card__patient">
                                        <span className="visit-card__patient-name">👤 {visit.patientName}</span>
                                    </div>
                                )}
                                <div className="visit-card__top">
                                    <span className="visit-card__date">
                                        {new Date(visit.visitDate).toLocaleString([], {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                    <span className={`badge ${visit.type === 1 ? 'badge--primary' : 'badge--warning'}`}>
                                        {visit.type === 1 ? t('enums.visitType.new') : t('enums.visitType.followUp')}
                                    </span>
                                </div>
                                <div className="visit-card__bottom">
                                    <span className="visit-card__detail">{t('visits.feePrefix')} <strong>${visit.fee}</strong></span>
                                    {visit.notes && <span className="visit-card__detail">{visit.notes}</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button
                                    onClick={(e) => handleDeleteVisit(e, visit.id)}
                                    className="btn btn--danger btn--sm"
                                    style={{ zIndex: 2, padding: '8px' }}
                                    title={t('visits.deleteTitle')}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                                <FiChevronRight className="visit-card__arrow" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && visits.length > 0 && (page > 1 || hasMore) && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, padding: '12px 0' }}>
                    <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                    >
                        {t('common.previous')}
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        {t('common.page')} {page}
                    </span>
                    <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!hasMore}
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, visitId: null })}
                onConfirm={confirmDelete}
                title={t('visits.deleteTitle')}
                message={t('visits.deleteConfirm')}
            />
        </div>
    );
};

export default VisitsPage;
