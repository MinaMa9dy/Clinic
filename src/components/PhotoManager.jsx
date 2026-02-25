import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2, FiMaximize2, FiImage } from 'react-icons/fi';
import { addPhotos, getPhotosByRelativeId, deletePhoto } from '../api/photoApi';
import { toast } from 'react-toastify';
import './PhotoManager.css';

const PhotoManager = ({ isOpen, onClose, ownerId, ownerType, title }) => {
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
            // The backend returns the list directly or wrapped in Result
            // Based on PhotoController, it returns Ok(photos) which is the list
            setPhotos(Array.isArray(result) ? result : (result.data || []));
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
                toast.success('Photos uploaded successfully');
                fetchPhotos();
            } else {
                toast.error(result.message || 'Upload failed');
            }
        } catch (error) {
            toast.error('Failed to upload photos');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (photoId) => {
        if (!confirm('Are you sure you want to delete this photo?')) return;

        try {
            const result = await deletePhoto(photoId);
            if (result.isSuccess) {
                toast.success('Photo deleted');
                setPhotos(photos.filter(p => p.id !== photoId));
            } else {
                toast.error(result.message || 'Delete failed');
            }
        } catch (error) {
            toast.error('Failed to delete photo');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="photo-manager card fade-in scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="photo-manager__header">
                    <h3 className="photo-manager__title">
                        <FiImage /> {title || 'Photos'}
                    </h3>
                    <button className="photo-manager__close" onClick={onClose}><FiX /></button>
                </div>

                <div className="photo-manager__upload">
                    <label className="btn btn--primary btn--sm" style={{ cursor: 'pointer' }}>
                        <FiUpload /> {uploading ? 'Uploading...' : 'Upload Photos'}
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
                            <p>No photos yet</p>
                        </div>
                    ) : (
                        <div className="photo-grid">
                            {photos.map((photo) => (
                                <div key={photo.id} className="photo-item">
                                    <img src={photo.relativePath} alt="Medical record" onClick={() => setSelectedPhoto(photo.relativePath)} />
                                    <div className="photo-item__overlay">
                                        <button onClick={() => setSelectedPhoto(photo.relativePath)} title="View"><FiMaximize2 /></button>
                                        <button onClick={() => handleDelete(photo.id)} title="Delete" className="delete"><FiTrash2 /></button>
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
                    <button className="photo-viewer__close" onClick={() => setSelectedPhoto(null)}><FiX /></button>
                </div>
            )}
        </div>
    );
};

export default PhotoManager;
