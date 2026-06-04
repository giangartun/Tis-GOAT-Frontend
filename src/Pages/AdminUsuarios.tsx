import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Paginacion: React.FC<{ pagina: number; lastPage: number; total: number; label: string; onPrev: () => void; onNext: () => void }> = ({ pagina, lastPage, total, label, onPrev, onNext }) =>
  lastPage > 1 ? (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <span className="text-xs text-gray-400">Página {pagina} de {lastPage} — {total} {label}</span>
      <div className="flex gap-2">
        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs disabled:opacity-40" disabled={pagina === 1} onClick={onPrev}>← Anterior</button>
        <button className="rounded-full border border-gray-200 px-3 py-1 text-xs disabled:opacity-40" disabled={pagina === lastPage} onClick={onNext}>Siguiente →</button>
      </div>
    </div>
  ) : null;

// ── Helpers ───────────────────────────────────────────────────────────────────

const iniciales = (n: string) => { const p = n.trim().split(' '); return (p.length >= 2 ? p[0][0] + p[1][0] : p[0].slice(0, 2)).toUpperCase(); };

const TIPO_LABEL: Record<string, string> = {
  cuenta_suspendida: 'Cuenta suspendida', cuenta_reactivada: 'Cuenta reactivada',
  cuenta_creada: 'Cuenta creada', inicio_sesion: 'Inicio de sesión', cierre_sesion: 'Cierre de sesión',
  modificacion_perfil: 'Mod. perfil', modificacion_foto: 'Mod. foto', modificacion_tecnologias: 'Mod. tecnologías',
  modificacion_habilidades: 'Mod. habilidades', modificacion_experiencia_laboral: 'Mod. exp. laboral',
  modificacion_experiencia_academica: 'Mod. exp. académica', modificacion_redes_sociales: 'Mod. redes',
  modificacion_proyectos: 'Mod. proyectos', modificacion_evidencias: 'Mod. evidencias',
  modificacion_privacidad: 'Mod. privacidad', modificacion_plantilla: 'Mod. plantilla',
  importacion_backup: 'Importación de backup',
};

const etiquetaTipo = (t: string) => TIPO_LABEL[t] ?? t;

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

const TABS: { key: Tab; label: string }[] = [
  { key: 'usuarios',    label: 'Usuarios'    },
  { key: 'bitacora',   label: 'Bitácora'     },
  { key: 'tecnologias',label: 'Tecnologías'  },
  { key: 'grados',     label: 'Grados'       },
  { key: 'anuncios',   label: 'Anuncios'     },
  { key: 'backup',     label: 'Backup'       },
];

// ── Componente principal ──────────────────────────────────────────────────────

