import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchPatients, deletePatient } from '../api/patientApi';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { FiSearch, FiPlus, FiUser, FiPhone, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import './PatientsPage.css';

const PatientsPage = () => {
    const { t } = useLanguage();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        patientId: null,
        patientName: ''
    });

    const fetchPatients = async (q = '', pageNum = 1) => {
        setLoading(true);
        try {
            const result = await searchPatients(q, pageNum, PAGE_SIZE);
            if (result.isSuccess) {
                setPatients(result.data || []);
                setHasMore((result.data || []).length === PAGE_SIZE);
            } else {
                toast.error(result.message || t('patients.loadFailed'));
            }
        } catch (err) {
            toast.error(t('patients.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients(query);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearchParams(query ? { q: query } : {});
        fetchPatients(query, 1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchPatients(query, newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (e, patient) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            patientId: patient.id,
            patientName: patient.fullName
        });
    };

    const confirmDelete = async () => {
        try {
            const result = await deletePatient(confirmModal.patientId);
            if (result.isSuccess) {
                toast.success(t('patients.deleteSuccess'));
                fetchPatients(query, page);
            } else {
                toast.error(result.message || t('patients.deleteFailed'));
            }
        } catch (error) {
            toast.error(t('patients.deleteFailed'));
        } finally {
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const getGenderLabel = (gender) => {
        if (gender === 1) return t('enums.gender.male');
        if (gender === 2) return t('enums.gender.female');
        return '—';
    };

    const getBloodTypeLabel = (bloodType) => {
        const map = { 1: 'A+', 2: 'A-', 3: 'B+', 4: 'B-', 5: 'AB+', 6: 'AB-', 7: 'O+', 8: 'O-' };
        return map[bloodType] || '—';
    };

    return (
        <div className="patients-page fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 className="page-header__title">{t('patients.title')}</h1>
                    <p className="page-header__subtitle">{t('patients.subtitle')}</p>
                </div>
                <Link to="/patients/add" className="btn btn--primary">
                    <FiPlus /> {t('patients.addPatient')}
                </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="patients-search">
                <div className="patients-search__input-wrapper">
                    <FiSearch className="patients-search__icon" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="form-input patients-search__input"
                        placeholder={t('patients.searchPlaceholder')}
                    />
                </div>
                <button type="submit" className="btn btn--primary">
                    {t('common.search')}
                </button>
            </form>

            {/* Results */}
            {loading ? (
                <div className="loading"><div className="spinner"></div></div>
            ) : patients.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🔍</div>
                    <h3 className="empty-state__title">{t('patients.noPatientsFound')}</h3>
                    <p className="empty-state__text">{t('patients.noPatientsSub')}</p>
                </div>
            ) : (
                <div className="patients-grid">
                    {patients.map((patient) => (
                        <Link key={patient.id} to={`/patients/${patient.id}`} className="card patient-card">
                            <div className="patient-card__avatar">
                                <FiUser />
                            </div>
                            <div className="patient-card__info">
                                <h3 className="patient-card__name">{patient.fullName}</h3>
                                <div className="patient-card__details">
                                    {patient.phoneNumber && (
                                        <span className="patient-card__detail"><FiPhone size={13} /> {patient.phoneNumber}</span>
                                    )}
                                    <span className="patient-card__detail">
                                        {getGenderLabel(patient.gender)} · {getBloodTypeLabel(patient.bloodType)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button
                                    onClick={(e) => handleDeleteClick(e, patient)}
                                    className="btn btn--danger btn--sm"
                                    style={{ zIndex: 2, padding: '8px' }}
                                    title={t('patients.deleteTitle')}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                                <FiChevronRight className="patient-card__arrow" />
                            </div>
                        </Link>
                    ))}

                    {/* Pagination Controls */}
                    {(page > 1 || hasMore) && (
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
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmDelete}
                title={t('patients.deleteTitle')}
                message={t('patients.deleteConfirm', { name: confirmModal.patientName })}
            />
        </div>
    );
};

export default PatientsPage;
