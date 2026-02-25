import api from './axiosInstance';

export const registerDoctor = async (dto) => {
    const response = await api.post('/Auth/Register-Doctor', dto);
    return response.data;
};

export const loginDoctor = async (dto) => {
    const response = await api.post('/Auth/Login-Doctor', dto);
    return response.data;
};
