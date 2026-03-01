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

export const updatePatient = async (patientDto) => {
    const response = await api.put('/Patient', patientDto);
    return response.data;
};
export const deletePatient = async (id) => {
    const response = await api.delete(`/Patient/${id}`);
    return response.data;
};
