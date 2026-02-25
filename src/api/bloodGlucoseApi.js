import api from './axiosInstance';

export const addBloodGlucose = async (dto) => {
    const response = await api.post('/BloodGlucose', dto);
    return response.data;
};

export const updateBloodGlucose = async (dto) => {
    const response = await api.put('/BloodGlucose', dto);
    return response.data;
};

export const deleteBloodGlucose = async (id) => {
    const response = await api.delete('/BloodGlucose', { params: { BloodGlucoseId: id } });
    return response.data;
};
