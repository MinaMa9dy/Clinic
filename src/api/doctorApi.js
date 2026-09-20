import api from './axiosInstance';

export const getDoctors = async () => {
    const response = await api.get('/Doctor/Doctors');
    return response.data;
};

export const addDoctor = async (dto) => {
    const response = await api.post('/Auth/Register-Doctor', dto);
    return response.data;
};

export const deleteDoctor = async (id) => {
    const response = await api.delete(`/Doctor/${id}`, { params: { id } });
    return response.data;
};
