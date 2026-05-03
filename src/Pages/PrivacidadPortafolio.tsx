import React, { useState, useEffect, useCallback } from 'react';
import {
  getPrivacidad,
  actualizarPrivacidad,
  restablecerPrivacidad,
  transformarRespuesta,
  extraerTodosLosNombres,
  calcularCambios,
  calcularTodos,
  SECCIONES_KEYS,
} from '../Services/privacy';
import type { EstadoFrontend, NombresItems, ClaveSeccion } from '../Services/privacy';
import SeccionPrivacidad from '../Components/SeccionPrivacidad';
import ConfirmModal from '../Components/ConfirmModal';
import './PrivacidadPortafolio.css';

// ── Iconos ───────────────────────────────────────────────────────────────────
const IconGlobe = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M9 1a8 8 0 1 0 0 16A8 8 0 0 0 9 1zm5.93 7H12.9a12.7 12.7 0 0 0-1.1-4.45A6.01 6.01 0 0 1 14.93 8zM9 15a11.2 11.2 0 0 1-1.52-4H10.52A11.2 11.2 0 0 1 9 15zm-1.65-6H10.65A11 11 0 0 0 9 3 11 11 0 0 0 7.35 9zM6.2 3.55A12.7 12.7 0 0 0 5.1 8H3.07A6.01 6.01 0 0 1 6.2 3.55zM3.07 10H5.1c.17 1.58.54 3.07 1.1 4.45A6.01 6.01 0 0 1 3.07 10zm8.73 4.45A12.7 12.7 0 0 0 12.9 10h2.03a6.01 6.01 0 0 1-3.13 4.45z" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M13 7h-1V5.5a3 3 0 0 0-6 0V7H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-5 4.73V13h2v-1.27a1.5 1.5 0 1 0-2 0zM7.5 7V5.5a1.5 1.5 0 0 1 3 0V7h-3z" />
  </svg>
);
const IconFolder = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M1 4a1 1 0 0 1 1-1h5l2 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z"/>
  </svg>
);
const IconSkill = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M9 1l2.39 4.84L17 6.76l-4 3.9.94 5.5L9 13.77l-4.94 2.6L5 10.66 1 6.76l5.61-.92z"/>
  </svg>
);
const IconAcad = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M9 1L1 5l8 4 8-4-8-4zM1 9l8 4 8-4M1 13l8 4 8-4"/>
  </svg>
);
const IconWork = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M6 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm2-1v1h2V3H8zM3 8v5h12V8H3z"/>
  </svg>
);
const IconNet = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <circle cx="9" cy="4" r="2"/>
    <circle cx="3" cy="14" r="2"/>
    <circle cx="15" cy="14" r="2"/>
    <path d="M9 6v3M9 9l-4 4M9 9l4 4"/>
  </svg>
);

// ── Config secciones ─────────────────────────────────────────────────────────
const SECCIONES_CONFIG: Record<ClaveSeccion, { titulo: string; icon: React.FC }> = {
  proyectos:             { titulo: 'Proyectos',             icon: IconFolder },
  habilidades:           { titulo: 'Habilidades',           icon: IconSkill  },
  experiencia_academica: { titulo: 'Experiencia académica', icon: IconAcad   },
  experiencia_laboral:   { titulo: 'Experiencia laboral',   icon: IconWork   },
  redes_profesionales:   { titulo: 'Redes profesionales',   icon: IconNet    },
};

const ESTADO_VACIO: EstadoFrontend = {
  portafolio: true,
  proyectos: {},
  habilidades: {},
  experiencia_academica: {},
  experiencia_laboral: {},
  redes_profesionales: {},
};

const NOMBRES_VACIOS: NombresItems = {
  proyectos: {},
  habilidades: {},
  experiencia_academica: {},
  experiencia_laboral: {},
  redes_profesionales: {},
};

