import api from './axiosInstance';

export const addRadiology = async (dto) => {
    const response = await api.post('/Radiology', dto);
    return response.data;
};

export const updateRadiology = async (dto) => {
    const response = await api.put('/Radiology', dto);
    return response.data;
};

export const deleteRadiology = async (id) => {
    const response = await api.delete('/Radiology', { params: { RadiologyId: id } });
    return response.data;
};
