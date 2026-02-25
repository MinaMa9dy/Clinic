import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVisitsByDoctor, deleteVisit } from '../api/visitApi';
import { toast } from 'react-toastify';
import { MedicalVisitOptions } from '../utils/enums';
import { FiCalendar, FiPlus, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import './VisitsPage.css';

const VisitsPage = () => {
    const { doctor } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
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
                toast.success('Visit deleted');
                fetchVisits();
            } else toast.error(result.message);
        } catch { toast.error('Failed to delete visit'); }
    };

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        setLoading(true);
        try {
            if (doctor?.id) {
                const result = await getVisitsByDoctor(doctor.id);
                if (result.isSuccess) setVisits(result.data || []);
                else toast.error(result.message || 'Failed to load visits');
            }
        } catch {
            toast.error('Failed to load visits');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="visits-page fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 className="page-header__title">Visits</h1>
                    <p className="page-header__subtitle">Medical visits for your patients</p>
                </div>
                <Link to="/visits/add" className="btn btn--primary">
                    <FiPlus /> New Visit
                </Link>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner"></div></div>
            ) : visits.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">📋</div>
                    <h3 className="empty-state__title">No visits found</h3>
                    <p className="empty-state__text">Schedule a new visit to get started</p>
                </div>
            ) : (
                <div className="visits-list">
                    {visits.map((visit) => (
                        <Link key={visit.id} to={`/visits/${visit.id}`} className="card visit-card">
                            <div className="visit-card__icon">
                                <FiCalendar />
                            </div>
                            <div className="visit-card__info">
                                <div className="visit-card__top">
                                    <span className="visit-card__date">{new Date(visit.visitDate).toLocaleDateString()}</span>
                                    <span className={`badge ${visit.type === 1 ? 'badge--primary' : 'badge--warning'}`}>
                                        {MedicalVisitOptions[visit.type]}
                                    </span>
                                </div>
                                <div className="visit-card__bottom">
                                    <span className="visit-card__detail">Fee: <strong>${visit.fee}</strong></span>
                                    {visit.notes && <span className="visit-card__detail">{visit.notes}</span>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button
                                    onClick={(e) => handleDeleteVisit(e, visit.id)}
                                    className="btn btn--danger btn--sm"
                                    style={{ zIndex: 2, padding: '8px' }}
                                    title="Delete Visit"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                                <FiChevronRight className="visit-card__arrow" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, visitId: null })}
                onConfirm={confirmDelete}
                title="Delete Visit"
                message="Are you sure you want to permanently delete this medical visit record?"
            />
        </div>
    );
};

export default VisitsPage;
