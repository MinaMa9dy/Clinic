import api from './axiosInstance';

export const addPatient = async (dto) => {
    const response = await api.post('/Patient', dto);
    return response.data;
};

export const getPatientById = async (id) => {
    const response = await api.get(`/Patient/${id}`);
    return response.data;
};

export const searchPatients = async (q = '', pageNumber = 1, pageSize = 10) => {
    const response = await api.get('/Patient/Search', { params: { q, pageNumber, pageSize } });
    return response.data;
};

export const updateMedicalHistory = async (patientId, history) => {
    const response = await api.put(`/Patient/${patientId}/medical-history`, JSON.stringify(history), {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
};
