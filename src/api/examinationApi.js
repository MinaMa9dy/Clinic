import api from './axiosInstance';

export const addExamination = async (dto) => {
    const response = await api.post('/Examination', dto);
    return response.data;
};

export const updateExamination = async (dto) => {
    const response = await api.put('/Examination', dto);
    return response.data;
};

export const deleteExamination = async (id) => {
    const response = await api.delete('/Examination', { params: { ExaminationId: id } });
    return response.data;
};
