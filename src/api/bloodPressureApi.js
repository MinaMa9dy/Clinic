import api from './axiosInstance';

export const addBloodPressure = async (dto) => {
    const response = await api.post('/BloodPressure', dto);
    return response.data;
};

export const updateBloodPressure = async (dto) => {
    const response = await api.put('/BloodPressure', dto);
    return response.data;
};

export const deleteBloodPressure = async (id) => {
    const response = await api.delete('/BloodPressure', { params: { BloodPressureId: id } });
    return response.data;
};
