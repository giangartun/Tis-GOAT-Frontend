import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUsuarios, suspenderUsuario, reactivarUsuario,
  getBitacora, descargarBackup, importarBackup,
} from '../Services/admin';
import type { UsuarioAdmin, BitacoraItem, FiltrosUsuarios, FiltrosBitacora } from '../Services/admin';
import './AdminUsuarios.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const iniciales = (nombre: string, apellido: string) =>
  `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });

const formatFechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-BO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

// ── Tipos locales ─────────────────────────────────────────────────────────────
type Tab = 'usuarios' | 'bitacora' | 'backup';
type ModalInfo =
  | { tipo: 'suspender'; usuario: UsuarioAdmin }
  | { tipo: 'reactivar'; usuario: UsuarioAdmin }
  | { tipo: 'importar'; archivo: File }
  | null;

// ── Componente principal ──────────────────────────────────────────────────────
const AdminUsuarios: React.FC = () => {
  const [tab, setTab]             = useState<Tab>('usuarios');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [modal, setModal]         = useState<ModalInfo>(null);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  // ── Estado usuarios ───────────────────────────────────────────────────────
  const [usuarios, setUsuarios]   = useState<UsuarioAdmin[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activos, setActivos]     = useState(0);
  const [suspendidos, setSuspendidos] = useState(0);
  const [paginaU, setPaginaU]     = useState(1);
  const [lastPageU, setLastPageU] = useState(1);
  const [filtrosU, setFiltrosU]   = useState<FiltrosUsuarios>({ estado: 'todos', per_page: 10 });

  // ── Estado bitácora ───────────────────────────────────────────────────────
  const [bitacora, setBitacora]   = useState<BitacoraItem[]>([]);
  const [totalBit, setTotalBit]   = useState(0);
  const [paginaB, setPaginaB]     = useState(1);
  const [lastPageB, setLastPageB] = useState(1);
  const [filtrosB, setFiltrosB]   = useState<FiltrosBitacora>({ tipo: 'todos' });

  // ── Backup ────────────────────────────────────────────────────────────────
  const [descargando, setDescargando] = useState(false);
  const [importando, setImportando]   = useState(false);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Carga usuarios ────────────────────────────────────────────────────────
  const cargarUsuarios = useCallback(async (pagina = 1) => {
    setLoading(true);
    try {
      const res = await getUsuarios({ ...filtrosU, page: pagina });
      setUsuarios(res.data);
      setTotalUsers(res.total);
      setActivos(res.activos);
      setSuspendidos(res.suspendidos);
      setPaginaU(res.current_page);
      setLastPageU(res.last_page);
    } catch {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtrosU]);

  // ── Carga bitácora ────────────────────────────────────────────────────────
  const cargarBitacora = useCallback(async (pagina = 1) => {
    setLoading(true);
    try {
      const res = await getBitacora({ ...filtrosB, page: pagina });
      setBitacora(res.data);
      setTotalBit(res.total);
      setPaginaB(res.current_page);
      setLastPageB(res.last_page);
    } catch {
      showToast('Error al cargar bitácora', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtrosB]);

  useEffect(() => { if (tab === 'usuarios') cargarUsuarios(1); }, [filtrosU, tab]);
  useEffect(() => { if (tab === 'bitacora') cargarBitacora(1); }, [filtrosB, tab]);
  useEffect(() => { cargarUsuarios(1); }, []);

  // ── Acciones ──────────────────────────────────────────────────────────────
  const handleSuspender = async () => {
    if (!modal || modal.tipo !== 'suspender') return;
    setSaving(true);
    try {
      await suspenderUsuario(modal.usuario.id);
      showToast('Cuenta suspendida correctamente', 'success');
      cargarUsuarios(paginaU);
    } catch {
      showToast('Error al suspender la cuenta', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleReactivar = async () => {
    if (!modal || modal.tipo !== 'reactivar') return;
    setSaving(true);
    try {
      await reactivarUsuario(modal.usuario.id);
      showToast('Cuenta reactivada correctamente', 'success');
      cargarUsuarios(paginaU);
    } catch {
      showToast('Error al reactivar la cuenta', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleDescargar = async () => {
    setDescargando(true);
    try {
      await descargarBackup();
      showToast('Backup descargado correctamente', 'success');
    } catch {
      showToast('Error al descargar el backup', 'error');
    } finally {
      setDescargando(false);
    }
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setModal({ tipo: 'importar', archivo });
    e.target.value = '';
  };

  const handleImportar = async () => {
    if (!modal || modal.tipo !== 'importar') return;
    setImportando(true);
    try {
      await importarBackup(modal.archivo);
      showToast('Backup importado correctamente', 'success');
      cargarUsuarios(1);
    } catch {
      showToast('Error al importar. Verifica el archivo.', 'error');
    } finally {
      setImportando(false);
      setModal(null);
    }
  };

  // ── Búsqueda con debounce ─────────────────────────────────────────────────
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFiltrosU((prev) => ({ ...prev, search: value || undefined }));
    }, 400);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ad-page">

      {/* ── TOPBAR ADMIN ── */}
      <header className="ad-topbar">
        <div className="ad-topbar-left">
          <span className="ad-admin-badge">ADMIN</span>
          <span className="ad-topbar-title">Sistema de Portafolios Digitales</span>
        </div>
        <div className="ad-topbar-user">
          <div className="ad-avatar">AD</div>
          <span>Administrador</span>
        </div>
      </header>

      {/* ── BREADCRUMB ── */}
      <div className="ad-subnav">
        <span>Admin</span>
        <span className="ad-sep">›</span>
        <span className="ad-cur">Gestión de usuarios</span>
      </div>

      <div className="ad-body">
        {/* ── SIDEBAR ── */}
        <aside className="ad-sidebar">
          <button
            className={`ad-sb-btn ${tab === 'usuarios' ? 'active' : ''}`}
            onClick={() => setTab('usuarios')}
            title="Usuarios"
          >
            <i className="ti ti-users" aria-hidden="true"></i>
          </button>
          <button
            className={`ad-sb-btn ${tab === 'bitacora' ? 'active' : ''}`}
            onClick={() => setTab('bitacora')}
            title="Bitácora"
          >
            <i className="ti ti-chart-bar" aria-hidden="true"></i>
          </button>
          <button
            className={`ad-sb-btn ${tab === 'backup' ? 'active' : ''}`}
            onClick={() => setTab('backup')}
            title="Backup"
          >
            <i className="ti ti-database" aria-hidden="true"></i>
          </button>
        </aside>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <main className="ad-main">

          {/* ════════════════ TAB: USUARIOS ════════════════ */}
          {tab === 'usuarios' && (
            <>
              <div className="ad-page-header">
                <div>
                  <h1 className="ad-page-title">Gestión de usuarios</h1>
                  <p className="ad-page-sub">Administra todas las cuentas registradas en la plataforma</p>
                </div>
              </div>

              {/* Métricas */}
              <div className="ad-metrics">
                <div className="ad-metric">
                  <div className="ad-metric-label">Total usuarios</div>
                  <div className="ad-metric-val">{totalUsers}</div>
                </div>
                <div className="ad-metric">
                  <div className="ad-metric-label">Cuentas activas</div>
                  <div className="ad-metric-val green">{activos}</div>
                </div>
                <div className="ad-metric">
                  <div className="ad-metric-label">Suspendidas</div>
                  <div className="ad-metric-val red">{suspendidos}</div>
                </div>
                <div className="ad-metric">
                  <div className="ad-metric-label">Registradas</div>
                  <div className="ad-metric-val">{totalUsers}</div>
                </div>
              </div>

              {/* Filtros */}
              <div className="ad-filters">
                <div className="ad-search-box">
                  <i className="ti ti-search" aria-hidden="true"></i>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <select
                  className="ad-select"
                  value={filtrosU.estado ?? 'todos'}
                  onChange={(e) =>
                    setFiltrosU((prev) => ({
                      ...prev,
                      estado: e.target.value as FiltrosUsuarios['estado'],
                    }))
                  }
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="suspendido">Suspendidos</option>
                </select>
              </div>

              {/* Tabla */}
              <div className="ad-card ad-table-card">
                {loading ? (
                  <div className="ad-skeleton-wrap">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="ad-skeleton-row">
                        <div className="ad-sk ad-sk-avatar"></div>
                        <div className="ad-sk-lines">
                          <div className="ad-sk ad-sk-title"></div>
                          <div className="ad-sk ad-sk-sub"></div>
                        </div>
                        <div className="ad-sk ad-sk-badge"></div>
                        <div className="ad-sk ad-sk-badge"></div>
                        <div className="ad-sk ad-sk-btn"></div>
                      </div>
                    ))}
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="ad-empty">
                    <i className="ti ti-users-off" aria-hidden="true"></i>
                    <p>No se encontraron usuarios</p>
                  </div>
                ) : (
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Registro</th>
                        <th>Último acceso</th>
                        <th className="th-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => (
                        <tr key={u.id} className={u.estado === 'suspendido' ? 'row-suspended' : ''}>
                          <td>
                            <div className="ad-user-cell">
                              <div className={`ad-av-sm ${u.estado === 'suspendido' ? 'sus' : ''}`}>
                                {iniciales(u.nombre, u.apellido_paterno)}
                              </div>
                              <div>
                                <div className="ad-user-name">
                                  {u.nombre} {u.apellido_paterno}
                                </div>
                                <div className="ad-user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`ad-badge ${u.rol === 'administrador' ? 'admin' : 'user'}`}>
                              {u.rol === 'administrador' ? 'Admin' : 'Usuario'}
                            </span>
                          </td>
                          <td>
                            <span className={`ad-badge ${u.estado === 'activo' ? 'active' : 'suspended'}`}>
                              {u.estado === 'activo' ? 'Activa' : 'Suspendida'}
                            </span>
                          </td>
                          <td className="td-muted">{formatFecha(u.created_at)}</td>
                          <td className="td-muted">
                            {u.ultimo_acceso ? formatFechaHora(u.ultimo_acceso) : 'Nunca'}
                          </td>
                          <td className="td-actions">
                            {u.rol !== 'administrador' && (
                              u.estado === 'activo' ? (
                                <button
                                  className="ad-btn-sm suspend"
                                  onClick={() => setModal({ tipo: 'suspender', usuario: u })}
                                >
                                  <i className="ti ti-ban" aria-hidden="true"></i> Suspender
                                </button>
                              ) : (
                                <button
                                  className="ad-btn-sm restore"
                                  onClick={() => setModal({ tipo: 'reactivar', usuario: u })}
                                >
                                  <i className="ti ti-check" aria-hidden="true"></i> Reactivar
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Paginación */}
                {!loading && lastPageU > 1 && (
                  <div className="ad-pagination">
                    <span className="ad-pag-info">
                      Página {paginaU} de {lastPageU} — {totalUsers} usuarios
                    </span>
                    <div className="ad-pag-btns">
                      <button
                        className="ad-pag-btn"
                        disabled={paginaU === 1}
                        onClick={() => cargarUsuarios(paginaU - 1)}
                      >
                        ← Anterior
                      </button>
                      <button
                        className="ad-pag-btn"
                        disabled={paginaU === lastPageU}
                        onClick={() => cargarUsuarios(paginaU + 1)}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════════════════ TAB: BITÁCORA ════════════════ */}
          {tab === 'bitacora' && (
            <>
              <div className="ad-page-header">
                <div>
                  <h1 className="ad-page-title">Bitácora de acciones</h1>
                  <p className="ad-page-sub">Historial de todas las acciones administrativas realizadas</p>
                </div>
              </div>

              {/* Filtros bitácora */}
              <div className="ad-filters">
                <div className="ad-filter-group">
                  <label className="ad-filter-label">Desde</label>
                  <input
                    type="date"
                    className="ad-date-input"
                    onChange={(e) =>
                      setFiltrosB((prev) => ({ ...prev, fecha_desde: e.target.value || undefined }))
                    }
                  />
                </div>
                <div className="ad-filter-group">
                  <label className="ad-filter-label">Hasta</label>
                  <input
                    type="date"
                    className="ad-date-input"
                    onChange={(e) =>
                      setFiltrosB((prev) => ({ ...prev, fecha_hasta: e.target.value || undefined }))
                    }
                  />
                </div>
                <select
                  className="ad-select"
                  value={filtrosB.tipo ?? 'todos'}
                  onChange={(e) =>
                    setFiltrosB((prev) => ({
                      ...prev,
                      tipo: e.target.value as FiltrosBitacora['tipo'],
                    }))
                  }
                >
                  <option value="todos">Todas las acciones</option>
                  <option value="suspender">Suspensiones</option>
                  <option value="reactivar">Reactivaciones</option>
                </select>
                <button className="ad-btn-outline" onClick={() => cargarBitacora(1)}>
                  <i className="ti ti-refresh" aria-hidden="true"></i> Aplicar
                </button>
              </div>

              {/* Tabla bitácora */}
              <div className="ad-card ad-table-card">
                {loading ? (
                  <div className="ad-skeleton-wrap">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="ad-skeleton-row">
                        <div className="ad-sk ad-sk-avatar"></div>
                        <div className="ad-sk-lines">
                          <div className="ad-sk ad-sk-title"></div>
                          <div className="ad-sk ad-sk-sub"></div>
                        </div>
                        <div className="ad-sk ad-sk-badge"></div>
                        <div className="ad-sk ad-sk-title" style={{width:'80px'}}></div>
                      </div>
                    ))}
                  </div>
                ) : bitacora.length === 0 ? (
                  <div className="ad-empty">
                    <i className="ti ti-clipboard-off" aria-hidden="true"></i>
                    <p>No hay registros en la bitácora</p>
                  </div>
                ) : (
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Usuario afectado</th>
                        <th>Acción</th>
                        <th>Administrador</th>
                        <th>Motivo</th>
                        <th>Fecha y hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bitacora.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <div className="ad-user-cell">
                              <div className={`ad-av-sm ${b.tipo_accion === 'suspender' ? 'sus' : ''}`}>
                                {b.usuario_afectado.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="ad-user-name">{b.usuario_afectado.nombre}</div>
                                <div className="ad-user-email">{b.usuario_afectado.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`ad-badge ${b.tipo_accion === 'suspender' ? 'suspended' : 'active'}`}>
                              {b.tipo_accion === 'suspender' ? 'Suspensión' : 'Reactivación'}
                            </span>
                          </td>
                          <td className="td-muted">{b.admin.nombre}</td>
                          <td className="td-muted">{b.motivo ?? '—'}</td>
                          <td className="td-muted">{formatFechaHora(b.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {!loading && lastPageB > 1 && (
                  <div className="ad-pagination">
                    <span className="ad-pag-info">
                      Página {paginaB} de {lastPageB} — {totalBit} registros
                    </span>
                    <div className="ad-pag-btns">
                      <button
                        className="ad-pag-btn"
                        disabled={paginaB === 1}
                        onClick={() => cargarBitacora(paginaB - 1)}
                      >
                        ← Anterior
                      </button>
                      <button
                        className="ad-pag-btn"
                        disabled={paginaB === lastPageB}
                        onClick={() => cargarBitacora(paginaB + 1)}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════════════════ TAB: BACKUP ════════════════ */}
          {tab === 'backup' && (
            <>
              <div className="ad-page-header">
                <div>
                  <h1 className="ad-page-title">Gestión de backup</h1>
                  <p className="ad-page-sub">Exporta o restaura los datos de la plataforma</p>
                </div>
              </div>

              <div className="ad-backup-grid">
                {/* Descargar */}
                <div className="ad-card ad-backup-card">
                  <div className="ad-backup-icon download">
                    <i className="ti ti-download" aria-hidden="true"></i>
                  </div>
                  <h3 className="ad-backup-title">Exportar backup</h3>
                  <p className="ad-backup-desc">
                    Descarga un archivo con todos los datos actuales de la plataforma.
                    El archivo se generará en formato JSON.
                  </p>
                  <button
                    className="ad-btn-navy"
                    onClick={handleDescargar}
                    disabled={descargando}
                  >
                    <i className="ti ti-download" aria-hidden="true"></i>
                    {descargando ? 'Generando...' : 'Descargar backup'}
                  </button>
                </div>

                {/* Importar */}
                <div className="ad-card ad-backup-card">
                  <div className="ad-backup-icon upload">
                    <i className="ti ti-upload" aria-hidden="true"></i>
                  </div>
                  <h3 className="ad-backup-title">Importar backup</h3>
                  <p className="ad-backup-desc">
                    Carga un archivo de backup para restaurar datos. Se validará el
                    archivo antes de aplicar los cambios. Formatos: .json o .zip (máx. 10MB).
                  </p>
                  <div className="ad-upload-area" onClick={() => fileInputRef.current?.click()}>
                    <i className="ti ti-file-upload" aria-hidden="true"></i>
                    <span>Haz clic para seleccionar el archivo</span>
                    <span className="ad-upload-sub">JSON o ZIP, máximo 10 MB</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.zip"
                    style={{ display: 'none' }}
                    onChange={handleArchivoSeleccionado}
                  />
                  <div className="ad-backup-warning">
                    <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                    <span>Esta acción puede sobreescribir datos existentes. Procede con cuidado.</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* ── MODALS ───────────────────────────────────────── */}
      {modal && modal.tipo === 'suspender' && (
        <div className="ad-modal-backdrop" onClick={() => setModal(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-icon suspend">
              <i className="ti ti-ban" aria-hidden="true"></i>
            </div>
            <h3 className="ad-modal-title">Confirmar suspensión</h3>
            <p className="ad-modal-desc">
              La cuenta será suspendida de inmediato. El usuario no podrá acceder a
              la plataforma hasta que sea reactivada.
            </p>
            <div className="ad-modal-user">
              <div className="ad-av-sm sus">
                {iniciales(modal.usuario.nombre, modal.usuario.apellido_paterno)}
              </div>
              <div>
                <div className="ad-user-name">
                  {modal.usuario.nombre} {modal.usuario.apellido_paterno}
                </div>
                <div className="ad-user-email">{modal.usuario.email}</div>
              </div>
            </div>
            <div className="ad-modal-actions">
              <button className="ad-btn-cancel" onClick={() => setModal(null)} disabled={saving}>
                Cancelar
              </button>
              <button className="ad-btn-confirm suspend" onClick={handleSuspender} disabled={saving}>
                <i className="ti ti-ban" aria-hidden="true"></i>
                {saving ? 'Procesando...' : 'Suspender cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && modal.tipo === 'reactivar' && (
        <div className="ad-modal-backdrop" onClick={() => setModal(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-icon restore">
              <i className="ti ti-check" aria-hidden="true"></i>
            </div>
            <h3 className="ad-modal-title">Confirmar reactivación</h3>
            <p className="ad-modal-desc">
              La cuenta será reactivada y el usuario podrá acceder nuevamente a la plataforma.
            </p>
            <div className="ad-modal-user">
              <div className="ad-av-sm">
                {iniciales(modal.usuario.nombre, modal.usuario.apellido_paterno)}
              </div>
              <div>
                <div className="ad-user-name">
                  {modal.usuario.nombre} {modal.usuario.apellido_paterno}
                </div>
                <div className="ad-user-email">{modal.usuario.email}</div>
              </div>
            </div>
            <div className="ad-modal-actions">
              <button className="ad-btn-cancel" onClick={() => setModal(null)} disabled={saving}>
                Cancelar
              </button>
              <button className="ad-btn-confirm restore" onClick={handleReactivar} disabled={saving}>
                <i className="ti ti-check" aria-hidden="true"></i>
                {saving ? 'Procesando...' : 'Reactivar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && modal.tipo === 'importar' && (
        <div className="ad-modal-backdrop" onClick={() => setModal(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-icon upload">
              <i className="ti ti-upload" aria-hidden="true"></i>
            </div>
            <h3 className="ad-modal-title">Confirmar importación</h3>
            <p className="ad-modal-desc">
              Se importará el archivo <strong>{modal.archivo.name}</strong>. Esta acción
              puede sobreescribir datos existentes. ¿Deseas continuar?
            </p>
            <div className="ad-modal-actions">
              <button className="ad-btn-cancel" onClick={() => setModal(null)} disabled={importando}>
                Cancelar
              </button>
              <button className="ad-btn-confirm suspend" onClick={handleImportar} disabled={importando}>
                <i className="ti ti-upload" aria-hidden="true"></i>
                {importando ? 'Importando...' : 'Confirmar importación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ──────────────────────────────────────── */}
      {toast && (
        <div className={`ad-toast ${toast.type}`}>
          <span className={`ad-toast-dot ${toast.type}`}></span>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;