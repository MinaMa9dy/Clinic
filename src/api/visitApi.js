import api from './axiosInstance';

export const addVisit = async (dto) => {
    const response = await api.post('/Visit', dto);
    return response.data;
};

export const updateVisit = async (dto) => {
    const response = await api.put('/Visit', dto);
    return response.data;
};

export const deleteVisit = async (visitId) => {
    const response = await api.delete('/Visit', { params: { VisitId: visitId } });
    return response.data;
};

export const getVisitsByDoctor = async (doctorId, pageNumber = 1, pageSize = 10) => {
    const response = await api.get(`/Visit/Doctor/${doctorId}`, { params: { pageNumber, pageSize } });
    return response.data;
};

export const getVisitsByPatient = async (patientId, pageNumber = 1, pageSize = 10) => {
    const response = await api.get(`/Visit/Patient/${patientId}`, { params: { pageNumber, pageSize } });
    return response.data;
};

export const getVisitById = async (visitId) => {
    const response = await api.get(`/Visit/${visitId}`);
    return response.data;
};
