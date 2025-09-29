import React, { useEffect } from 'react';

const Modal = ({ children, isOpen, onClose, size = 'large', titleId }) => {
    if (!isOpen) return null;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    const sizeClass = size === 'small' ? 'modal-content-small' : '';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className={`modal-content ${sizeClass}`} 
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;