// ── Componente principal ─────────────────────────────────────────────────────
const PrivacidadPortafolio: React.FC = () => {
  const [loading, setLoading]                   = useState(true);
  const [saving, setSaving]                     = useState(false);
  const [estadoActual, setEstadoActual]         = useState<EstadoFrontend>(ESTADO_VACIO);
  const [estadoOriginal, setEstadoOriginal]     = useState<EstadoFrontend>(ESTADO_VACIO);
  const [nombres, setNombres]                   = useState<NombresItems>(NOMBRES_VACIOS);
  const [modalGuardar, setModalGuardar]         = useState(false);
  const [modalRestablecer, setModalRestablecer] = useState(false);
  const [toast, setToast]                       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── Carga de datos ─────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await getPrivacidad();
      console.log('RAW backend:', JSON.stringify(raw, null, 2));
      const estado = transformarRespuesta(raw);
      console.log('Estado transformado:', JSON.stringify(estado, null, 2));
      const noms = extraerTodosLosNombres(raw);
      console.log('Nombres:', JSON.stringify(noms, null, 2));
      setEstadoActual(estado);
      setEstadoOriginal(JSON.parse(JSON.stringify(estado)));
      setNombres(noms);
    } catch (err) {
      console.error('Error al cargar privacidad:', err);
      showToast('Error al cargar la configuración de privacidad', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Cambios pendientes ─────────────────────────────────────────────────────
  const hayCambios = JSON.stringify(estadoActual) !== JSON.stringify(estadoOriginal);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTogglePortafolio = () => {
    setEstadoActual((prev) => ({ ...prev, portafolio: !prev.portafolio }));
  };

  const handleToggleSeccion = (seccion: ClaveSeccion, nuevoValor: boolean) => {
    setEstadoActual((prev) => {
      const nuevosItems: Record<string, boolean> = {};
      for (const id of Object.keys(prev[seccion])) {
        nuevosItems[id] = nuevoValor;
      }
      return { ...prev, [seccion]: nuevosItems };
    });
  };

  const handleToggleItem = (seccion: ClaveSeccion, id: string, nuevoValor: boolean) => {
    setEstadoActual((prev) => ({
      ...prev,
      [seccion]: { ...prev[seccion], [id]: nuevoValor },
    }));
  };

  const handleRevertir = () => {
    setEstadoActual(JSON.parse(JSON.stringify(estadoOriginal)));
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const payload = calcularCambios(estadoOriginal, estadoActual);
      console.log('Payload a enviar:', JSON.stringify(payload, null, 2));
      await actualizarPrivacidad(payload);
      setEstadoOriginal(JSON.parse(JSON.stringify(estadoActual)));
      showToast('Configuración guardada correctamente', 'success');
    } catch (err) {
      console.error('Error al guardar:', err);
      showToast('Error al guardar los cambios. Intenta nuevamente.', 'error');
    } finally {
      setSaving(false);
      setModalGuardar(false);
    }
  };

  const handleRestablecer = async () => {
    setSaving(true);
    try {
      await restablecerPrivacidad();
      await cargarDatos();
      showToast('Privacidad restablecida. Todo es visible nuevamente.', 'success');
    } catch (err) {
      console.error('Error al restablecer:', err);
      showToast('Error al restablecer. Intenta nuevamente.', 'error');
    } finally {
      setSaving(false);
      setModalRestablecer(false);
    }
  };

  // ── Cálculos panel derecho ─────────────────────────────────────────────────
  const perfilPublico     = estadoActual.portafolio;
  const totalItems        = SECCIONES_KEYS.reduce((acc, sec) => acc + Object.keys(estadoActual[sec]).length, 0);
  const itemsVisibles     = SECCIONES_KEYS.reduce((acc, sec) => acc + Object.values(estadoActual[sec]).filter(Boolean).length, 0);
  const seccionesVisibles = SECCIONES_KEYS.filter((sec) => calcularTodos(estadoActual[sec]));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pv-page">
      <div className="pv-content-wrap">

        {/* ── COLUMNA IZQUIERDA ──────────────────────────── */}
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

          {/* Banner estado */}
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
            <div className="pv-toggle-row last">
              <div className="pv-toggle-left">
                <div className={`pv-sec-icon ${perfilPublico ? 'on' : 'off'}`}>
                  <IconGlobe />
                </div>
                <div className="pv-toggle-info">
                  <span className="pv-toggle-label">Perfil público</span>
                  <span className="pv-toggle-desc">
                    Permite que cualquier persona acceda a tu portafolio mediante URL
                  </span>
                </div>
              </div>
              <div className="pv-toggle-right">
                <span className={`pv-vis-badge ${perfilPublico ? 'visible' : 'hidden'}`}>
                  {perfilPublico ? 'Visible' : 'Oculto'}
                </span>
                <button
                  className={`pv-toggle-btn ${perfilPublico ? 'on' : 'off'}`}
                  onClick={handleTogglePortafolio}
                  role="switch"
                  aria-checked={perfilPublico}
                  aria-label="Perfil público"
                />
              </div>
            </div>
          </div>

          {/* Secciones con items individuales */}
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
            <div className="pv-secciones-lista">
              {SECCIONES_KEYS.map((seccion) => {
                const config = SECCIONES_CONFIG[seccion];
                return (
                  <SeccionPrivacidad
                    key={seccion}
                    titulo={config.titulo}
                    descripcion=""
                    icon={config.icon}
                    items={estadoActual[seccion]}
                    nombres={nombres[seccion]}
                    onToggleSeccion={(val) => handleToggleSeccion(seccion, val)}
                    onToggleItem={(id, val) => handleToggleItem(seccion, id, val)}
                  />
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
                onClick={() => setModalGuardar(true)}
              >
                Guardar cambios
              </button>
              <button
                className="pv-btn-ghost"
                disabled={!hayCambios || saving}
                onClick={handleRevertir}
              >
                Revertir
              </button>
              {!hayCambios && (
                <span className="pv-saved-ok">
                  <span className="pv-dot green"></span>
                  Todo guardado
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── COLUMNA DERECHA ────────────────────────────── */}
        <aside className="pv-col-right">

          {/* Vista previa */}
          <div className="pv-card">
            <p className="pv-card-label">Vista previa pública</p>
            <div className="pv-preview-box">
              <div className="pv-preview-topbar">
                <div className="pv-preview-dot"></div>
                <div className="pv-preview-bar short"></div>
              </div>
              {perfilPublico ? (
                <div className="pv-preview-body">
                  <div className="pv-preview-bar w60 mb4"></div>
                  <div className="pv-preview-bar w40 mb8"></div>
                  {seccionesVisibles.slice(0, 3).map((sec) => (
                    <div key={sec} className="pv-preview-section">
                      <div className="pv-preview-section-title">
                        {SECCIONES_CONFIG[sec].titulo}
                      </div>
                      <div className="pv-preview-bar w100 filled mb2"></div>
                      <div className="pv-preview-bar w75 filled"></div>
                    </div>
                  ))}
                  {SECCIONES_KEYS
                    .filter((s) => !calcularTodos(estadoActual[s]))
                    .slice(0, 2)
                    .map((sec) => (
                      <div key={sec} className="pv-preview-hidden">
                        <span>{SECCIONES_CONFIG[sec].titulo} oculto</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="pv-preview-locked">
                  <div className="pv-preview-lock-icon"><IconLock /></div>
                  <p>Este perfil es privado. No visible al público.</p>
                </div>
              )}
            </div>
            <div className="pv-link-label">Enlace del portafolio</div>
            <div className="pv-link-box">
              <span className="pv-link-url">portafolio.app/mi-portafolio</span>
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
                <span>Elementos visibles</span>
                <span className="pv-sum-val">{itemsVisibles} de {totalItems}</span>
              </div>
              <div className="pv-sum-row">
                <span>Secciones activas</span>
                <span className="pv-sum-val">{seccionesVisibles.length} de {SECCIONES_KEYS.length}</span>
              </div>
              <div className="pv-sum-row">
                <span>Acceso público</span>
                <span className={perfilPublico ? 'clr-green' : 'clr-red'}>
                  {perfilPublico ? 'Activo' : 'Bloqueado'}
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          {hayCambios && (
            <div className="pv-card pv-warn-card">
              <div className="pv-warn-icon">
                <svg viewBox="0 0 18 18" fill="currentColor">
                  <path d="M9 1L1 16h16L9 1zm0 3.5L15.1 15H2.9L9 4.5zM8 8v3h2V8H8zm0 4v2h2v-2H8z"/>
                </svg>
              </div>
              <div>
                <strong>Cambios sin guardar</strong>
                <p>Presiona "Guardar cambios" para aplicar la configuración.</p>
              </div>
            </div>
          )}

          {/* Restablecer */}
          {!loading && (
            <button
              className="pv-btn-restablecer-full"
              onClick={() => setModalRestablecer(true)}
              disabled={saving}
            >
              Restablecer todo a público
            </button>
          )}
        </aside>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={modalGuardar}
        tipo="info"
        titulo="Confirmar cambios"
        mensaje="Los cambios de visibilidad se aplicarán de inmediato. Los elementos desactivados dejarán de ser visibles en tu portafolio público."
        textoConfirmar="Guardar cambios"
        textoCancelar="Cancelar"
        loading={saving}
        onConfirm={handleGuardar}
        onCancel={() => setModalGuardar(false)}
      />

      <ConfirmModal
        isOpen={modalRestablecer}
        tipo="warning"
        titulo="Restablecer privacidad"
        mensaje="Se restablecerá la visibilidad de todos los elementos a público. Esta acción afecta a todos los proyectos, habilidades, experiencias y redes."
        textoConfirmar="Restablecer todo"
        textoCancelar="Cancelar"
        loading={saving}
        onConfirm={handleRestablecer}
        onCancel={() => setModalRestablecer(false)}
      />

      {/* Toast */}
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