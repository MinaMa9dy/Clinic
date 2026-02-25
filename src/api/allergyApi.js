import api from './axiosInstance';

export const addAllergy = async (allergy, description, patientId) => {
    const response = await api.post('/Allergy', null, {
        params: { allergy, Description: description, patientId },
    });
    return response.data;
};

export const getAllergiesByPatientId = async (patientId) => {
    const response = await api.get(`/Allergy/${patientId}`);
    return response.data;
};

export const deleteAllergy = async (id) => {
    const response = await api.delete('/Allergy', { params: { id } });
    return response.data;
};
