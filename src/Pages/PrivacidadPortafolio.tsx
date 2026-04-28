import React, { useState, useEffect } from 'react';
import { getPrivacidad, actualizarPrivacidad, restablecerPrivacidad, normalizeEstado } from '../Services/privacy';
import type { PrivacidadEstado } from '../Services/privacy';
import ConfirmModal from '../Components/ConfirmModal';
import './PrivacidadPortafolio.css';

// ── Iconos inline ────────────────────────────────────────────────────────────
const IconGlobe = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1zm5.93 7H12.9a12.7 12.7 0 0 0-1.1-4.45A6.01 6.01 0 0 1 14.93 8zM9 15a11.2 11.2 0 0 1-1.52-4H10.52A11.2 11.2 0 0 1 9 15zm-1.65-6H10.65A11 11 0 0 0 9 3 11 11 0 0 0 7.35 9zM6.2 3.55A12.7 12.7 0 0 0 5.1 8H3.07A6.01 6.01 0 0 1 6.2 3.55zM3.07 10H5.1c.17 1.58.54 3.07 1.1 4.45A6.01 6.01 0 0 1 3.07 10zm8.73 4.45A12.7 12.7 0 0 0 12.9 10h2.03a6.01 6.01 0 0 1-3.13 4.45z" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 7h-1V5.5a3 3 0 0 0-6 0V7H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-5 4.73V13h2v-1.27a1.5 1.5 0 1 0-2 0zM7.5 7V5.5a1.5 1.5 0 0 1 3 0V7h-3z" />
  </svg>
);
const IconFolder = () => (
  <svg viewBox="0 0 18 18" fill="currentColor"><path d="M1 4a1 1 0 0 1 1-1h5l2 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z"/></svg>
);
const IconSkill = () => (
  <svg viewBox="0 0 18 18" fill="currentColor"><path d="M9 1l2.39 4.84L17 6.76l-4 3.9.94 5.5L9 13.77l-4.94 2.6L5 10.66 1 6.76l5.61-.92z"/></svg>
);
const IconAcad = () => (
  <svg viewBox="0 0 18 18" fill="currentColor"><path d="M9 1L1 5l8 4 8-4-8-4zM1 9l8 4 8-4M1 13l8 4 8-4"/></svg>
);
const IconWork = () => (
  <svg viewBox="0 0 18 18" fill="currentColor"><path d="M6 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm2-1v1h2V3H8zM3 8v5h12V8H3z"/></svg>
);
const IconNet = () => (
  <svg viewBox="0 0 18 18" fill="currentColor"><circle cx="9" cy="4" r="2"/><circle cx="3" cy="14" r="2"/><circle cx="15" cy="14" r="2"/><path d="M9 6v3M9 9l-4 4M9 9l4 4"/></svg>
);

// ── Tipos ────────────────────────────────────────────────────────────────────
type ModalType = 'guardar' | 'restablecer' | null;

interface SeccionConfig {
  key: keyof PrivacidadEstado;
  label: string;
  desc: string;
  icon: React.FC;
}

const SECCIONES: SeccionConfig[] = [
  { key: 'proyectos',             label: 'Proyectos',             desc: 'Todos los proyectos publicados',        icon: IconFolder },
  { key: 'habilidades',           label: 'Habilidades',           desc: 'Técnicas y blandas',                    icon: IconSkill  },
  { key: 'experiencia_academica', label: 'Experiencia académica', desc: 'Formación universitaria y cursos',      icon: IconAcad   },
  { key: 'experiencia_laboral',   label: 'Experiencia laboral',   desc: 'Historial de empleo y cargos',          icon: IconWork   },
  { key: 'redes_profesionales',   label: 'Redes profesionales',   desc: 'LinkedIn, GitHub y otros enlaces',      icon: IconNet    },
];

const DEFAULT_ESTADO: PrivacidadEstado = {
  portafolio: true,
  proyectos: true,
  habilidades: true,
  experiencia_academica: true,
  experiencia_laboral: true,
  redes_profesionales: true,
};

