import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe2, Check } from 'lucide-react';
import {
  getUsuarios, suspenderUsuario, reactivarUsuario,
  getBitacora, descargarBackup, importarBackup,
  getTecnologias, crearTecnologia, modificarTecnologia, eliminarTecnologia,
  getGrados, crearGrado, modificarGrado, eliminarGrado,
  getAnuncios, crearAnuncio, modificarAnuncio, eliminarAnuncio,
} from '../Services/admin';
import type {
  UsuarioAdmin, BitacoraItem, FiltrosUsuarios, FiltrosBitacora,
  TipoBitacora, Tecnologia, Grado, Anuncio,
} from '../Services/admin';

// ── Componentes auxiliares ────────────────────────────────────────────────────

const Modal: React.FC<{ children: React.ReactNode; onClose: () => void; wide?: boolean }> = ({ children, onClose, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
    <div className={`bg-white rounded-2xl shadow-2xl p-7 w-full max-h-[90vh] overflow-y-auto ${wide ? 'max-w-xl' : 'max-w-md'}`} onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const Skeleton: React.FC<{ n?: number }> = ({ n = 4 }) => (
  <div className="p-4 space-y-3">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/5" />
          <div className="h-2 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-7 w-20 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

const Badge: React.FC<{ cls: string; children: React.ReactNode }> = ({ cls, children }) => (
  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cls}`}>{children}</span>
);

const BtnRound: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'red' | 'green' | 'blue' | 'ghost' }> = ({ variant = 'ghost', className = '', ...props }) => {
  const v = {
    red:   'bg-red-600 text-white hover:bg-red-700',
    green: 'bg-green-600 text-white hover:bg-green-700',
    blue:  'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
  }[variant];
  return <button className={`rounded-full py-2 text-sm font-medium disabled:opacity-50 transition ${v} ${className}`} {...props} />;
};

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    <input className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" {...props} />
  </div>
);

const Paginacion: React.FC<{ pagina: number; lastPage: number; total: number; label: string; onPrev: () => void; onNext: () => void }> = ({ pagina, lastPage, total, label, onPrev, onNext }) => {
  const { t } = useTranslation();
  return lastPage > 1 ? (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-400">{t('admin.pagination.page_info', { page: pagina, last: lastPage, total, label })}</span>
      <div className="flex gap-2">
        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs disabled:opacity-40" disabled={pagina === 1} onClick={onPrev}>{`← ${t('admin.pagination.previous')}`}</button>
        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs disabled:opacity-40" disabled={pagina === lastPage} onClick={onNext}>{`${t('admin.pagination.next')} →`}</button>
      </div>
    </div>
  ) : null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const iniciales = (n: string) => { const p = n.trim().split(' '); return (p.length >= 2 ? p[0][0] + p[1][0] : p[0].slice(0, 2)).toUpperCase(); };

const TIPO_LABEL_KEYS: Record<string, string> = {
  cuenta_suspendida: 'admin.bitacora.types.cuenta_suspendida',
  cuenta_reactivada: 'admin.bitacora.types.cuenta_reactivada',
  cuenta_creada: 'admin.bitacora.types.cuenta_creada',
  inicio_sesion: 'admin.bitacora.types.inicio_sesion',
  cierre_sesion: 'admin.bitacora.types.cierre_sesion',
  modificacion_perfil: 'admin.bitacora.types.modificacion_perfil',
  modificacion_foto: 'admin.bitacora.types.modificacion_foto',
  modificacion_tecnologias: 'admin.bitacora.types.modificacion_tecnologias',
  modificacion_habilidades: 'admin.bitacora.types.modificacion_habilidades',
  modificacion_experiencia_laboral: 'admin.bitacora.types.modificacion_experiencia_laboral',
  modificacion_experiencia_academica: 'admin.bitacora.types.modificacion_experiencia_academica',
  modificacion_redes_sociales: 'admin.bitacora.types.modificacion_redes_sociales',
  modificacion_proyectos: 'admin.bitacora.types.modificacion_proyectos',
  modificacion_evidencias: 'admin.bitacora.types.modificacion_evidencias',
  modificacion_privacidad: 'admin.bitacora.types.modificacion_privacidad',
  modificacion_plantilla: 'admin.bitacora.types.modificacion_plantilla',
  importacion_backup: 'admin.bitacora.types.importacion_backup',
};

const colorTipo = (t: string) => {
  if (t.includes('suspendida')) return 'bg-red-100 text-red-700';
  if (t.includes('reactivada')) return 'bg-green-100 text-green-700';
  if (t.includes('creada'))     return 'bg-blue-100 text-blue-700';
  if (t.includes('sesion'))     return 'bg-yellow-100 text-yellow-700';
  if (t.includes('backup'))     return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-600';
};

const FECHA_MIN = '2024-01-01';
const FECHA_MAX = '2030-12-31';

type Tab = 'usuarios' | 'bitacora' | 'backup' | 'tecnologias' | 'grados' | 'anuncios';

type ModalInfo =
  | { tipo: 'suspender' | 'reactivar'; usuario: UsuarioAdmin }
  | { tipo: 'importar'; archivo: File }
  | { tipo: 'nueva-tecnologia' }
  | { tipo: 'editar-tecnologia'; item: Tecnologia }
  | { tipo: 'eliminar-tecnologia'; item: Tecnologia }
  | { tipo: 'nuevo-grado' }
  | { tipo: 'editar-grado'; item: Grado }
  | { tipo: 'eliminar-grado'; item: Grado }
  | { tipo: 'nuevo-anuncio' }
  | { tipo: 'editar-anuncio'; item: Anuncio }
  | { tipo: 'eliminar-anuncio'; item: Anuncio }
  | null;

type CodigoIdioma = 'ES' | 'FR' | 'EN';

interface Idioma {
  codigo: CodigoIdioma;
  nombreKey: string;
  bandera: string;
  i18nCode: string;
}

const IDIOMAS: Idioma[] = [
  { codigo: 'ES', nombreKey: 'layout.languages.spanish', bandera: '🇪🇸', i18nCode: 'es' },
  { codigo: 'FR', nombreKey: 'layout.languages.french',  bandera: '🇫🇷', i18nCode: 'fr' },
  { codigo: 'EN', nombreKey: 'layout.languages.english', bandera: '🇺🇸', i18nCode: 'en' },
];

const obtenerIdiomaInicial = (): Idioma => {
  const langGuardado = localStorage.getItem('lang') || 'es';
  return IDIOMAS.find((idioma) => idioma.i18nCode === langGuardado) || IDIOMAS[0];
};

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [abierto, setAbierto] = useState(false);
  const [idiomaActual, setIdiomaActual] = useState<Idioma>(obtenerIdiomaInicial);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const idiomaGuardado = localStorage.getItem('lang') || 'es';
    const idiomaEncontrado = IDIOMAS.find((idioma) => idioma.i18nCode === idiomaGuardado) || IDIOMAS[0];
    setIdiomaActual(idiomaEncontrado);
    i18n.changeLanguage(idiomaGuardado);
  }, [i18n]);

  useEffect(() => {
    const cerrarDropdown = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener('mousedown', cerrarDropdown);
    return () => document.removeEventListener('mousedown', cerrarDropdown);
  }, []);

  const cambiarIdioma = (idioma: Idioma) => {
    setIdiomaActual(idioma);
    localStorage.setItem('idioma', idioma.codigo);
    localStorage.setItem('lang', idioma.i18nCode);
    i18n.changeLanguage(idioma.i18nCode);
    setAbierto(false);
  };

  return (
    <div ref={selectorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        <Globe2 size={17} />
        <span>{idiomaActual.codigo}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 text-gray-800 shadow-xl">
          {IDIOMAS.map((idioma) => (
            <button
              key={idioma.codigo}
              type="button"
              onClick={() => cambiarIdioma(idioma)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{idioma.bandera}</span>
                <span>{t(idioma.nombreKey)}</span>
              </div>
              {idiomaActual.codigo === idioma.codigo && (
                <Check size={17} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TABS: Tab[] = ['usuarios', 'bitacora', 'tecnologias', 'grados', 'anuncios', 'backup'];

// ── Componente principal ──────────────────────────────────────────────────────

const AdminUsuarios: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tab, setTab]         = useState<Tab>('usuarios');
  const [saving, setSaving]   = useState(false);
  const [modal, setModal]     = useState<ModalInfo>(null);
  const [modalCtx, setModalCtx] = useState<BitacoraItem | null>(null);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileRef               = useRef<HTMLInputElement>(null);
  const fotoRef               = useRef<HTMLInputElement>(null);

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loadU, setLoadU]       = useState(true);
  const [totU, setTotU]         = useState(0);
  const [totA, setTotA]         = useState(0);
  const [totS, setTotS]         = useState(0);
  const [pagU, setPagU]         = useState(1);
  const [lastU, setLastU]       = useState(1);
  const [filtU, setFiltU]       = useState<FiltrosUsuarios>({ estado: 'todos', per_page: 10 });
  const searchT                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bitacora, setBitacora] = useState<BitacoraItem[]>([]);
  const [loadB, setLoadB]       = useState(false);
  const [totB, setTotB]         = useState(0);
  const [pagB, setPagB]         = useState(1);
  const [lastB, setLastB]       = useState(1);
  const [filtB, setFiltB]       = useState<FiltrosBitacora>({ tipo: 'todos' });
  const [errDesde, setErrDesde] = useState('');
  const [errHasta, setErrHasta] = useState('');

  const [descargando, setDescargando] = useState(false);
  const [importando, setImportando]   = useState(false);

  const [tecns, setTecns]     = useState<Tecnologia[]>([]);
  const [loadT, setLoadT]     = useState(false);
  const [formTec, setFormTec] = useState({ nombre: '', categoria: '' });

  const [grados, setGrados]       = useState<Grado[]>([]);
  const [loadG, setLoadG]         = useState(false);
  const [formGrado, setFormGrado] = useState({ nombre_grado: '' });

  const [anuncios, setAnuncios]   = useState<Anuncio[]>([]);
  const [loadAN, setLoadAN]       = useState(false);
  const [formAN, setFormAN]       = useState({ titulo: '', descripcion: '', url_redireccion: '' });
  const [fotoFile, setFotoFile]   = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [fotoEliminada, setFotoEliminada] = useState(false);

  const toast$ = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const closeM  = () => setModal(null);

  const etiquetaTipo = (tipo: string) => t(TIPO_LABEL_KEYS[tipo] ?? tipo);
  const obtenerTabLabel = (key: Tab) => t(`admin.tabs.${key}`);
  const obtenerRolLabel = (rol: string) => rol === 'admin' ? t('admin.users.role_admin') : t('admin.users.role_user');
  const obtenerEstadoLabel = (estado: string) => estado === 'activo' ? t('admin.users.status_active') : t('admin.users.status_suspended');
  const obtenerFiltroBitacora = (tipo: TipoBitacora | 'todos') => {
    const map: Record<string, string> = {
      todos: 'admin.bitacora.filters.all',
      suspender: 'admin.bitacora.filters.suspensions',
      reactivar: 'admin.bitacora.filters.reactivations',
      modificaciones: 'admin.bitacora.filters.modifications',
      creacion: 'admin.bitacora.filters.creations',
      login: 'admin.bitacora.filters.login',
      logout: 'admin.bitacora.filters.logout',
    };
    return t(map[tipo] ?? 'admin.bitacora.filters.all');
  };

  const logout = async () => {
    try {
      const t = localStorage.getItem('token');
      if (t) await fetch(import.meta.env.VITE_API_URL + '/api/usuario/logout', { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', Accept: 'application/json' } });
    } catch { /* silent */ } finally { localStorage.clear(); navigate('/login', { replace: true }); }
  };

  const loadUsuarios = useCallback(async (p = 1) => {
    setLoadU(true);
    try { const r = await getUsuarios({ ...filtU, page: p }); setUsuarios(r.data_usuarios); setTotU(r.total_usuarios); setTotA(r.total_activos); setTotS(r.total_suspendidos); setPagU(r.current_page); setLastU(r.last_page); }
    catch { toast$(t('admin.notifications.error_load_users'), 'error'); } finally { setLoadU(false); }
  }, [filtU, t]);

  const loadBitacora = useCallback(async (p = 1) => {
    setLoadB(true);
    try { const r = await getBitacora({ ...filtB, page: p }); setBitacora(r.data); setTotB(r.total); setPagB(r.current_page); setLastB(r.last_page); }
    catch { toast$(t('admin.notifications.error_load_bitacora'), 'error'); } finally { setLoadB(false); }
  }, [filtB, t]);

  const loadTecns    = async () => { setLoadT(true); try { setTecns((await getTecnologias()).tecnologias); } catch { toast$(t('admin.notifications.error_load_technologies'), 'error'); } finally { setLoadT(false); } };
  const loadGrados   = async () => { setLoadG(true); try { setGrados((await getGrados()).grados); } catch { toast$(t('admin.notifications.error_load_grades'), 'error'); } finally { setLoadG(false); } };
  const loadAnuncios = async () => { setLoadAN(true); try { setAnuncios((await getAnuncios()).anuncios); } catch { toast$(t('admin.notifications.error_load_ads'), 'error'); } finally { setLoadAN(false); } };

  useEffect(() => { loadUsuarios(1); }, [filtU]);
  useEffect(() => { if (tab === 'bitacora')    loadBitacora(1);  }, [filtB, tab]);
  useEffect(() => { if (tab === 'tecnologias') loadTecns();      }, [tab]);
  useEffect(() => { if (tab === 'grados')      loadGrados();     }, [tab]);
  useEffect(() => { if (tab === 'anuncios')    loadAnuncios();   }, [tab]);

  const onSearch     = (v: string) => { if (searchT.current) clearTimeout(searchT.current); searchT.current = setTimeout(() => setFiltU(p => ({ ...p, search: v || undefined })), 400); };
  const validFecha   = (v: string) => { if (!v) return ''; if (isNaN(new Date(v).getTime())) return t('admin.validation.invalid_date'); if (v < FECHA_MIN) return t('admin.validation.min_date', { date: FECHA_MIN }); if (v > FECHA_MAX) return t('admin.validation.max_date', { date: FECHA_MAX }); return ''; };
  const onFechaDesde = (v: string) => { const e = validFecha(v); setErrDesde(e); if (!e) setFiltB(p => ({ ...p, fecha_desde: v || undefined })); };
  const onFechaHasta = (v: string) => { const e = validFecha(v); setErrHasta(e); if (!e) setFiltB(p => ({ ...p, fecha_hasta: v || undefined })); };

  const doSuspender = async () => {
    if (!modal || modal.tipo !== 'suspender') return;
    setSaving(true); try { await suspenderUsuario(modal.usuario.id_usuario); toast$(t('admin.notifications.account_suspended'), 'success'); loadUsuarios(pagU); } catch { toast$(t('admin.notifications.error_suspend'), 'error'); } finally { setSaving(false); closeM(); }
  };

  const doReactivar = async () => {
    if (!modal || modal.tipo !== 'reactivar') return;
    setSaving(true); try { await reactivarUsuario(modal.usuario.id_usuario); toast$(t('admin.notifications.account_reactivated'), 'success'); loadUsuarios(pagU); } catch { toast$(t('admin.notifications.error_reactivate'), 'error'); } finally { setSaving(false); closeM(); }
  };

  const doDescargar = async () => { setDescargando(true); try { await descargarBackup(); toast$(t('admin.notifications.backup_downloaded'), 'success'); } catch { toast$(t('admin.notifications.error_download'), 'error'); } finally { setDescargando(false); } };

  const onArchivo = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setModal({ tipo: 'importar', archivo: f }); e.target.value = ''; };

  const doImportar = async () => {
    if (!modal || modal.tipo !== 'importar') return;
    setImportando(true);
    try { await importarBackup(modal.archivo); toast$(t('admin.notifications.backup_imported'), 'success'); setTimeout(() => { localStorage.clear(); navigate('/login', { replace: true, state: { message: t('admin.notifications.backup_imported_login') } }); }, 2000); }
    catch { toast$(t('admin.notifications.error_import'), 'error'); setImportando(false); closeM(); }
  };

  const doGuardarTec = async () => {
    if (!formTec.nombre.trim() || !formTec.categoria.trim()) { toast$(t('admin.notifications.required_name_category'), 'error'); return; }
    setSaving(true);
    try {
      if (modal?.tipo === 'nueva-tecnologia')  { await crearTecnologia(formTec); toast$(t('admin.notifications.technology_created'), 'success'); }
      if (modal?.tipo === 'editar-tecnologia') { await modificarTecnologia(modal.item.id_tecnologia, formTec); toast$(t('admin.notifications.technology_updated'), 'success'); }
      loadTecns();
    } catch { toast$(t('admin.notifications.error_save'), 'error'); } finally { setSaving(false); closeM(); }
  };

  const doEliminarTec = async () => {
    if (!modal || modal.tipo !== 'eliminar-tecnologia') return;
    setSaving(true); try { await eliminarTecnologia(modal.item.id_tecnologia); toast$(t('admin.notifications.technology_deleted'), 'success'); loadTecns(); } catch { toast$(t('admin.notifications.error_delete'), 'error'); } finally { setSaving(false); closeM(); }
  };

  const doGuardarGrado = async () => {
    if (!formGrado.nombre_grado.trim()) { toast$(t('admin.notifications.required_degree_name'), 'error'); return; }
    setSaving(true);
    try {
      if (modal?.tipo === 'nuevo-grado')  { await crearGrado(formGrado); toast$(t('admin.notifications.degree_created'), 'success'); }
      if (modal?.tipo === 'editar-grado') { await modificarGrado(modal.item.id_grado, formGrado); toast$(t('admin.notifications.degree_updated'), 'success'); }
      loadGrados();
    } catch { toast$(t('admin.notifications.error_save'), 'error'); } finally { setSaving(false); closeM(); }
  };

  const doEliminarGrado = async () => {
    if (!modal || modal.tipo !== 'eliminar-grado') return;
    setSaving(true); try { await eliminarGrado(modal.item.id_grado); toast$(t('admin.notifications.degree_deleted'), 'success'); loadGrados(); } catch { toast$(t('admin.notifications.error_delete'), 'error'); } finally { setSaving(false); closeM(); }
  };

  const resetAN = () => { setFormAN({ titulo: '', descripcion: '', url_redireccion: '' }); setFotoFile(null); setPreview(null); setFotoEliminada(false); };
  const onFoto  = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setFotoFile(f); setPreview(URL.createObjectURL(f)); };

  const doGuardarAN = async () => {
    if (!formAN.titulo.trim() || !formAN.url_redireccion.trim()) { toast$(t('admin.notifications.required_title_url'), 'error'); return; }
    if (modal?.tipo === 'nuevo-anuncio' && !formAN.descripcion.trim() && !fotoFile) { toast$(t('admin.notifications.required_description_or_image'), 'error'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('titulo', formAN.titulo);
      fd.append('descripcion', formAN.descripcion ?? '');
      fd.append('url_redireccion', formAN.url_redireccion);
      if (fotoFile) fd.append('foto', fotoFile);
      else if (fotoEliminada) fd.append('eliminar_foto', '1');
      if (modal?.tipo === 'nuevo-anuncio')  { await crearAnuncio(fd); toast$(t('admin.notifications.ad_created'), 'success'); }
      if (modal?.tipo === 'editar-anuncio') { await modificarAnuncio(modal.item.id_anuncio, fd); toast$(t('admin.notifications.ad_updated'), 'success'); }
      loadAnuncios();
    } catch { toast$(t('admin.notifications.error_save'), 'error'); } finally { setSaving(false); closeM(); resetAN(); }
  };

  const doEliminarAN = async () => {
    if (!modal || modal.tipo !== 'eliminar-anuncio') return;
    setSaving(true); try { await eliminarAnuncio(modal.item.id_anuncio); toast$(t('admin.notifications.ad_deleted'), 'success'); loadAnuncios(); } catch { toast$(t('admin.notifications.error_delete'), 'error'); } finally { setSaving(false); closeM(); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* TOPBAR */}
      <header className="flex items-center justify-between bg-app-header px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm font-bold">TG</div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">{t('admin.header.title')}</h1>
            <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded">{t('admin.header.admin_label')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />

          <button onClick={logout} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
            {t('layout.auth.logout')}
          </button>
        </div>
      </header>

      {/* SUBNAV */}
      <nav className="bg-app-topbar px-6 py-2 text-white text-sm">
        <span className="text-white/50">Admin</span><span className="text-white/40 mx-2">›</span>
        <span className="text-white/90">{obtenerTabLabel(tab)}</span>
      </nav>

      <div className="flex flex-1">

        {/* SIDEBAR — solo texto, sin emojis */}
        <aside className="hidden lg:flex flex-col w-24 bg-app-sidebar text-white py-4 gap-1 items-center border-r border-app-border shrink-0">
          {TABS.map((key) => (
            <button key={key} onClick={() => setTab(key)} title={obtenerTabLabel(key)}
              className={`w-20 px-2 py-3 rounded-xl text-center text-xs font-medium transition leading-tight
                ${tab === key ? 'bg-white/25 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              {obtenerTabLabel(key)}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-auto space-y-5">

          {/* ══ USUARIOS ══ */}
          {tab === 'usuarios' && <>
            <div><h2 className="text-2xl font-bold text-gray-800">{t('admin.users.title')}</h2><p className="text-sm text-gray-500 mt-1">{t('admin.users.subtitle')}</p></div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[['admin.users.cards.total', totU, 'text-gray-800'], ['admin.users.cards.active', totA, 'text-green-700'], ['admin.users.cards.suspended', totS, 'text-red-600'], ['admin.users.cards.registered', totU, 'text-gray-800']].map(([key, v, c]) => (
                <div key={key as string} className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t(key as string)}</p>
                  <p className={`text-3xl font-bold ${c as string}`}>{v as number}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-52 rounded-2xl border border-app-border bg-white px-4 py-2 shadow-sm">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
                <input type="text" placeholder={t('admin.users.search_placeholder')} className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" onChange={e => onSearch(e.target.value)} />
              </div>
              <select className="rounded-2xl border border-app-border bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none" value={filtU.estado ?? 'todos'} onChange={e => setFiltU(p => ({ ...p, estado: e.target.value as FiltrosUsuarios['estado'] }))}>
                <option value="todos">{t('admin.users.state.all')}</option><option value="activo">{t('admin.users.state.active')}</option><option value="suspendido">{t('admin.users.state.suspended')}</option>
              </select>
            </div>

            <div className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden">
              {loadU ? <Skeleton n={5} /> : usuarios.length === 0 ? <div className="py-12 text-center text-sm text-gray-400">{t('admin.users.no_results')}</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                      <tr>{[
                        t('admin.users.table.user'),
                        t('admin.users.table.role'),
                        t('admin.users.table.status'),
                        t('admin.users.table.registered'),
                        t('admin.users.table.last_access'),
                        t('admin.users.table.actions'),
                      ].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id_usuario} className={`border-b border-gray-50 hover:bg-gray-50 transition ${u.estado === 'suspendido' ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${u.estado === 'suspendido' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{iniciales(u.nombre)}</div>
                              <div><p className="font-medium text-gray-800">{u.nombre}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge cls={u.rol === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}>{obtenerRolLabel(u.rol)}</Badge></td>
                          <td className="px-4 py-3"><Badge cls={u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{obtenerEstadoLabel(u.estado)}</Badge></td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{u.fecha_registro}</td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{u.fecha_ult_acceso}</td>
                          <td className="px-4 py-3">
                            {u.rol !== 'admin' && (u.estado === 'activo'
                              ? <button onClick={() => setModal({ tipo: 'suspender', usuario: u })} className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">{t('admin.users.suspend')}</button>
                              : <button onClick={() => setModal({ tipo: 'reactivar', usuario: u })} className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 transition">{t('admin.users.reactivate')}</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Paginacion pagina={pagU} lastPage={lastU} total={totU} label={t('admin.pagination.users')} onPrev={() => loadUsuarios(pagU - 1)} onNext={() => loadUsuarios(pagU + 1)} />
            </div>
          </>}

          {/* ══ BITÁCORA ══ */}
          {tab === 'bitacora' && <>
            <div><h2 className="text-2xl font-bold text-gray-800">{t('admin.bitacora.title')}</h2><p className="text-sm text-gray-500 mt-1">{t('admin.bitacora.subtitle')}</p></div>

            <div className="flex gap-3 flex-wrap items-end">
              {([['admin.bitacora.since', errDesde, onFechaDesde], ['admin.bitacora.until', errHasta, onFechaHasta]] as [string, string, (v: string) => void][]).map(([key, err, fn]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">{t(key)}</label>
                  <input type="date" min={FECHA_MIN} max={FECHA_MAX} defaultValue="" className={`rounded-xl border px-3 py-2 text-sm outline-none bg-white text-gray-800 ${err ? 'border-red-400' : 'border-app-border'}`} onChange={e => fn(e.target.value)} />
                  {err && <span className="text-xs text-red-500">{err}</span>}
                </div>
              ))}
              <select className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm outline-none text-gray-700" value={filtB.tipo ?? 'todos'} onChange={e => setFiltB(p => ({ ...p, tipo: e.target.value as TipoBitacora }))}>
                {(['todos', 'suspender', 'reactivar', 'modificaciones', 'creacion', 'login', 'logout'] as Array<TipoBitacora | 'todos'>).map((tipo) => (
                  <option key={tipo} value={tipo}>{obtenerFiltroBitacora(tipo)}</option>
                ))}
              </select>
              <button className="rounded-xl border border-app-border bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition" onClick={() => loadBitacora(1)}>{t('admin.bitacora.apply')}</button>
            </div>

            <div className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden">
              {loadB ? <Skeleton n={4} /> : bitacora.length === 0 ? <div className="py-12 text-center text-sm text-gray-400">{t('admin.bitacora.no_results')}</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                      <tr>{[
                        t('admin.bitacora.table.user'),
                        t('admin.bitacora.table.action_type'),
                        t('admin.bitacora.table.current_status'),
                        t('admin.bitacora.table.date_time'),
                        t('admin.bitacora.table.details'),
                      ].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {bitacora.map(b => (
                        <tr key={b.id_registro} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${b.estado_actual === 'suspendido' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{iniciales(b.nombre)}</div>
                              <div><p className="font-medium text-gray-800">{b.nombre}</p><p className="text-xs text-gray-400">{b.email}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge cls={colorTipo(b.tipo_accion)}>{etiquetaTipo(b.tipo_accion)}</Badge></td>
                          <td className="px-4 py-3"><Badge cls={b.estado_actual === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{b.estado_actual === 'activo' ? t('admin.bitacora.status.active') : t('admin.bitacora.status.suspended')}</Badge></td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{b.fecha_accion}</td>
                          <td className="px-4 py-3"><button onClick={() => setModalCtx(b)} className="text-xs text-blue-600 hover:underline font-medium">{t('admin.bitacora.view_context')}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Paginacion pagina={pagB} lastPage={lastB} total={totB} label={t('admin.pagination.records')} onPrev={() => loadBitacora(pagB - 1)} onNext={() => loadBitacora(pagB + 1)} />
            </div>
          </>}

          {/* ══ TECNOLOGÍAS ══ */}
          {tab === 'tecnologias' && <>
            <div className="flex items-start justify-between">
              <div><h2 className="text-2xl font-bold text-gray-800">{t('admin.technologies.title')}</h2><p className="text-sm text-gray-500 mt-1">{t('admin.technologies.subtitle')}</p></div>
              <button onClick={() => { setFormTec({ nombre: '', categoria: '' }); setModal({ tipo: 'nueva-tecnologia' }); }} className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition">{t('admin.technologies.add_button')}</button>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {loadT ? <Skeleton n={4} /> : tecns.length === 0 ? <div className="py-12 text-center text-sm text-gray-500">{t('admin.technologies.no_results')}</div> : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>{[t('admin.technologies.table.name'),t('admin.technologies.table.category'),t('admin.technologies.table.actions')].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {tecns.map((tecnologia) => (
                      <tr key={tecnologia.id_tecnologia} className="border-b border-gray-100 hover:bg-blue-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{tecnologia.nombre}</td>
                        <td className="px-4 py-3"><span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">{tecnologia.categoria}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setFormTec({ nombre: tecnologia.nombre, categoria: tecnologia.categoria }); setModal({ tipo: 'editar-tecnologia', item: tecnologia }); }} className="rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-1 text-xs hover:bg-gray-100 transition font-medium">{t('admin.common.edit')}</button>
                            <button onClick={() => setModal({ tipo: 'eliminar-tecnologia', item: tecnologia })} className="rounded-full border border-red-200 bg-white text-red-600 px-3 py-1 text-xs hover:bg-red-50 transition font-medium">{t('admin.common.delete')}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>}

          {/* ══ GRADOS ══ */}
          {tab === 'grados' && <>
            <div className="flex items-start justify-between">
              <div><h2 className="text-2xl font-bold text-gray-800">{t('admin.grades.title')}</h2><p className="text-sm text-gray-500 mt-1">{t('admin.grades.subtitle')}</p></div>
              <button onClick={() => { setFormGrado({ nombre_grado: '' }); setModal({ tipo: 'nuevo-grado' }); }} className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition">{t('admin.grades.add_button')}</button>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {loadG ? <Skeleton n={4} /> : grados.length === 0 ? <div className="py-12 text-center text-sm text-gray-500">{t('admin.grades.no_results')}</div> : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>{[t('admin.grades.table.name'), t('admin.grades.table.actions')].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {grados.map(g => (
                      <tr key={g.id_grado} className="border-b border-gray-100 hover:bg-blue-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{g.nombre_grado}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setFormGrado({ nombre_grado: g.nombre_grado }); setModal({ tipo: 'editar-grado', item: g }); }} className="rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-1 text-xs hover:bg-gray-100 transition font-medium">{t('admin.common.edit')}</button>
                            <button onClick={() => setModal({ tipo: 'eliminar-grado', item: g })} className="rounded-full border border-red-200 bg-white text-red-600 px-3 py-1 text-xs hover:bg-red-50 transition font-medium">{t('admin.common.delete')}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>}

          {/* ══ ANUNCIOS ══ */}
          {tab === 'anuncios' && <>
            <div className="flex items-start justify-between">
              <div><h2 className="text-2xl font-bold text-gray-800">{t('admin.ads.title')}</h2><p className="text-sm text-gray-500 mt-1">{t('admin.ads.subtitle')}</p></div>
              <button onClick={() => { resetAN(); setModal({ tipo: 'nuevo-anuncio' }); }} className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition">{t('admin.ads.add_button')}</button>
            </div>
            {loadAN ? <Skeleton n={3} /> : anuncios.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm py-12 text-center text-sm text-gray-500">{t('admin.ads.no_results')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {anuncios.map(a => (
                  <article key={a.id_anuncio} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                    {a.foto_url && <div className="h-36 overflow-hidden"><img src={a.foto_url} alt={a.titulo} className="w-full h-full object-cover" /></div>}
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{a.titulo}</h3>
                      {a.descripcion && <p className="text-xs text-gray-600 line-clamp-2">{a.descripcion}</p>}
                      <a href={a.url_redireccion} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate">{a.url_redireccion}</a>
                      <p className="text-xs text-gray-400">{a.creado_en}</p>
                    </div>
                    <div className="flex gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <button onClick={() => { setFormAN({ titulo: a.titulo, descripcion: a.descripcion ?? '', url_redireccion: a.url_redireccion }); setPreview(a.foto_url); setFotoFile(null); setFotoEliminada(false); setModal({ tipo: 'editar-anuncio', item: a }); }} className="flex-1 rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition">{t('admin.common.edit')}</button>
                      <button onClick={() => setModal({ tipo: 'eliminar-anuncio', item: a })} className="flex-1 rounded-full border border-red-200 bg-white text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-50 transition">{t('admin.common.delete')}</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>}

          {/* ══ BACKUP ══ */}
          {tab === 'backup' && <>
            <div><h2 className="text-2xl font-bold text-gray-800">{t('admin.backup.title')}</h2><p className="text-sm text-gray-500 mt-1">{t('admin.backup.subtitle')}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-app-border bg-white shadow-sm p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">⬇️</div>
                <div><h3 className="font-semibold text-gray-800">{t('admin.backup.export.title')}</h3><p className="text-sm text-gray-500 mt-1">{t('admin.backup.export.description')}</p></div>
                <button onClick={doDescargar} disabled={descargando} className="rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 w-fit">{descargando ? t('admin.backup.export.generating') : t('admin.backup.export.button')}</button>
              </div>
              <div className="rounded-2xl border border-app-border bg-white shadow-sm p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">⬆️</div>
                <div><h3 className="font-semibold text-gray-800">{t('admin.backup.import.title')}</h3><p className="text-sm text-gray-500 mt-1">{t('admin.backup.import.description')}</p></div>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-center">
                  <span className="text-2xl">📁</span><span className="text-sm text-gray-600">{t('admin.backup.import.select_file')}</span><span className="text-xs text-gray-400">{t('admin.backup.import.file_hint')}</span>
                </div>
                <input ref={fileRef} type="file" accept=".json,.zip" className="hidden" onChange={onArchivo} />
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700"><span className="shrink-0">⚠️</span><span>{t('admin.backup.import.warning')}</span></div>
              </div>
            </div>
          </>}

        </main>
      </div>

      {/* ══════ MODALS ══════ */}

      {(modal?.tipo === 'suspender' || modal?.tipo === 'reactivar') && (
        <Modal onClose={closeM}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-4 ${modal.tipo === 'suspender' ? 'bg-red-100' : 'bg-green-100'}`}>{modal.tipo === 'suspender' ? '🚫' : '✅'}</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">{modal.tipo === 'suspender' ? t('admin.modals.suspend.title') : t('admin.modals.reactivate.title')}</h3>
          <p className="text-sm text-gray-500 mb-4">{modal.tipo === 'suspender' ? t('admin.modals.suspend.description') : t('admin.modals.reactivate.description')}</p>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${modal.tipo === 'suspender' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{iniciales(modal.usuario.nombre)}</div>
            <div><p className="text-sm font-medium text-gray-800">{modal.usuario.nombre}</p><p className="text-xs text-gray-400">{modal.usuario.email}</p></div>
          </div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>{t('admin.common.cancel')}</BtnRound>
            <BtnRound variant={modal.tipo === 'suspender' ? 'red' : 'green'} className="flex-1" onClick={modal.tipo === 'suspender' ? doSuspender : doReactivar} disabled={saving}>{saving ? t('admin.common.processing') : modal.tipo === 'suspender' ? t('admin.users.suspend') : t('admin.users.reactivate')}</BtnRound>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'importar' && (
        <Modal onClose={() => !importando && closeM()}>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl mb-4">⚠️</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">{t('admin.modals.import.title')}</h3>
          <p className="text-sm text-gray-600 mb-3">{t('admin.modals.import.description', { file: modal.archivo.name })}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-5">{t('admin.modals.import.alert')}</div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={importando}>{t('admin.common.cancel')}</BtnRound>
            <BtnRound variant="red" className="flex-1" onClick={doImportar} disabled={importando}>{importando ? t('admin.modals.import.loading') : t('admin.modals.import.confirm')}</BtnRound>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nueva-tecnologia' || modal?.tipo === 'editar-tecnologia') && (
        <Modal onClose={closeM}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">{modal.tipo === 'nueva-tecnologia' ? t('admin.modals.technology.new') : t('admin.modals.technology.edit')}</h3>
          <div className="space-y-3 mb-5">
            <FormInput label={t('admin.modals.technology.fields.name.label')} type="text" placeholder={t('admin.modals.technology.fields.name.placeholder')} value={formTec.nombre} onChange={e => setFormTec(p => ({ ...p, nombre: e.target.value }))} />
            <FormInput label={t('admin.modals.technology.fields.category.label')} type="text" placeholder={t('admin.modals.technology.fields.category.placeholder')} value={formTec.categoria} onChange={e => setFormTec(p => ({ ...p, categoria: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>{t('admin.common.cancel')}</BtnRound>
            <BtnRound variant="blue" className="flex-1" onClick={doGuardarTec} disabled={saving}>{saving ? t('admin.common.saving') : t('admin.common.save')}</BtnRound>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-tecnologia' && (
        <Modal onClose={closeM}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">{t('admin.modals.technology.delete.title')}</h3>
          <p className="text-sm text-gray-600 mb-5">{t('admin.modals.technology.delete.description', { name: modal.item.nombre })}</p>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>{t('admin.common.cancel')}</BtnRound>
            <BtnRound variant="red" className="flex-1" onClick={doEliminarTec} disabled={saving}>{saving ? t('admin.common.deleting') : t('admin.common.delete')}</BtnRound>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nuevo-grado' || modal?.tipo === 'editar-grado') && (
        <Modal onClose={closeM}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">{modal.tipo === 'nuevo-grado' ? t('admin.modals.degree.new') : t('admin.modals.degree.edit')}</h3>
          <div className="mb-5">
            <FormInput label={t('admin.modals.degree.fields.name.label')} type="text" placeholder={t('admin.modals.degree.fields.name.placeholder')} value={formGrado.nombre_grado} onChange={e => setFormGrado({ nombre_grado: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>{t('admin.common.cancel')}</BtnRound>
            <BtnRound variant="blue" className="flex-1" onClick={doGuardarGrado} disabled={saving}>{saving ? t('admin.common.saving') : t('admin.common.save')}</BtnRound>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-grado' && (
        <Modal onClose={closeM}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">{t('admin.modals.degree.delete.title')}</h3>
          <p className="text-sm text-gray-600 mb-5">{t('admin.modals.degree.delete.description', { name: modal.item.nombre_grado })}</p>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>{t('admin.common.cancel')}</BtnRound>
            <BtnRound variant="red" className="flex-1" onClick={doEliminarGrado} disabled={saving}>{saving ? t('admin.common.deleting') : t('admin.common.delete')}</BtnRound>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nuevo-anuncio' || modal?.tipo === 'editar-anuncio') && (
        <Modal onClose={() => { closeM(); resetAN(); }}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">{modal.tipo === 'nuevo-anuncio' ? t('admin.modals.ad.new') : t('admin.modals.ad.edit')}</h3>
          <div className="space-y-3 mb-5">
            <FormInput label={t('admin.modals.ad.fields.title.label')} type="text" placeholder={t('admin.modals.ad.fields.title.placeholder')} value={formAN.titulo} onChange={e => setFormAN(p => ({ ...p, titulo: e.target.value }))} />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('admin.modals.ad.fields.description.label')}</label>
              <textarea className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 resize-none" rows={3} placeholder={t('admin.modals.ad.fields.description.placeholder')} value={formAN.descripcion} onChange={e => setFormAN(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <FormInput label={t('admin.modals.ad.fields.redirectUrl.label')} type="text" placeholder={t('admin.modals.ad.fields.redirectUrl.placeholder')} value={formAN.url_redireccion} onChange={e => setFormAN(p => ({ ...p, url_redireccion: e.target.value }))} />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('admin.modals.ad.fields.image.label')}</label>
              {preview && (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 mb-2">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center" onClick={() => { setFotoFile(null); setPreview(null); setFotoEliminada(true); }}>✕</button>
                </div>
              )}
              <div onClick={() => fotoRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-center">
                <span className="text-xl">🖼️</span>
                <span className="text-xs text-gray-600">{preview ? t('admin.modals.ad.fields.image.change') : t('admin.modals.ad.fields.image.select')}</span>
                <span className="text-xs text-gray-400">{t('admin.modals.ad.fields.image.hint')}</span>
              </div>
              <input ref={fotoRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={onFoto} />
            </div>
          </div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={() => { closeM(); resetAN(); }} disabled={saving}>{t('admin.common.cancel')}</BtnRound>
            <BtnRound variant="blue" className="flex-1" onClick={doGuardarAN} disabled={saving}>{saving ? t('admin.common.saving') : t('admin.common.save')}</BtnRound>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-anuncio' && (
        <Modal onClose={closeM}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">{t('admin.modals.ad.delete.title')}</h3>
          <p className="text-sm text-gray-600 mb-5">{t('admin.modals.ad.delete.description', { title: modal.item.titulo })}</p>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>{t('admin.common.cancel')}</BtnRound>
            <BtnRound variant="red" className="flex-1" onClick={doEliminarAN} disabled={saving}>{saving ? t('admin.common.deleting') : t('admin.common.delete')}</BtnRound>
          </div>
        </Modal>
      )}

      {/* Modal contexto bitácora */}
      {modalCtx && (
        <Modal onClose={() => setModalCtx(null)} wide>
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${modalCtx.estado_actual === 'suspendido' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{iniciales(modalCtx.nombre)}</div>
            <div><p className="font-semibold text-gray-800">{modalCtx.nombre}</p><p className="text-xs text-gray-400">{modalCtx.email}</p></div>
            <Badge cls={`ml-auto ${modalCtx.rol === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{modalCtx.rol === 'admin' ? t('admin.common.roles.admin') : t('admin.common.roles.user')}</Badge>
          </div>

          {([
            [t('admin.log.type'), <Badge cls={colorTipo(modalCtx.tipo_accion)}>{etiquetaTipo(modalCtx.tipo_accion)}</Badge>],
            [t('admin.log.dateTime'),   <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-fit"><span>🕐</span><span className="text-sm text-gray-700 font-medium">{modalCtx.fecha_accion}</span></div>],
            [t('admin.log.status'),  <Badge cls={modalCtx.estado_actual === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{modalCtx.estado_actual === 'activo' ? t('admin.common.status.active') : t('admin.common.status.suspended')}</Badge>],
          ] as [string, React.ReactNode][]).map(([lbl, val]) => (
            <div key={lbl} className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{lbl}</p>
              {val}
            </div>
          ))}

          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('admin.bitacora.detail.heading')}</p>
            {modalCtx.contexto && Object.keys(modalCtx.contexto).length > 0 ? (
              <div className="space-y-2">
                {([
                  ['🌐', t('admin.bitacora.detail.ip'),     modalCtx.contexto.ip,                         'font-mono bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-gray-700'],
                  ['💻', t('admin.bitacora.detail.device'),      modalCtx.contexto.dispositivo,                'break-all text-gray-700'],
                  ['🗂️', t('admin.bitacora.detail.table'),  modalCtx.contexto.tabla_principal_afectada,   'font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg'],
                  ['⚡', t('admin.bitacora.detail.action'),           modalCtx.contexto.accion,                     'text-gray-700'],
                  ['📝', t('admin.bitacora.detail.reason'),           modalCtx.contexto.motivo,                     'text-amber-700'],
                  ['👤', t('admin.bitacora.detail.executed_by'),    modalCtx.contexto.ejecutado_por,              'font-mono break-all text-gray-700'],
                  ['🕐', t('admin.bitacora.detail.previous_access'),  modalCtx.contexto.fecha_ult_acceso_anterior,  'text-gray-700'],
                  ['📁', t('admin.bitacora.detail.file'),          modalCtx.contexto.archivo,                    'text-gray-700'],
                ] as [string, string, string, string][]).filter(([,, v]) => v).map(([icon, label, val, cls]) => (
                  <div key={label} className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm shrink-0">{icon}</span>
                    <span className="text-xs text-gray-500 w-32 shrink-0">{label}</span>
                    <span className={`text-xs ${cls}`}>{val}</span>
                  </div>
                ))}
                <details className="mt-3 group">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none flex items-center gap-1 list-none">
                    <span className="group-open:rotate-90 transition-transform inline-block">▶</span> {t('admin.bitacora.detail.full_json')}
                  </summary>
                  <pre className="mt-2 bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-auto max-h-48 font-mono whitespace-pre-wrap break-all">{JSON.stringify(modalCtx.contexto, null, 2)}</pre>
                </details>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400"><span>ℹ️</span><span>{t('admin.bitacora.detail.no_additional_info')}</span></div>
            )}
          </div>

          <button onClick={() => setModalCtx(null)} className="w-full border border-gray-200 rounded-full py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">{t('admin.bitacora.detail.close')}</button>
        </Modal>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>{toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;