import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'error' | 'warning';
  showCloseButton?: boolean;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'info',
  showCloseButton = true,
  maxWidth = '500px'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'modal-success';
      case 'error':
        return 'modal-error';
      case 'warning':
        return 'modal-warning';
      default:
        return 'modal-info';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${getTypeClass()}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            <span className="modal-icon">{getIcon()}</span>
            {title}
          </h3>
          {showCloseButton && (
            <button 
              className="modal-close-button" 
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        <div className="modal-footer">
          <button className="modal-ok-button" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
