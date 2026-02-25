import api from './axiosInstance';

/**
 * Add a single photo
 * @param {number} ownerId - ID of Examination, LabTest, or Radiology
 * @param {number} owner - Owner type (1: Examination, 2: LabTest, 3: Radiology)
 * @param {File} file - The image file
 */
export const addPhoto = async (ownerId, owner, file) => {
    const formData = new FormData();
    formData.append('OwnerId', ownerId);
    formData.append('Owner', owner);
    formData.append('File', file);

    const response = await api.post('/Photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

/**
 * Add multiple photos
 * @param {number} ownerId 
 * @param {number} owner 
 * @param {FileList|File[]} files 
 */
export const addPhotos = async (ownerId, owner, files) => {
    const formData = new FormData();
    formData.append('OwnerId', ownerId);
    formData.append('Owner', owner);
    for (let i = 0; i < files.length; i++) {
        formData.append('Files', files[i]);
    }

    const response = await api.post('/Photo/AddPhotos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getPhotosByRelativeId = async (relativeId, owner) => {
    const response = await api.get('/Photo/GetPhotosByRelativeId', {
        params: { relativeId, owner }
    });
    return response.data;
};

export const deletePhoto = async (photoId) => {
    const response = await api.delete(`/Photo/${photoId}`);
    return response.data;
};

export const deletePhotos = async (relativeId, owner) => {
    const response = await api.delete('/Photo/DeletePhotos', {
        params: { relativeId, owner }
    });
    return response.data;
};
