import { useState, useEffect } from 'react';
import { getDoctors } from '../api/doctorApi';
import { toast } from 'react-toastify';
import { GenderOptions } from '../utils/enums';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

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
                toast.error(result.message || 'Failed to load doctors');
            }
        } catch {
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-header__title">Doctors</h1>
                <p className="page-header__subtitle">All registered doctors in the clinic</p>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner"></div></div>
            ) : doctors.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">👨‍⚕️</div>
                    <h3 className="empty-state__title">No doctors found</h3>
                    <p className="empty-state__text">Register a new doctor to get started</p>
                </div>
            ) : (
                <div className="grid-3">
                    {doctors.map((doc) => (
                        <div key={doc.id} className="card" style={{ textAlign: 'center', padding: 28 }}>
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
                            <span className="badge badge--primary" style={{ marginBottom: 12 }}>{GenderOptions[doc.gender] || '—'}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
                                {doc.email && (<span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><FiMail size={13} /> {doc.email}</span>)}
                                {doc.phoneNumber && (<span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><FiPhone size={13} /> {doc.phoneNumber}</span>)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;
