import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import './ConfirmModal.css';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    type = "danger"
}) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    const finalConfirmText = confirmText || t('common.delete');
    const finalCancelText = cancelText || t('common.cancel');
    const finalTitle = title || t('common.areYouSure');
    const finalMessage = message || t('common.undoneAction');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="confirm-modal card fade-in scale-in" onClick={(e) => e.stopPropagation()}>
                <button className="confirm-modal__close" onClick={onClose} aria-label={t('common.close')}>
                    <FiX />
                </button>

                <div className="confirm-modal__content">
                    <div className={`confirm-modal__icon confirm-modal__icon--${type}`}>
                        <FiAlertTriangle />
                    </div>

                    <h3 className="confirm-modal__title">{finalTitle}</h3>
                    <p className="confirm-modal__message">{finalMessage}</p>

                    <div className="confirm-modal__actions">
                        <button className="btn btn--secondary" onClick={onClose}>
                            {finalCancelText}
                        </button>
                        <button
                            className={`btn ${type === 'danger' ? 'btn--danger' : 'btn--primary'}`}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {finalConfirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
