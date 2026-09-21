import api from './axiosInstance';

export const addLabTest = async (notes, visitId) => {
    const response = await api.post('/LabTest', { medicalVisitId: visitId, notes });
    return response.data;
};

export const updateLabTest = async (dto) => {
    const response = await api.put('/LabTest', dto);
    return response.data;
};

export const deleteLabTest = async (id) => {
    const response = await api.delete('/LabTest', { params: { LabTestId: id } });
    return response.data;
};
