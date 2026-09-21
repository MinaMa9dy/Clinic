import api from './axiosInstance';

export const addDrug = async (drugName, dose, visitId) => {
    const response = await api.post('/Drug', { medicalVisitId: visitId, drugName, dose });
    return response.data;
};

export const updateDrug = async (dto) => {
    const response = await api.put('/Drug', dto);
    return response.data;
};

export const deleteDrug = async (drugId) => {
    const response = await api.delete(`/Drug/${drugId}`);
    return response.data;
};
