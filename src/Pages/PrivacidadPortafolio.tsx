import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
    <path d="M1 4a1 1 0 0 1 1-1h5l2 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z" />
  </svg>
);

const IconSkill = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M9 1l2.39 4.84L17 6.76l-4 3.9.94 5.5L9 13.77l-4.94 2.6L5 10.66 1 6.76l5.61-.92z" />
  </svg>
);

const IconAcad = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M9 1L1 5l8 4 8-4-8-4zM1 9l8 4 8-4M1 13l8 4 8-4" />
  </svg>
);

const IconWork = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <path d="M6 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm2-1v1h2V3H8zM3 8v5h12V8H3z" />
  </svg>
);

const IconNet = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" width="16" height="16">
    <circle cx="9" cy="4" r="2" />
    <circle cx="3" cy="14" r="2" />
    <circle cx="15" cy="14" r="2" />
    <path d="M9 6v3M9 9l-4 4M9 9l4 4" />
  </svg>
);

const SECCIONES_CONFIG: Record<ClaveSeccion, { tituloKey: string; icon: React.FC }> = {
  proyectos: { tituloKey: 'privacyPortfolio.sections.projects', icon: IconFolder },
  habilidades: { tituloKey: 'privacyPortfolio.sections.skills', icon: IconSkill },
  experiencia_academica: {
    tituloKey: 'privacyPortfolio.sections.academic_experience',
    icon: IconAcad,
  },
  experiencia_laboral: {
    tituloKey: 'privacyPortfolio.sections.work_experience',
    icon: IconWork,
  },
  redes_profesionales: {
    tituloKey: 'privacyPortfolio.sections.professional_networks',
    icon: IconNet,
  },
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

const PrivacidadPortafolio: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estadoActual, setEstadoActual] = useState<EstadoFrontend>(ESTADO_VACIO);
  const [estadoOriginal, setEstadoOriginal] = useState<EstadoFrontend>(ESTADO_VACIO);
  const [nombres, setNombres] = useState<NombresItems>(NOMBRES_VACIOS);
  const [modalGuardar, setModalGuardar] = useState(false);
  const [modalRestablecer, setModalRestablecer] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      showToast(t('privacyPortfolio.messages.load_error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const hayCambios = JSON.stringify(estadoActual) !== JSON.stringify(estadoOriginal);

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

  const handleToggleItem = (
    seccion: ClaveSeccion,
    id: string,
    nuevoValor: boolean
  ) => {
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
      showToast(t('privacyPortfolio.messages.saved'), 'success');
    } catch (err) {
      console.error('Error al guardar:', err);
      showToast(t('privacyPortfolio.messages.save_error'), 'error');
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
      showToast(t('privacyPortfolio.messages.reset_success'), 'success');
    } catch (err) {
      console.error('Error al restablecer:', err);
      showToast(t('privacyPortfolio.messages.reset_error'), 'error');
    } finally {
      setSaving(false);
      setModalRestablecer(false);
    }
  };

  const perfilPublico = estadoActual.portafolio;
  const totalItems = SECCIONES_KEYS.reduce(
    (acc, sec) => acc + Object.keys(estadoActual[sec]).length,
    0
  );
  const itemsVisibles = SECCIONES_KEYS.reduce(
    (acc, sec) => acc + Object.values(estadoActual[sec]).filter(Boolean).length,
    0
  );
  const seccionesVisibles = SECCIONES_KEYS.filter((sec) =>
    calcularTodos(estadoActual[sec])
  );

  return (
    <div className="pv-page">
      <div className="pv-content-wrap">
        <div className="pv-col-left">
          <div className="pv-page-header">
            <div>
              <h1 className="pv-page-title">
                {t('privacyPortfolio.title')}
              </h1>

              <p className="pv-page-sub">
                {t('privacyPortfolio.subtitle')}
              </p>
            </div>

            {hayCambios && (
              <div className="pv-changes-pill">
                <span className="pv-dot amber"></span>
                {t('privacyPortfolio.status.unsaved_changes')}
              </div>
            )}
          </div>

          <div className={`pv-status-banner ${perfilPublico ? 'pub' : 'priv'}`}>
            <div className="pv-status-dot"></div>

            <div className="pv-status-text">
              <strong>
                {perfilPublico
                  ? t('privacyPortfolio.status.public_profile')
                  : t('privacyPortfolio.status.private_profile')}
              </strong>

              <p>
                {perfilPublico
                  ? t('privacyPortfolio.status.public_description')
                  : t('privacyPortfolio.status.private_description')}
              </p>
            </div>
          </div>

          <div className="pv-card">
            <p className="pv-card-label">
              {t('privacyPortfolio.general_visibility')}
            </p>

            <div className="pv-toggle-row last">
              <div className="pv-toggle-left">
                <div className={`pv-sec-icon ${perfilPublico ? 'on' : 'off'}`}>
                  <IconGlobe />
                </div>

                <div className="pv-toggle-info">
                  <span className="pv-toggle-label">
                    {t('privacyPortfolio.status.public_profile')}
                  </span>

                  <span className="pv-toggle-desc">
                    {t('privacyPortfolio.general_description')}
                  </span>
                </div>
              </div>

              <div className="pv-toggle-right">
                <span className={`pv-vis-badge ${perfilPublico ? 'visible' : 'hidden'}`}>
                  {perfilPublico
                    ? t('privacyPortfolio.visibility.visible')
                    : t('privacyPortfolio.visibility.hidden')}
                </span>

                <button
                  className={`pv-toggle-btn ${perfilPublico ? 'on' : 'off'}`}
                  onClick={handleTogglePortafolio}
                  role="switch"
                  aria-checked={perfilPublico}
                  aria-label={t('privacyPortfolio.status.public_profile')}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="pv-card">
              <p className="pv-card-label">
                {t('privacyPortfolio.section_visibility')}
              </p>

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
                    titulo={t(config.tituloKey)}
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

          {!loading && (
            <div className="pv-actions">
              <button
                className="pv-btn-primary"
                disabled={!hayCambios || saving}
                onClick={() => setModalGuardar(true)}
              >
                {t('privacyPortfolio.actions.save_changes')}
              </button>

              <button
                className="pv-btn-ghost"
                disabled={!hayCambios || saving}
                onClick={handleRevertir}
              >
                {t('privacyPortfolio.actions.revert')}
              </button>

              {!hayCambios && (
                <span className="pv-saved-ok">
                  <span className="pv-dot green"></span>
                  {t('privacyPortfolio.status.all_saved')}
                </span>
              )}
            </div>
          )}
        </div>

        <aside className="pv-col-right">
          <div className="pv-card">
            <p className="pv-card-label">
              {t('privacyPortfolio.preview.title')}
            </p>

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
                        {t(SECCIONES_CONFIG[sec].tituloKey)}
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
                        <span>
                          {t('privacyPortfolio.preview.hidden_section', {
                            section: t(SECCIONES_CONFIG[sec].tituloKey),
                          })}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="pv-preview-locked">
                  <div className="pv-preview-lock-icon">
                    <IconLock />
                  </div>

                  <p>{t('privacyPortfolio.preview.private_message')}</p>
                </div>
              )}
            </div>

            <div className="pv-link-label">
              {t('privacyPortfolio.preview.portfolio_link')}
            </div>

            <div className="pv-link-box">
              <span className="pv-link-url">portafolio.app/mi-portafolio</span>
              <button className="pv-link-copy">
                {t('privacyPortfolio.actions.copy')}
              </button>
            </div>
          </div>

          <div className="pv-card">
            <p className="pv-card-label">
              {t('privacyPortfolio.current_status.title')}
            </p>

            <div className="pv-summary-rows">
              <div className="pv-sum-row">
                <span>{t('privacyPortfolio.current_status.visibility')}</span>

                <span className={perfilPublico ? 'clr-green' : 'clr-red'}>
                  {perfilPublico
                    ? t('privacyPortfolio.current_status.public')
                    : t('privacyPortfolio.current_status.private')}
                </span>
              </div>

              <div className="pv-sum-row">
                <span>{t('privacyPortfolio.current_status.visible_items')}</span>

                <span className="pv-sum-val">
                  {itemsVisibles} {t('privacyPortfolio.current_status.of')} {totalItems}
                </span>
              </div>

              <div className="pv-sum-row">
                <span>{t('privacyPortfolio.current_status.active_sections')}</span>

                <span className="pv-sum-val">
                  {seccionesVisibles.length} {t('privacyPortfolio.current_status.of')} {SECCIONES_KEYS.length}
                </span>
              </div>

              <div className="pv-sum-row">
                <span>{t('privacyPortfolio.current_status.public_access')}</span>

                <span className={perfilPublico ? 'clr-green' : 'clr-red'}>
                  {perfilPublico
                    ? t('privacyPortfolio.current_status.active')
                    : t('privacyPortfolio.current_status.blocked')}
                </span>
              </div>
            </div>
          </div>

          {hayCambios && (
            <div className="pv-card pv-warn-card">
              <div className="pv-warn-icon">
                <svg viewBox="0 0 18 18" fill="currentColor">
                  <path d="M9 1L1 16h16L9 1zm0 3.5L15.1 15H2.9L9 4.5zM8 8v3h2V8H8zm0 4v2h2v-2H8z" />
                </svg>
              </div>

              <div>
                <strong>{t('privacyPortfolio.status.unsaved_changes')}</strong>
                <p>{t('privacyPortfolio.status.unsaved_description')}</p>
              </div>
            </div>
          )}

          {!loading && (
            <button
              className="pv-btn-restablecer-full"
              onClick={() => setModalRestablecer(true)}
              disabled={saving}
            >
              {t('privacyPortfolio.actions.reset_all_public')}
            </button>
          )}
        </aside>
      </div>

      <ConfirmModal
        isOpen={modalGuardar}
        tipo="info"
        titulo={t('privacyPortfolio.modals.save.title')}
        mensaje={t('privacyPortfolio.modals.save.message')}
        textoConfirmar={t('privacyPortfolio.actions.save_changes')}
        textoCancelar={t('privacyPortfolio.actions.cancel')}
        loading={saving}
        onConfirm={handleGuardar}
        onCancel={() => setModalGuardar(false)}
      />

      <ConfirmModal
        isOpen={modalRestablecer}
        tipo="warning"
        titulo={t('privacyPortfolio.modals.reset.title')}
        mensaje={t('privacyPortfolio.modals.reset.message')}
        textoConfirmar={t('privacyPortfolio.actions.reset_all')}
        textoCancelar={t('privacyPortfolio.actions.cancel')}
        loading={saving}
        onConfirm={handleRestablecer}
        onCancel={() => setModalRestablecer(false)}
      />

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