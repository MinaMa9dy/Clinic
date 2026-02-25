import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPatient } from '../api/patientApi';
import { toast } from 'react-toastify';
import { GenderOptionsList, BloodTypeOptionsList } from '../utils/enums';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const AddPatientPage = () => {
    const [form, setForm] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: 1,
        bloodType: 1,
        address: '',
        phoneNumber: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dto = {
                ...form,
                gender: Number(form.gender),
                bloodType: Number(form.bloodType),
            };
            const result = await addPatient(dto);
            if (result.isSuccess) {
                toast.success('Patient added successfully!');
                navigate('/patients');
            } else {
                toast.error(result.message || 'Failed to add patient');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="btn btn--secondary btn--sm" onClick={() => navigate('/patients')}>
                    <FiArrowLeft /> Back
                </button>
                <div>
                    <h1 className="page-header__title">Add Patient</h1>
                    <p className="page-header__subtitle">Register a new patient in the system</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 700 }}>
                <form onSubmit={handleSubmit}>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="form-input" placeholder="Patient full name" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number *</label>
                            <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="form-input" placeholder="+20 1XX XXX XXXX" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date of Birth *</label>
                            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender *</label>
                            <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                                {GenderOptionsList.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Blood Type *</label>
                            <select name="bloodType" value={form.bloodType} onChange={handleChange} className="form-select">
                                {BloodTypeOptionsList.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Address *</label>
                            <input type="text" name="address" value={form.address} onChange={handleChange} className="form-input" placeholder="Patient address" required />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : <><FiSave /> Save Patient</>}
                        </button>
                        <button type="button" className="btn btn--secondary btn--lg" onClick={() => navigate('/patients')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientPage;
