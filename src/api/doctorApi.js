import api from './axiosInstance';

export const getDoctors = async () => {
    const response = await api.get('/Doctor/Doctors');
    return response.data;
};