// ── Componente principal ─────────────────────────────────────────────────────
const PrivacidadPortafolio: React.FC = () => {
  const [estado, setEstado]                 = useState<PrivacidadEstado>(DEFAULT_ESTADO);
  const [estadoGuardado, setEstadoGuardado] = useState<PrivacidadEstado>(DEFAULT_ESTADO);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [modal, setModal]                   = useState<ModalType>(null);
  const [toast, setToast]                   = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [hayCambios, setHayCambios]         = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw  = await getPrivacidad();
        const norm = normalizeEstado(raw);
        setEstado(norm);
        setEstadoGuardado(norm);
      } catch {
        showToast('Error al cargar la configuración de privacidad', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const changed = (Object.keys(estado) as (keyof PrivacidadEstado)[]).some(
      (k) => estado[k] !== estadoGuardado[k]
    );
    setHayCambios(changed);
  }, [estado, estadoGuardado]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggle = (key: keyof PrivacidadEstado) => {
    setEstado((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await actualizarPrivacidad(estado);
      setEstadoGuardado({ ...estado });
      setHayCambios(false);
      showToast('Configuración guardada correctamente', 'success');
    } catch {
      showToast('Error al guardar los cambios. Intenta nuevamente.', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleRestablecer = async () => {
    setSaving(true);
    try {
      await restablecerPrivacidad();
      setEstado(DEFAULT_ESTADO);
      setEstadoGuardado(DEFAULT_ESTADO);
      setHayCambios(false);
      showToast('Privacidad restablecida. Todo es visible nuevamente.', 'success');
    } catch {
      showToast('Error al restablecer. Intenta nuevamente.', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleDescartar = () => {
    setEstado({ ...estadoGuardado });
    setHayCambios(false);
  };

  const visiblesCount = Object.values(estado).filter(Boolean).length;
  const perfilPublico  = estado.portafolio;

  // Secciones visibles para la vista previa
  const seccionesVisibles = SECCIONES.filter((s) => estado[s.key]);
  const seccionesOcultas  = SECCIONES.filter((s) => !estado[s.key]);

  return (
    <div className="pv-page">
      <div className="pv-content-wrap">

        {/* ── COLUMNA IZQUIERDA ────────────────────────────── */}
        <div className="pv-col-left">

          {/* Encabezado */}
          <div className="pv-page-header">
            <div>
              <h1 className="pv-page-title">Privacidad del portafolio</h1>
              <p className="pv-page-sub">Controla qué información es visible públicamente</p>
            </div>
            {hayCambios && (
              <div className="pv-changes-pill">
                <span className="pv-dot amber"></span>
                Cambios sin guardar
              </div>
            )}
          </div>

          {/* Banner de estado */}
          <div className={`pv-status-banner ${perfilPublico ? 'pub' : 'priv'}`}>
            <div className="pv-status-dot"></div>
            <div className="pv-status-text">
              <strong>{perfilPublico ? 'Perfil público' : 'Perfil privado'}</strong>
              <p>
                {perfilPublico
                  ? 'Tu portafolio es visible para cualquier visitante mediante URL pública.'
                  : 'Tu portafolio no es accesible mediante URL pública. Solo tú puedes verlo.'}
              </p>
            </div>
          </div>

          {/* Visibilidad general */}
          <div className="pv-card">
            <p className="pv-card-label">Visibilidad general</p>
            <div className="pv-toggle-row">
              <div className="pv-toggle-left">
                <div className={`pv-sec-icon ${perfilPublico ? 'on' : 'off'}`}>
                  <IconGlobe />
                </div>
                <div className="pv-toggle-info">
                  <span className="pv-toggle-label">Perfil público</span>
                  <span className="pv-toggle-desc">Permite que cualquier persona acceda a tu portafolio mediante URL</span>
                </div>
              </div>
              <div className="pv-toggle-right">
                <button
                  className={`pv-toggle-btn ${perfilPublico ? 'on' : 'off'}`}
                  onClick={() => handleToggle('portafolio')}
                  role="switch"
                  aria-checked={perfilPublico}
                  aria-label="Perfil público"
                />
              </div>
            </div>
          </div>

          {/* Visibilidad por sección */}
          {loading ? (
            <div className="pv-card">
              <p className="pv-card-label">Visibilidad por sección</p>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="pv-skeleton-row">
                  <div className="pv-sk sk-icon"></div>
                  <div className="pv-sk-lines">
                    <div className="pv-sk sk-title"></div>
                    <div className="pv-sk sk-desc"></div>
                  </div>
                  <div className="pv-sk sk-toggle"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pv-card">
              <p className="pv-card-label">Visibilidad por sección</p>
              {SECCIONES.map((sec, i) => {
                const Icon = sec.icon;
                const isOn = estado[sec.key];
                return (
                  <div key={sec.key} className={`pv-toggle-row ${i === SECCIONES.length - 1 ? 'last' : ''}`}>
                    <div className="pv-toggle-left">
                      <div className={`pv-sec-icon ${isOn ? 'on' : 'off'}`}>
                        <Icon />
                      </div>
                      <div className="pv-toggle-info">
                        <span className="pv-toggle-label">{sec.label}</span>
                        <span className="pv-toggle-desc">{sec.desc}</span>
                      </div>
                    </div>
                    <div className="pv-toggle-right">
                      <span className={`pv-vis-badge ${isOn ? 'visible' : 'hidden'}`}>
                        {isOn ? 'Visible' : 'Oculto'}
                      </span>
                      <button
                        className={`pv-toggle-btn ${isOn ? 'on' : 'off'}`}
                        onClick={() => handleToggle(sec.key)}
                        aria-label={`${isOn ? 'Ocultar' : 'Mostrar'} ${sec.label}`}
                        role="switch"
                        aria-checked={isOn}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Acciones */}
          {!loading && (
            <div className="pv-actions">
              <button
                className="pv-btn-primary"
                disabled={!hayCambios || saving}
                onClick={() => setModal('guardar')}
              >
                Guardar cambios
              </button>
              <button
                className="pv-btn-ghost"
                disabled={!hayCambios || saving}
                onClick={handleDescartar}
              >
                Revertir
              </button>
              {hayCambios && (
                <span className="pv-saved-ok">
                  <span className="pv-dot green"></span>
                  Tienes cambios pendientes
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── COLUMNA DERECHA ──────────────────────────────── */}
        <aside className="pv-col-right">

          {/* Vista previa pública */}
          <div className="pv-card">
            <p className="pv-card-label">Vista previa pública</p>
            <div className="pv-preview-box">
              {/* Mini topbar */}
              <div className="pv-preview-topbar">
                <div className="pv-preview-dot"></div>
                <div className="pv-preview-bar short"></div>
              </div>

              {perfilPublico ? (
                <div className="pv-preview-body">
                  {/* Líneas de perfil */}
                  <div className="pv-preview-bar w60 mb4"></div>
                  <div className="pv-preview-bar w40 mb8"></div>

                  {/* Secciones visibles */}
                  {seccionesVisibles.slice(0, 3).map((sec) => (
                    <div key={sec.key} className="pv-preview-section">
                      <div className="pv-preview-section-title">{sec.label}</div>
                      <div className="pv-preview-bar w100 filled mb2"></div>
                      <div className="pv-preview-bar w75 filled"></div>
                    </div>
                  ))}

                  {/* Secciones ocultas */}
                  {seccionesOcultas.slice(0, 2).map((sec) => (
                    <div key={sec.key} className="pv-preview-hidden">
                      <span>{sec.label} oculto</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pv-preview-locked">
                  <div className="pv-preview-lock-icon">
                    <IconLock />
                  </div>
                  <p>Este perfil es privado. No visible al público.</p>
                </div>
              )}
            </div>

            {/* Enlace */}
            <div className="pv-link-label">
              {perfilPublico ? 'Enlace del portafolio' : 'Enlace privado activo'}
            </div>
            <div className="pv-link-box">
              <span className="pv-link-url">portafolio.app/eliana-martinez</span>
              <button className="pv-link-copy">Copiar</button>
            </div>
          </div>

          {/* Estado actual */}
          <div className="pv-card">
            <p className="pv-card-label">Estado actual</p>
            <div className="pv-summary-rows">
              <div className="pv-sum-row">
                <span>Visibilidad</span>
                <span className={perfilPublico ? 'clr-green' : 'clr-red'}>
                  {perfilPublico ? 'Público' : 'Privado'}
                </span>
              </div>
              <div className="pv-sum-row">
                <span>Secciones visibles</span>
                <span className="pv-sum-val">{visiblesCount} de {SECCIONES.length + 1}</span>
              </div>
              <div className="pv-sum-row">
                <span>Acceso público</span>
                <span className={perfilPublico ? 'clr-green' : 'clr-red'}>
                  {perfilPublico ? 'Activo' : 'Bloqueado'}
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia cambios pendientes */}
          {hayCambios && (
            <div className="pv-card pv-warn-card">
              <div className="pv-warn-icon">
                <svg viewBox="0 0 18 18" fill="currentColor"><path d="M9 1L1 16h16L9 1zm0 3.5L15.1 15H2.9L9 4.5zM8 8v3h2V8H8zm0 4v2h2v-2H8z"/></svg>
              </div>
              <div>
                <strong>Cambios sin guardar</strong>
                <p>Presiona "Guardar cambios" para aplicar la nueva configuración.</p>
              </div>
            </div>
          )}

          {/* Botón restablecer */}
          {!loading && (
            <button
              className="pv-btn-restablecer-full"
              onClick={() => setModal('restablecer')}
              disabled={saving}
            >
              Restablecer todo a público
            </button>
          )}
        </aside>
      </div>

      {/* ── MODALS ──────────────────────────────────────────── */}
      {modal === 'guardar' && (
        <ConfirmModal
          type="guardar"
          loading={saving}
          onConfirm={handleGuardar}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === 'restablecer' && (
        <ConfirmModal
          type="restablecer"
          loading={saving}
          onConfirm={handleRestablecer}
          onCancel={() => setModal(null)}
        />
      )}

      {/* ── TOAST ───────────────────────────────────────────── */}
      {toast && (
        <div className={`pv-toast ${toast.type}`}>
          <span className={`pv-toast-dot ${toast.type}`}></span>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default PrivacidadPortafolio;