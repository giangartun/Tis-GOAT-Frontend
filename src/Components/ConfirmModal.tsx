import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
  type: 'guardar' | 'restablecer';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ type, onConfirm, onCancel, loading }) => {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-icon-wrap ${type === 'restablecer' ? 'warning' : 'info'}`}>
          {type === 'guardar' ? (
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm-.75 4.5h1.5v5h-1.5v-5zm0 6h1.5v1.5h-1.5V12.5z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm1 11H9v-2h2v2zm0-4H9V5h2v4z"
                fill="currentColor"
              />
            </svg>
          )}
        </div>

        <h3 className="modal-title">
          {type === 'guardar' ? 'Confirmar cambios' : 'Restablecer privacidad'}
        </h3>

        <p className="modal-desc">
          {type === 'guardar'
            ? 'Los cambios de visibilidad se aplicarán de inmediato. Las secciones desactivadas dejarán de ser visibles en tu portafolio público.'
            : 'Se restablecerá la visibilidad de todas las secciones a público. Esta acción no puede deshacerse de forma automática.'}
        </p>

        <div className="modal-actions">
          <button className="btn-modal-cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button
            className={`btn-modal-confirm ${type === 'restablecer' ? 'danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando...' : type === 'guardar' ? 'Guardar cambios' : 'Restablecer todo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;