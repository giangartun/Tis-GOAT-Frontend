import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'info' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  titulo,
  mensaje,
  onConfirm,
  onCancel,
  loading = false,
  textoConfirmar,
  textoCancelar,
  tipo = 'info',
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-icon-wrap ${tipo}`}>
          {tipo === 'info' ? (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm-.75 4.5h1.5v5h-1.5v-5zm0 6h1.5v1.5h-1.5V12.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
          )}
        </div>

        <h3 className="modal-title">{titulo}</h3>

        <p className="modal-desc">{mensaje}</p>

        <div className="modal-actions">
          <button
            className="btn-modal-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {textoCancelar || t('confirmModal.cancel')}
          </button>

          <button
            className={`btn-modal-confirm ${tipo === 'warning' ? 'danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? t('confirmModal.processing')
              : textoConfirmar || t('confirmModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;