const AdminUsuarios: React.FC = () => {
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

  const logout = async () => {
    try {
      const t = localStorage.getItem('token');
      if (t) await fetch(import.meta.env.VITE_API_URL + '/api/usuario/logout', { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', Accept: 'application/json' } });
    } catch { /* silent */ } finally { localStorage.clear(); navigate('/login', { replace: true }); }
  };

  const loadUsuarios = useCallback(async (p = 1) => {
    setLoadU(true);
    try { const r = await getUsuarios({ ...filtU, page: p }); setUsuarios(r.data_usuarios); setTotU(r.total_usuarios); setTotA(r.total_activos); setTotS(r.total_suspendidos); setPagU(r.current_page); setLastU(r.last_page); }
    catch { toast$('Error al cargar usuarios', 'error'); } finally { setLoadU(false); }
  }, [filtU]);

  const loadBitacora = useCallback(async (p = 1) => {
    setLoadB(true);
    try { const r = await getBitacora({ ...filtB, page: p }); setBitacora(r.data); setTotB(r.total); setPagB(r.current_page); setLastB(r.last_page); }
    catch { toast$('Error al cargar bitácora', 'error'); } finally { setLoadB(false); }
  }, [filtB]);

  const loadTecns    = async () => { setLoadT(true); try { setTecns((await getTecnologias()).tecnologias); } catch { toast$('Error tecnologías', 'error'); } finally { setLoadT(false); } };
  const loadGrados   = async () => { setLoadG(true); try { setGrados((await getGrados()).grados); } catch { toast$('Error grados', 'error'); } finally { setLoadG(false); } };
  const loadAnuncios = async () => { setLoadAN(true); try { setAnuncios((await getAnuncios()).anuncios); } catch { toast$('Error anuncios', 'error'); } finally { setLoadAN(false); } };

  useEffect(() => { loadUsuarios(1); }, [filtU]);
  useEffect(() => { if (tab === 'bitacora')    loadBitacora(1);  }, [filtB, tab]);
  useEffect(() => { if (tab === 'tecnologias') loadTecns();      }, [tab]);
  useEffect(() => { if (tab === 'grados')      loadGrados();     }, [tab]);
  useEffect(() => { if (tab === 'anuncios')    loadAnuncios();   }, [tab]);

  const onSearch     = (v: string) => { if (searchT.current) clearTimeout(searchT.current); searchT.current = setTimeout(() => setFiltU(p => ({ ...p, search: v || undefined })), 400); };
  const validFecha   = (v: string) => { if (!v) return ''; if (isNaN(new Date(v).getTime())) return 'Fecha inválida'; if (v < FECHA_MIN) return `Mínimo ${FECHA_MIN}`; if (v > FECHA_MAX) return `Máximo ${FECHA_MAX}`; return ''; };
  const onFechaDesde = (v: string) => { const e = validFecha(v); setErrDesde(e); if (!e) setFiltB(p => ({ ...p, fecha_desde: v || undefined })); };
  const onFechaHasta = (v: string) => { const e = validFecha(v); setErrHasta(e); if (!e) setFiltB(p => ({ ...p, fecha_hasta: v || undefined })); };

  const doSuspender = async () => {
    if (!modal || modal.tipo !== 'suspender') return;
    setSaving(true); try { await suspenderUsuario(modal.usuario.id_usuario); toast$('Cuenta suspendida', 'success'); loadUsuarios(pagU); } catch { toast$('Error al suspender', 'error'); } finally { setSaving(false); closeM(); }
  };

  const doReactivar = async () => {
    if (!modal || modal.tipo !== 'reactivar') return;
    setSaving(true); try { await reactivarUsuario(modal.usuario.id_usuario); toast$('Cuenta reactivada', 'success'); loadUsuarios(pagU); } catch { toast$('Error al reactivar', 'error'); } finally { setSaving(false); closeM(); }
  };

  const doDescargar = async () => { setDescargando(true); try { await descargarBackup(); toast$('Backup descargado', 'success'); } catch { toast$('Error al descargar', 'error'); } finally { setDescargando(false); } };

  const onArchivo = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setModal({ tipo: 'importar', archivo: f }); e.target.value = ''; };

  const doImportar = async () => {
    if (!modal || modal.tipo !== 'importar') return;
    setImportando(true);
    try { await importarBackup(modal.archivo); toast$('Backup importado. Cerrando sesión...', 'success'); setTimeout(() => { localStorage.clear(); navigate('/login', { replace: true, state: { message: 'Backup importado. Inicia sesión nuevamente.' } }); }, 2000); }
    catch { toast$('Error al importar', 'error'); setImportando(false); closeM(); }
  };

  const doGuardarTec = async () => {
    if (!formTec.nombre.trim() || !formTec.categoria.trim()) { toast$('Nombre y categoría son obligatorios', 'error'); return; }
    setSaving(true);
    try {
      if (modal?.tipo === 'nueva-tecnologia')  { await crearTecnologia(formTec); toast$('Tecnología creada', 'success'); }
      if (modal?.tipo === 'editar-tecnologia') { await modificarTecnologia(modal.item.id_tecnologia, formTec); toast$('Tecnología actualizada', 'success'); }
      loadTecns();
    } catch { toast$('Error al guardar', 'error'); } finally { setSaving(false); closeM(); }
  };

  const doEliminarTec = async () => {
    if (!modal || modal.tipo !== 'eliminar-tecnologia') return;
    setSaving(true); try { await eliminarTecnologia(modal.item.id_tecnologia); toast$('Tecnología eliminada', 'success'); loadTecns(); } catch { toast$('Error al eliminar', 'error'); } finally { setSaving(false); closeM(); }
  };

  const doGuardarGrado = async () => {
    if (!formGrado.nombre_grado.trim()) { toast$('El nombre es obligatorio', 'error'); return; }
    setSaving(true);
    try {
      if (modal?.tipo === 'nuevo-grado')  { await crearGrado(formGrado); toast$('Grado creado', 'success'); }
      if (modal?.tipo === 'editar-grado') { await modificarGrado(modal.item.id_grado, formGrado); toast$('Grado actualizado', 'success'); }
      loadGrados();
    } catch { toast$('Error al guardar', 'error'); } finally { setSaving(false); closeM(); }
  };

  const doEliminarGrado = async () => {
    if (!modal || modal.tipo !== 'eliminar-grado') return;
    setSaving(true); try { await eliminarGrado(modal.item.id_grado); toast$('Grado eliminado', 'success'); loadGrados(); } catch { toast$('Error al eliminar', 'error'); } finally { setSaving(false); closeM(); }
  };

  const resetAN = () => { setFormAN({ titulo: '', descripcion: '', url_redireccion: '' }); setFotoFile(null); setPreview(null); setFotoEliminada(false); };
  const onFoto  = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setFotoFile(f); setPreview(URL.createObjectURL(f)); };

  const doGuardarAN = async () => {
    if (!formAN.titulo.trim() || !formAN.url_redireccion.trim()) { toast$('Título y URL son obligatorios', 'error'); return; }
    if (modal?.tipo === 'nuevo-anuncio' && !formAN.descripcion.trim() && !fotoFile) { toast$('Incluye al menos descripción o imagen', 'error'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('titulo', formAN.titulo);
      fd.append('descripcion', formAN.descripcion ?? '');
      fd.append('url_redireccion', formAN.url_redireccion);
      if (fotoFile) fd.append('foto', fotoFile);
      else if (fotoEliminada) fd.append('eliminar_foto', '1');
      if (modal?.tipo === 'nuevo-anuncio')  { await crearAnuncio(fd); toast$('Anuncio creado', 'success'); }
      if (modal?.tipo === 'editar-anuncio') { await modificarAnuncio(modal.item.id_anuncio, fd); toast$('Anuncio actualizado', 'success'); }
      loadAnuncios();
    } catch { toast$('Error al guardar', 'error'); } finally { setSaving(false); closeM(); resetAN(); }
  };

  const doEliminarAN = async () => {
    if (!modal || modal.tipo !== 'eliminar-anuncio') return;
    setSaving(true); try { await eliminarAnuncio(modal.item.id_anuncio); toast$('Anuncio eliminado', 'success'); loadAnuncios(); } catch { toast$('Error al eliminar', 'error'); } finally { setSaving(false); closeM(); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* TOPBAR */}
      <header className="flex items-center justify-between bg-app-header px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm font-bold">TG</div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Sistema de Portafolios Digitales</h1>
            <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded">ADMINISTRADOR</span>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
          Cerrar sesión
        </button>
      </header>

      {/* SUBNAV */}
      <nav className="bg-app-topbar px-6 py-2 text-white text-sm">
        <span className="text-white/50">Admin</span><span className="text-white/40 mx-2">›</span>
        <span className="text-white/90">{TABS.find(t => t.key === tab)?.label}</span>
      </nav>

      <div className="flex flex-1">

        {/* SIDEBAR — solo texto, sin emojis */}
        <aside className="hidden lg:flex flex-col w-24 bg-app-sidebar text-white py-4 gap-1 items-center border-r border-app-border shrink-0">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} title={t.label}
              className={`w-20 px-2 py-3 rounded-xl text-center text-xs font-medium transition leading-tight
                ${tab === t.key ? 'bg-white/25 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-auto space-y-5">

          {/* ══ USUARIOS ══ */}
          {tab === 'usuarios' && <>
            <div><h2 className="text-2xl font-bold text-gray-800">Gestión de usuarios</h2><p className="text-sm text-gray-500 mt-1">Administra todas las cuentas registradas</p></div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[['Total usuarios', totU, 'text-gray-800'], ['Cuentas activas', totA, 'text-green-700'], ['Suspendidas', totS, 'text-red-600'], ['Registradas', totU, 'text-gray-800']].map(([l, v, c]) => (
                <div key={l as string} className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{l as string}</p>
                  <p className={`text-3xl font-bold ${c as string}`}>{v as number}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-52 rounded-2xl border border-app-border bg-white px-4 py-2 shadow-sm">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
                <input type="text" placeholder="Buscar por nombre o correo..." className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" onChange={e => onSearch(e.target.value)} />
              </div>
              <select className="rounded-2xl border border-app-border bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none" value={filtU.estado ?? 'todos'} onChange={e => setFiltU(p => ({ ...p, estado: e.target.value as FiltrosUsuarios['estado'] }))}>
                <option value="todos">Todos los estados</option><option value="activo">Activos</option><option value="suspendido">Suspendidos</option>
              </select>
            </div>

            <div className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden">
              {loadU ? <Skeleton n={5} /> : usuarios.length === 0 ? <div className="py-12 text-center text-sm text-gray-400">No se encontraron usuarios</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                      <tr>{['Usuario','Rol','Estado','Registro','Último acceso','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr>
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
                          <td className="px-4 py-3"><Badge cls={u.rol === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}>{u.rol === 'admin' ? 'Admin' : 'Usuario'}</Badge></td>
                          <td className="px-4 py-3"><Badge cls={u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{u.estado === 'activo' ? 'Activa' : 'Suspendida'}</Badge></td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{u.fecha_registro}</td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{u.fecha_ult_acceso}</td>
                          <td className="px-4 py-3">
                            {u.rol !== 'admin' && (u.estado === 'activo'
                              ? <button onClick={() => setModal({ tipo: 'suspender', usuario: u })} className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">Suspender</button>
                              : <button onClick={() => setModal({ tipo: 'reactivar', usuario: u })} className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 transition">Reactivar</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Paginacion pagina={pagU} lastPage={lastU} total={totU} label="usuarios" onPrev={() => loadUsuarios(pagU - 1)} onNext={() => loadUsuarios(pagU + 1)} />
            </div>
          </>}

          {/* ══ BITÁCORA ══ */}
          {tab === 'bitacora' && <>
            <div><h2 className="text-2xl font-bold text-gray-800">Bitácora de acciones</h2><p className="text-sm text-gray-500 mt-1">Historial de todas las acciones registradas</p></div>

            <div className="flex gap-3 flex-wrap items-end">
              {([['Desde', errDesde, onFechaDesde], ['Hasta', errHasta, onFechaHasta]] as [string, string, (v: string) => void][]).map(([lbl, err, fn]) => (
                <div key={lbl} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">{lbl}</label>
                  <input type="date" min={FECHA_MIN} max={FECHA_MAX} defaultValue="" className={`rounded-xl border px-3 py-2 text-sm outline-none bg-white text-gray-800 ${err ? 'border-red-400' : 'border-app-border'}`} onChange={e => fn(e.target.value)} />
                  {err && <span className="text-xs text-red-500">{err}</span>}
                </div>
              ))}
              <select className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm outline-none text-gray-700" value={filtB.tipo ?? 'todos'} onChange={e => setFiltB(p => ({ ...p, tipo: e.target.value as TipoBitacora }))}>
                <option value="todos">Todas las acciones</option><option value="suspender">Suspensiones</option><option value="reactivar">Reactivaciones</option>
                <option value="modificaciones">Modificaciones</option><option value="creacion">Creaciones de cuenta</option><option value="login">Inicios de sesión</option><option value="logout">Cierres de sesión</option>
              </select>
              <button className="rounded-xl border border-app-border bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition" onClick={() => loadBitacora(1)}>Aplicar</button>
            </div>

            <div className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden">
              {loadB ? <Skeleton n={4} /> : bitacora.length === 0 ? <div className="py-12 text-center text-sm text-gray-400">No hay registros en la bitácora</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                      <tr>{['Usuario','Tipo de acción','Estado actual','Fecha y hora','Detalles'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr>
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
                          <td className="px-4 py-3"><Badge cls={b.estado_actual === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{b.estado_actual === 'activo' ? 'Activo' : 'Suspendido'}</Badge></td>
                          <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{b.fecha_accion}</td>
                          <td className="px-4 py-3"><button onClick={() => setModalCtx(b)} className="text-xs text-blue-600 hover:underline font-medium">Ver contexto</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Paginacion pagina={pagB} lastPage={lastB} total={totB} label="registros" onPrev={() => loadBitacora(pagB - 1)} onNext={() => loadBitacora(pagB + 1)} />
            </div>
          </>}

          {/* ══ TECNOLOGÍAS ══ */}
          {tab === 'tecnologias' && <>
            <div className="flex items-start justify-between">
              <div><h2 className="text-2xl font-bold text-gray-800">Tecnologías</h2><p className="text-sm text-gray-500 mt-1">Gestiona el catálogo de tecnologías disponibles</p></div>
              <button onClick={() => { setFormTec({ nombre: '', categoria: '' }); setModal({ tipo: 'nueva-tecnologia' }); }} className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition">+ Agregar tecnología</button>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {loadT ? <Skeleton n={4} /> : tecns.length === 0 ? <div className="py-12 text-center text-sm text-gray-500">No hay tecnologías</div> : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>{['Nombre','Categoría','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {tecns.map(t => (
                      <tr key={t.id_tecnologia} className="border-b border-gray-100 hover:bg-blue-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{t.nombre}</td>
                        <td className="px-4 py-3"><span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">{t.categoria}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setFormTec({ nombre: t.nombre, categoria: t.categoria }); setModal({ tipo: 'editar-tecnologia', item: t }); }} className="rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-1 text-xs hover:bg-gray-100 transition font-medium">Editar</button>
                            <button onClick={() => setModal({ tipo: 'eliminar-tecnologia', item: t })} className="rounded-full border border-red-200 bg-white text-red-600 px-3 py-1 text-xs hover:bg-red-50 transition font-medium">Eliminar</button>
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
              <div><h2 className="text-2xl font-bold text-gray-800">Grados académicos</h2><p className="text-sm text-gray-500 mt-1">Gestiona los grados académicos disponibles</p></div>
              <button onClick={() => { setFormGrado({ nombre_grado: '' }); setModal({ tipo: 'nuevo-grado' }); }} className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition">+ Agregar grado</button>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {loadG ? <Skeleton n={4} /> : grados.length === 0 ? <div className="py-12 text-center text-sm text-gray-500">No hay grados</div> : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>{['Nombre del grado','Acciones'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {grados.map(g => (
                      <tr key={g.id_grado} className="border-b border-gray-100 hover:bg-blue-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{g.nombre_grado}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setFormGrado({ nombre_grado: g.nombre_grado }); setModal({ tipo: 'editar-grado', item: g }); }} className="rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-1 text-xs hover:bg-gray-100 transition font-medium">Editar</button>
                            <button onClick={() => setModal({ tipo: 'eliminar-grado', item: g })} className="rounded-full border border-red-200 bg-white text-red-600 px-3 py-1 text-xs hover:bg-red-50 transition font-medium">Eliminar</button>
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
              <div><h2 className="text-2xl font-bold text-gray-800">Anuncios</h2><p className="text-sm text-gray-500 mt-1">Gestiona los anuncios visibles en la plataforma</p></div>
              <button onClick={() => { resetAN(); setModal({ tipo: 'nuevo-anuncio' }); }} className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition">+ Agregar anuncio</button>
            </div>
            {loadAN ? <Skeleton n={3} /> : anuncios.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm py-12 text-center text-sm text-gray-500">No hay anuncios</div>
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
                      <button onClick={() => { setFormAN({ titulo: a.titulo, descripcion: a.descripcion ?? '', url_redireccion: a.url_redireccion }); setPreview(a.foto_url); setFotoFile(null); setFotoEliminada(false); setModal({ tipo: 'editar-anuncio', item: a }); }} className="flex-1 rounded-full border border-gray-300 bg-white text-gray-700 px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition">Editar</button>
                      <button onClick={() => setModal({ tipo: 'eliminar-anuncio', item: a })} className="flex-1 rounded-full border border-red-200 bg-white text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-50 transition">Eliminar</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>}

          {/* ══ BACKUP ══ */}
          {tab === 'backup' && <>
            <div><h2 className="text-2xl font-bold text-gray-800">Gestión de backup</h2><p className="text-sm text-gray-500 mt-1">Exporta o restaura los datos de la plataforma</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-app-border bg-white shadow-sm p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">⬇️</div>
                <div><h3 className="font-semibold text-gray-800">Exportar backup</h3><p className="text-sm text-gray-500 mt-1">Descarga un archivo JSON con todos los datos actuales.</p></div>
                <button onClick={doDescargar} disabled={descargando} className="rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 w-fit">{descargando ? 'Generando...' : 'Descargar backup'}</button>
              </div>
              <div className="rounded-2xl border border-app-border bg-white shadow-sm p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">⬆️</div>
                <div><h3 className="font-semibold text-gray-800">Importar backup</h3><p className="text-sm text-gray-500 mt-1">Carga un archivo de backup para restaurar datos. Formatos: .json o .zip (máx. 10 MB).</p></div>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-center">
                  <span className="text-2xl">📁</span><span className="text-sm text-gray-600">Haz clic para seleccionar el archivo</span><span className="text-xs text-gray-400">JSON o ZIP, máximo 10 MB</span>
                </div>
                <input ref={fileRef} type="file" accept=".json,.zip" className="hidden" onChange={onArchivo} />
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700"><span className="shrink-0">⚠️</span><span>Al importar, <strong>todas las sesiones se cerrarán</strong>.</span></div>
              </div>
            </div>
          </>}

        </main>
      </div>

      {/* ══════ MODALS ══════ */}

      {(modal?.tipo === 'suspender' || modal?.tipo === 'reactivar') && (
        <Modal onClose={closeM}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-4 ${modal.tipo === 'suspender' ? 'bg-red-100' : 'bg-green-100'}`}>{modal.tipo === 'suspender' ? '🚫' : '✅'}</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Confirmar {modal.tipo === 'suspender' ? 'suspensión' : 'reactivación'}</h3>
          <p className="text-sm text-gray-500 mb-4">{modal.tipo === 'suspender' ? 'La cuenta será suspendida de inmediato.' : 'La cuenta será reactivada y el usuario podrá acceder nuevamente.'}</p>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${modal.tipo === 'suspender' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{iniciales(modal.usuario.nombre)}</div>
            <div><p className="text-sm font-medium text-gray-800">{modal.usuario.nombre}</p><p className="text-xs text-gray-400">{modal.usuario.email}</p></div>
          </div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>Cancelar</BtnRound>
            <BtnRound variant={modal.tipo === 'suspender' ? 'red' : 'green'} className="flex-1" onClick={modal.tipo === 'suspender' ? doSuspender : doReactivar} disabled={saving}>{saving ? 'Procesando...' : modal.tipo === 'suspender' ? 'Suspender' : 'Reactivar'}</BtnRound>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'importar' && (
        <Modal onClose={() => !importando && closeM()}>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl mb-4">⚠️</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Confirmar importación</h3>
          <p className="text-sm text-gray-600 mb-3">Se importará <strong className="text-gray-800">{modal.archivo.name}</strong>. Esta acción sobreescribirá todos los datos.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-5">Esta acción es <strong>irreversible</strong>.</div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={importando}>Cancelar</BtnRound>
            <BtnRound variant="red" className="flex-1" onClick={doImportar} disabled={importando}>{importando ? 'Importando...' : 'Confirmar'}</BtnRound>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nueva-tecnologia' || modal?.tipo === 'editar-tecnologia') && (
        <Modal onClose={closeM}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">{modal.tipo === 'nueva-tecnologia' ? '+ Nueva tecnología' : 'Editar tecnología'}</h3>
          <div className="space-y-3 mb-5">
            <FormInput label="Nombre *" type="text" placeholder="Ej: React" value={formTec.nombre} onChange={e => setFormTec(p => ({ ...p, nombre: e.target.value }))} />
            <FormInput label="Categoría *" type="text" placeholder="Ej: Frontend" value={formTec.categoria} onChange={e => setFormTec(p => ({ ...p, categoria: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>Cancelar</BtnRound>
            <BtnRound variant="blue" className="flex-1" onClick={doGuardarTec} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</BtnRound>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-tecnologia' && (
        <Modal onClose={closeM}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Eliminar tecnología</h3>
          <p className="text-sm text-gray-600 mb-5">¿Seguro que deseas eliminar <strong className="text-gray-800">{modal.item.nombre}</strong>?</p>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>Cancelar</BtnRound>
            <BtnRound variant="red" className="flex-1" onClick={doEliminarTec} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</BtnRound>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nuevo-grado' || modal?.tipo === 'editar-grado') && (
        <Modal onClose={closeM}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">{modal.tipo === 'nuevo-grado' ? '+ Nuevo grado' : 'Editar grado'}</h3>
          <div className="mb-5">
            <FormInput label="Nombre del grado *" type="text" placeholder="Ej: Licenciatura" value={formGrado.nombre_grado} onChange={e => setFormGrado({ nombre_grado: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>Cancelar</BtnRound>
            <BtnRound variant="blue" className="flex-1" onClick={doGuardarGrado} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</BtnRound>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-grado' && (
        <Modal onClose={closeM}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Eliminar grado</h3>
          <p className="text-sm text-gray-600 mb-5">¿Seguro que deseas eliminar <strong className="text-gray-800">{modal.item.nombre_grado}</strong>?</p>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>Cancelar</BtnRound>
            <BtnRound variant="red" className="flex-1" onClick={doEliminarGrado} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</BtnRound>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nuevo-anuncio' || modal?.tipo === 'editar-anuncio') && (
        <Modal onClose={() => { closeM(); resetAN(); }}>
          <h3 className="text-base font-semibold text-gray-900 mb-4">{modal.tipo === 'nuevo-anuncio' ? '+ Nuevo anuncio' : 'Editar anuncio'}</h3>
          <div className="space-y-3 mb-5">
            <FormInput label="Título *" type="text" placeholder="Título del anuncio" value={formAN.titulo} onChange={e => setFormAN(p => ({ ...p, titulo: e.target.value }))} />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
              <textarea className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 resize-none" rows={3} placeholder="Descripción (opcional si sube imagen)" value={formAN.descripcion} onChange={e => setFormAN(p => ({ ...p, descripcion: e.target.value }))} />
            </div>
            <FormInput label="URL de redirección *" type="text" placeholder="https://..." value={formAN.url_redireccion} onChange={e => setFormAN(p => ({ ...p, url_redireccion: e.target.value }))} />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Imagen (opcional)</label>
              {preview && (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 mb-2">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center" onClick={() => { setFotoFile(null); setPreview(null); setFotoEliminada(true); }}>✕</button>
                </div>
              )}
              <div onClick={() => fotoRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-center">
                <span className="text-xl">🖼️</span>
                <span className="text-xs text-gray-600">{preview ? 'Cambiar imagen' : 'Seleccionar imagen'}</span>
                <span className="text-xs text-gray-400">JPG, PNG, WebP — máx. 5 MB</span>
              </div>
              <input ref={fotoRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={onFoto} />
            </div>
          </div>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={() => { closeM(); resetAN(); }} disabled={saving}>Cancelar</BtnRound>
            <BtnRound variant="blue" className="flex-1" onClick={doGuardarAN} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</BtnRound>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-anuncio' && (
        <Modal onClose={closeM}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Eliminar anuncio</h3>
          <p className="text-sm text-gray-600 mb-5">¿Seguro que deseas eliminar <strong className="text-gray-800">{modal.item.titulo}</strong>? La imagen también será eliminada.</p>
          <div className="flex gap-3">
            <BtnRound variant="ghost" className="flex-1" onClick={closeM} disabled={saving}>Cancelar</BtnRound>
            <BtnRound variant="red" className="flex-1" onClick={doEliminarAN} disabled={saving}>{saving ? 'Eliminando...' : 'Eliminar'}</BtnRound>
          </div>
        </Modal>
      )}

      {/* Modal contexto bitácora */}
      {modalCtx && (
        <Modal onClose={() => setModalCtx(null)} wide>
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${modalCtx.estado_actual === 'suspendido' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{iniciales(modalCtx.nombre)}</div>
            <div><p className="font-semibold text-gray-800">{modalCtx.nombre}</p><p className="text-xs text-gray-400">{modalCtx.email}</p></div>
            <Badge cls={`ml-auto ${modalCtx.rol === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{modalCtx.rol === 'admin' ? 'Admin' : 'Usuario'}</Badge>
          </div>

          {([
            ['Tipo de acción', <Badge cls={colorTipo(modalCtx.tipo_accion)}>{etiquetaTipo(modalCtx.tipo_accion)}</Badge>],
            ['Fecha y hora',   <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-fit"><span>🕐</span><span className="text-sm text-gray-700 font-medium">{modalCtx.fecha_accion}</span></div>],
            ['Estado actual',  <Badge cls={modalCtx.estado_actual === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{modalCtx.estado_actual === 'activo' ? 'Activo' : 'Suspendido'}</Badge>],
          ] as [string, React.ReactNode][]).map(([lbl, val]) => (
            <div key={lbl} className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{lbl}</p>
              {val}
            </div>
          ))}

          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contexto detallado</p>
            {modalCtx.contexto && Object.keys(modalCtx.contexto).length > 0 ? (
              <div className="space-y-2">
                {([
                  ['🌐', 'Dirección IP',     modalCtx.contexto.ip,                         'font-mono bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-gray-700'],
                  ['💻', 'Dispositivo',      modalCtx.contexto.dispositivo,                'break-all text-gray-700'],
                  ['🗂️', 'Tabla afectada',  modalCtx.contexto.tabla_principal_afectada,   'font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg'],
                  ['⚡', 'Acción',           modalCtx.contexto.accion,                     'text-gray-700'],
                  ['📝', 'Motivo',           modalCtx.contexto.motivo,                     'text-amber-700'],
                  ['👤', 'Ejecutado por',    modalCtx.contexto.ejecutado_por,              'font-mono break-all text-gray-700'],
                  ['🕐', 'Acceso anterior',  modalCtx.contexto.fecha_ult_acceso_anterior,  'text-gray-700'],
                  ['📁', 'Archivo',          modalCtx.contexto.archivo,                    'text-gray-700'],
                ] as [string, string, string, string][]).filter(([,, v]) => v).map(([icon, label, val, cls]) => (
                  <div key={label} className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm shrink-0">{icon}</span>
                    <span className="text-xs text-gray-500 w-32 shrink-0">{label}</span>
                    <span className={`text-xs ${cls}`}>{val}</span>
                  </div>
                ))}
                <details className="mt-3 group">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none flex items-center gap-1 list-none">
                    <span className="group-open:rotate-90 transition-transform inline-block">▶</span> Ver JSON completo
                  </summary>
                  <pre className="mt-2 bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-auto max-h-48 font-mono whitespace-pre-wrap break-all">{JSON.stringify(modalCtx.contexto, null, 2)}</pre>
                </details>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400"><span>ℹ️</span><span>No hay información adicional disponible.</span></div>
            )}
          </div>

          <button onClick={() => setModalCtx(null)} className="w-full border border-gray-200 rounded-full py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cerrar</button>
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