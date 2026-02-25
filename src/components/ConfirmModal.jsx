import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="confirm-modal card fade-in scale-in" onClick={(e) => e.stopPropagation()}>
                <button className="confirm-modal__close" onClick={onClose}>
                    <FiX />
                </button>

                <div className="confirm-modal__content">
                    <div className={`confirm-modal__icon confirm-modal__icon--${type}`}>
                        <FiAlertTriangle />
                    </div>

                    <h3 className="confirm-modal__title">{title || "Are you sure?"}</h3>
                    <p className="confirm-modal__message">{message || "This action cannot be undone."}</p>

                    <div className="confirm-modal__actions">
                        <button className="btn btn--secondary" onClick={onClose}>
                            {cancelText}
                        </button>
                        <button
                            className={`btn ${type === 'danger' ? 'btn--danger' : 'btn--primary'}`}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
