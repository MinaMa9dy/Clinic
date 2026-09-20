import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2, FiMaximize2, FiImage } from 'react-icons/fi';
import { addPhotos, getPhotosByRelativeId, deletePhoto } from '../api/photoApi';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import './PhotoManager.css';

const PhotoManager = ({ isOpen, onClose, ownerId, ownerType, title }) => {
    const { t } = useLanguage();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        if (isOpen && ownerId) {
            fetchPhotos();
        }
    }, [isOpen, ownerId, ownerType]);

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const result = await getPhotosByRelativeId(ownerId, ownerType);
            setPhotos(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error('Error fetching photos:', error);
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const result = await addPhotos(ownerId, ownerType, files);
            if (result.isSuccess) {
                toast.success(t('photoManager.uploadSuccess'));
                fetchPhotos();
            } else {
                toast.error(result.message || t('photoManager.uploadFailed'));
            }
        } catch (error) {
            toast.error(t('photoManager.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (photoId) => {
        if (!confirm(t('photoManager.deletePhotoConfirm'))) return;

        try {
            const result = await deletePhoto(photoId, ownerType);
            if (result.isSuccess) {
                toast.success(t('photoManager.deleteSuccess'));
                setPhotos(photos.filter(p => p.id !== photoId));
            } else {
                toast.error(result.message || t('photoManager.deleteFailed'));
            }
        } catch (error) {
            toast.error(t('photoManager.deleteFailed'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="photo-manager card fade-in scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="photo-manager__header">
                    <h3 className="photo-manager__title">
                        <FiImage /> {title || t('common.photos')}
                    </h3>
                    <button className="photo-manager__close" onClick={onClose} aria-label={t('common.close')}><FiX /></button>
                </div>

                <div className="photo-manager__upload">
                    <label className="btn btn--primary btn--sm" style={{ cursor: 'pointer' }}>
                        <FiUpload /> {uploading ? t('photoManager.uploading') : t('photoManager.uploadPhotos')}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleUpload}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                    </label>
                </div>

                <div className="photo-manager__content">
                    {loading ? (
                        <div className="spinner-container"><div className="spinner"></div></div>
                    ) : photos.length === 0 ? (
                        <div className="photo-manager__empty">
                            <FiImage size={48} opacity={0.2} />
                            <p>{t('photoManager.noPhotosYet')}</p>
                        </div>
                    ) : (
                        <div className="photo-grid">
                            {photos.map((photo) => (
                                <div key={photo.id} className="photo-item">
                                    <img src={photo.relativePath} alt="Medical record" onClick={() => setSelectedPhoto(photo.relativePath)} />
                                    <div className="photo-item__overlay">
                                        <button onClick={() => setSelectedPhoto(photo.relativePath)} title={t('common.view')}><FiMaximize2 /></button>
                                        <button onClick={() => handleDelete(photo.id)} title={t('common.delete')} className="delete"><FiTrash2 /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedPhoto && (
                <div className="photo-viewer" onClick={() => setSelectedPhoto(null)}>
                    <img src={selectedPhoto} alt="Fullscreen" />
                    <button className="photo-viewer__close" onClick={() => setSelectedPhoto(null)} aria-label={t('common.close')}><FiX /></button>
                </div>
            )}
        </div>
    );
};

export default PhotoManager;
