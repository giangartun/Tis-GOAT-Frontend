import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUsuarios, suspenderUsuario, reactivarUsuario,
  getBitacora, descargarBackup, importarBackup,
  getTecnologias, crearTecnologia, modificarTecnologia, eliminarTecnologia,
  getGrados, crearGrado, modificarGrado, eliminarGrado,
  getAnuncios, crearAnuncio, modificarAnuncio, eliminarAnuncio,
} from '../Services/admin';
import type {
  UsuarioAdmin, BitacoraItem, FiltrosUsuarios, FiltrosBitacora, TipoBitacora,
  Tecnologia, Grado, Anuncio,
} from '../Services/admin';

// ── Helpers ──────────────────────────────────────────────────────────────────
const iniciales = (nombre: string): string => {
  const p = nombre.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : p[0].substring(0, 2).toUpperCase();
};

const etiquetaTipo = (tipo: string): string => {
  const m: Record<string, string> = {
    cuenta_suspendida: 'Cuenta suspendida',
    cuenta_reactivada: 'Cuenta reactivada',
    cuenta_creada: 'Cuenta creada',
    inicio_sesion: 'Inicio de sesión',
    cierre_sesion: 'Cierre de sesión',
    modificacion_perfil: 'Mod. perfil',
    modificacion_foto: 'Mod. foto',
    modificacion_tecnologias: 'Mod. tecnologías',
    modificacion_habilidades: 'Mod. habilidades',
    modificacion_experiencia_laboral: 'Mod. exp. laboral',
    modificacion_experiencia_academica: 'Mod. exp. académica',
    modificacion_redes_sociales: 'Mod. redes',
    modificacion_proyectos: 'Mod. proyectos',
    modificacion_evidencias: 'Mod. evidencias',
    modificacion_privacidad: 'Mod. privacidad',
    modificacion_plantilla: 'Mod. plantilla',
    importacion_backup: 'Importación de backup',
  };
  return m[tipo] ?? tipo;
};

const colorBadgeTipo = (tipo: string): string => {
  if (tipo.includes('suspendida')) return 'bg-red-100 text-red-700';
  if (tipo.includes('reactivada')) return 'bg-green-100 text-green-700';
  if (tipo.includes('creada'))     return 'bg-blue-100 text-blue-700';
  if (tipo.includes('sesion'))     return 'bg-yellow-100 text-yellow-700';
  if (tipo.includes('backup'))     return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-600';
};

// ── Tipos locales ─────────────────────────────────────────────────────────────
type Tab = 'usuarios' | 'bitacora' | 'backup' | 'tecnologias' | 'grados' | 'anuncios';

type ModalInfo =
  | { tipo: 'suspender'; usuario: UsuarioAdmin }
  | { tipo: 'reactivar'; usuario: UsuarioAdmin }
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

// TABS sin emojis - solo texto
const TABS: { key: Tab; label: string }[] = [
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'bitacora', label: 'Bitácora' },
  { key: 'tecnologias', label: 'Tecnologías' },
  { key: 'grados', label: 'Grados' },
  { key: 'anuncios', label: 'Anuncios' },
  { key: 'backup', label: 'Backup' },
];

// ── Componente ────────────────────────────────────────────────────────────────
const AdminUsuarios: React.FC = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('usuarios');
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalInfo>(null);
  const [modalContexto, setModalContexto] = useState<BitacoraItem | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  // Usuarios
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loadingU, setLoadingU] = useState(true);
  const [totalU, setTotalU] = useState(0);
  const [totalA, setTotalA] = useState(0);
  const [totalS, setTotalS] = useState(0);
  const [paginaU, setPaginaU] = useState(1);
  const [lastPageU, setLastPageU] = useState(1);
  const [filtrosU, setFiltrosU] = useState<FiltrosUsuarios>({ estado: 'todos', per_page: 10 });
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bitácora
  const [bitacora, setBitacora] = useState<BitacoraItem[]>([]);
  const [loadingB, setLoadingB] = useState(false);
  const [totalBit, setTotalBit] = useState(0);
  const [paginaB, setPaginaB] = useState(1);
  const [lastPageB, setLastPageB] = useState(1);
  const [filtrosB, setFiltrosB] = useState<FiltrosBitacora>({ tipo: 'todos' });

  // Backup
  const [descargando, setDescargando] = useState(false);
  const [importando, setImportando] = useState(false);

  // Tecnologías
  const [tecnologias, setTecnologias] = useState<Tecnologia[]>([]);
  const [loadingT, setLoadingT] = useState(false);
  const [formTec, setFormTec] = useState({ nombre: '', categoria: '' });

  // Grados
  const [grados, setGrados] = useState<Grado[]>([]);
  const [loadingG, setLoadingG] = useState(false);
  const [formGrado, setFormGrado] = useState({ nombre_grado: '' });

  // Anuncios
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loadingAN, setLoadingAN] = useState(false);
  const [formAnuncio, setFormAnuncio] = useState({ titulo: '', descripcion: '', url_redireccion: '' });
  const [fotoAnuncio, setFotoAnuncio] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(import.meta.env.VITE_API_URL + '/api/usuario/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        });
      }
    } catch {
      // silencioso
    } finally {
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  const cargarUsuarios = useCallback(async (pagina = 1) => {
    setLoadingU(true);
    try {
      const res = await getUsuarios({ ...filtrosU, page: pagina });
      setUsuarios(res.data_usuarios);
      setTotalU(res.total_usuarios);
      setTotalA(res.total_activos);
      setTotalS(res.total_suspendidos);
      setPaginaU(res.current_page);
      setLastPageU(res.last_page);
    } catch {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoadingU(false);
    }
  }, [filtrosU]);

  const cargarBitacora = useCallback(async (pagina = 1) => {
    setLoadingB(true);
    try {
      const res = await getBitacora({ ...filtrosB, page: pagina });
      setBitacora(res.data);
      setTotalBit(res.total);
      setPaginaB(res.current_page);
      setLastPageB(res.last_page);
    } catch {
      showToast('Error al cargar bitácora', 'error');
    } finally {
      setLoadingB(false);
    }
  }, [filtrosB]);

  const cargarTecnologias = async () => {
    setLoadingT(true);
    try {
      const r = await getTecnologias();
      setTecnologias(r.tecnologias);
    } catch {
      showToast('Error al cargar tecnologías', 'error');
    } finally {
      setLoadingT(false);
    }
  };

  const cargarGrados = async () => {
    setLoadingG(true);
    try {
      const r = await getGrados();
      setGrados(r.grados);
    } catch {
      showToast('Error al cargar grados', 'error');
    } finally {
      setLoadingG(false);
    }
  };

  const cargarAnuncios = async () => {
    setLoadingAN(true);
    try {
      const r = await getAnuncios();
      setAnuncios(r.anuncios);
    } catch {
      showToast('Error al cargar anuncios', 'error');
    } finally {
      setLoadingAN(false);
    }
  };

  useEffect(() => {
    cargarUsuarios(1);
  }, [filtrosU, cargarUsuarios]);

  useEffect(() => {
    if (tab === 'bitacora') {
      cargarBitacora(1);
    }
  }, [filtrosB, tab, cargarBitacora]);

  useEffect(() => {
    if (tab === 'tecnologias') {
      cargarTecnologias();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'grados') {
      cargarGrados();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'anuncios') {
      cargarAnuncios();
    }
  }, [tab]);

  const handleSearch = (v: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setFiltrosU((p) => ({ ...p, search: v || undefined })), 400);
  };

  const handleSuspender = async () => {
    if (!modal || modal.tipo !== 'suspender') return;
    setSaving(true);
    try {
      await suspenderUsuario(modal.usuario.id_usuario);
      showToast('Cuenta suspendida', 'success');
      cargarUsuarios(paginaU);
    } catch {
      showToast('Error al suspender', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleReactivar = async () => {
    if (!modal || modal.tipo !== 'reactivar') return;
    setSaving(true);
    try {
      await reactivarUsuario(modal.usuario.id_usuario);
      showToast('Cuenta reactivada', 'success');
      cargarUsuarios(paginaU);
    } catch {
      showToast('Error al reactivar', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleDescargar = async () => {
    setDescargando(true);
    try {
      await descargarBackup();
      showToast('Backup descargado', 'success');
    } catch {
      showToast('Error al descargar', 'error');
    } finally {
      setDescargando(false);
    }
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setModal({ tipo: 'importar', archivo: f });
    e.target.value = '';
  };

  const handleImportar = async () => {
    if (!modal || modal.tipo !== 'importar') return;
    setImportando(true);
    try {
      await importarBackup(modal.archivo);
      showToast('Backup importado. Cerrando sesión...', 'success');
      setTimeout(() => {
        localStorage.clear();
        navigate('/login', {
          replace: true,
          state: { message: 'Backup importado. Inicia sesión nuevamente.' },
        });
      }, 2000);
    } catch {
      showToast('Error al importar', 'error');
      setImportando(false);
      setModal(null);
    }
  };

  const handleGuardarTec = async () => {
    if (!formTec.nombre.trim() || !formTec.categoria.trim()) {
      showToast('Nombre y categoría son obligatorios', 'error');
      return;
    }
    setSaving(true);
    try {
      if (modal?.tipo === 'nueva-tecnologia') {
        await crearTecnologia(formTec);
        showToast('Tecnología creada', 'success');
      } else if (modal?.tipo === 'editar-tecnologia') {
        await modificarTecnologia(modal.item.id_tecnologia, formTec);
        showToast('Tecnología actualizada', 'success');
      }
      cargarTecnologias();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleEliminarTec = async () => {
    if (!modal || modal.tipo !== 'eliminar-tecnologia') return;
    setSaving(true);
    try {
      await eliminarTecnologia(modal.item.id_tecnologia);
      showToast('Tecnología eliminada', 'success');
      cargarTecnologias();
    } catch {
      showToast('Error al eliminar', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleGuardarGrado = async () => {
    if (!formGrado.nombre_grado.trim()) {
      showToast('El nombre es obligatorio', 'error');
      return;
    }
    setSaving(true);
    try {
      if (modal?.tipo === 'nuevo-grado') {
        await crearGrado(formGrado);
        showToast('Grado creado', 'success');
      } else if (modal?.tipo === 'editar-grado') {
        await modificarGrado(modal.item.id_grado, formGrado);
        showToast('Grado actualizado', 'success');
      }
      cargarGrados();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const handleEliminarGrado = async () => {
    if (!modal || modal.tipo !== 'eliminar-grado') return;
    setSaving(true);
    try {
      await eliminarGrado(modal.item.id_grado);
      showToast('Grado eliminado', 'success');
      cargarGrados();
    } catch {
      showToast('Error al eliminar', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const resetFormAnuncio = () => {
    setFormAnuncio({ titulo: '', descripcion: '', url_redireccion: '' });
    setFotoAnuncio(null);
    setPreviewFoto(null);
  };

  const handleFotoAnuncio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFotoAnuncio(f);
    setPreviewFoto(URL.createObjectURL(f));
  };

  const handleGuardarAnuncio = async () => {
    if (!formAnuncio.titulo.trim() || !formAnuncio.url_redireccion.trim()) {
      showToast('Título y URL son obligatorios', 'error');
      return;
    }
    if (modal?.tipo === 'nuevo-anuncio' && !formAnuncio.descripcion.trim() && !fotoAnuncio) {
      showToast('Incluye al menos descripción o imagen', 'error');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('titulo', formAnuncio.titulo);
      if (formAnuncio.descripcion) fd.append('descripcion', formAnuncio.descripcion);
      fd.append('url_redireccion', formAnuncio.url_redireccion);
      if (fotoAnuncio) fd.append('foto', fotoAnuncio);
      if (modal?.tipo === 'nuevo-anuncio') {
        await crearAnuncio(fd);
        showToast('Anuncio creado', 'success');
      } else if (modal?.tipo === 'editar-anuncio') {
        await modificarAnuncio(modal.item.id_anuncio, fd);
        showToast('Anuncio actualizado', 'success');
      }
      cargarAnuncios();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
      setModal(null);
      resetFormAnuncio();
    }
  };

  const handleEliminarAnuncio = async () => {
    if (!modal || modal.tipo !== 'eliminar-anuncio') return;
    setSaving(true);
    try {
      await eliminarAnuncio(modal.item.id_anuncio);
      showToast('Anuncio eliminado', 'success');
      cargarAnuncios();
    } catch {
      showToast('Error al eliminar', 'error');
    } finally {
      setSaving(false);
      setModal(null);
    }
  };

  const SkeletonRows = ({ n = 4 }: { n?: number }) => (
    <div className="p-4 space-y-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-2/5"></div>
            <div className="h-2 bg-gray-100 rounded w-1/3"></div>
          </div>
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-7 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  const Modal = ({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl p-7 w-full max-h-[90vh] overflow-y-auto ${wide ? 'max-w-xl' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOPBAR */}
      <header className="flex items-center justify-between bg-app-header px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm font-bold">
            TG
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Sistema de Portafolios Digitales</h1>
            <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded">ADMINISTRADOR</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Cerrar sesión
        </button>
      </header>

      {/* SUBNAV */}
      <nav className="bg-app-topbar px-6 py-2 text-white text-sm">
        <span className="text-white/50">Admin</span>
        <span className="text-white/40 mx-2">›</span>
        <span className="text-white/90">{TABS.find((t) => t.key === tab)?.label}</span>
      </nav>

      <div className="flex flex-1">
        {/* SIDEBAR - solo texto, sin emojis */}
        <aside className="hidden lg:flex flex-col w-28 bg-app-sidebar text-white py-6 gap-2 items-center border-r border-app-border shrink-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              title={t.label}
              className={`flex items-center justify-center w-24 h-10 rounded-xl transition text-sm font-medium
                ${tab === t.key ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          {/* USUARIOS */}
          {tab === 'usuarios' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gestión de usuarios</h2>
                <p className="text-sm text-gray-500 mt-1">Administra todas las cuentas registradas</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total usuarios', val: totalU, color: 'text-gray-800' },
                  { label: 'Cuentas activas', val: totalA, color: 'text-green-700' },
                  { label: 'Suspendidas', val: totalS, color: 'text-red-600' },
                  { label: 'Registradas', val: totalU, color: 'text-gray-800' },
                ].map((m) => (
                  <div key={m.label} className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
                    <p className={`text-3xl font-bold ${m.color}`}>{m.val}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-52 rounded-2xl border border-app-border bg-white px-4 py-2 shadow-sm">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    className="w-full bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <select
                  className="rounded-2xl border border-app-border bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none"
                  value={filtrosU.estado ?? 'todos'}
                  onChange={(e) => setFiltrosU((p) => ({ ...p, estado: e.target.value as FiltrosUsuarios['estado'] }))}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="suspendido">Suspendidos</option>
                </select>
              </div>

              <div className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden">
                {loadingU ? (
                  <SkeletonRows n={5} />
                ) : usuarios.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                    <span className="text-3xl">👥</span>
                    <p className="text-sm">No se encontraron usuarios</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-100">
                        <tr>
                          {['Usuario', 'Rol', 'Estado', 'Registro', 'Último acceso', 'Acciones'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((u) => (
                          <tr key={u.id_usuario} className={`border-b border-gray-50 hover:bg-gray-50 transition ${u.estado === 'suspendido' ? 'bg-red-50' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${u.estado === 'suspendido' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {iniciales(u.nombre)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{u.nombre}</p>
                                  <p className="text-xs text-gray-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.rol === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {u.rol === 'admin' ? 'Admin' : 'Usuario'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {u.estado === 'activo' ? 'Activa' : 'Suspendida'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{u.fecha_registro}</td>
                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{u.fecha_ult_acceso}</td>
                            <td className="px-4 py-3">
                              {u.rol !== 'admin' &&
                                (u.estado === 'activo' ? (
                                  <button
                                    onClick={() => setModal({ tipo: 'suspender', usuario: u })}
                                    className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                                  >
                                    Suspender
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setModal({ tipo: 'reactivar', usuario: u })}
                                    className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 transition"
                                  >
                                    Reactivar
                                  </button>
                                ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loadingU && lastPageU > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Página {paginaU} de {lastPageU} — {totalU} usuarios
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs disabled:opacity-40"
                        disabled={paginaU === 1}
                        onClick={() => cargarUsuarios(paginaU - 1)}
                      >
                        ← Anterior
                      </button>
                      <button
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs disabled:opacity-40"
                        disabled={paginaU === lastPageU}
                        onClick={() => cargarUsuarios(paginaU + 1)}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BITÁCORA */}
          {tab === 'bitacora' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Bitácora de acciones</h2>
                <p className="text-sm text-gray-500 mt-1">Historial de todas las acciones registradas en la plataforma</p>
              </div>

              <div className="flex gap-3 flex-wrap items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Desde</label>
                  <input
                    type="date"
                    className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm outline-none"
                    onChange={(e) => setFiltrosB((p) => ({ ...p, fecha_desde: e.target.value || undefined }))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Hasta</label>
                  <input
                    type="date"
                    className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm outline-none"
                    onChange={(e) => setFiltrosB((p) => ({ ...p, fecha_hasta: e.target.value || undefined }))}
                  />
                </div>
                <select
                  className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm outline-none"
                  value={filtrosB.tipo ?? 'todos'}
                  onChange={(e) => setFiltrosB((p) => ({ ...p, tipo: e.target.value as TipoBitacora }))}
                >
                  <option value="todos">Todas las acciones</option>
                  <option value="suspender">Suspensiones</option>
                  <option value="reactivar">Reactivaciones</option>
                  <option value="modificaciones">Modificaciones</option>
                  <option value="creacion">Creaciones de cuenta</option>
                  <option value="login">Inicios de sesión</option>
                  <option value="logout">Cierres de sesión</option>
                </select>
                <button
                  className="rounded-xl border border-app-border bg-white px-4 py-2 text-sm hover:bg-gray-50 transition"
                  onClick={() => cargarBitacora(1)}
                >
                  🔄 Aplicar
                </button>
              </div>

              <div className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden">
                {loadingB ? (
                  <SkeletonRows n={4} />
                ) : bitacora.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                    <span className="text-3xl">📋</span>
                    <p className="text-sm">No hay registros en la bitácora</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-100">
                        <tr>
                          {['Usuario', 'Tipo de acción', 'Estado actual', 'Fecha y hora', 'Detalles'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bitacora.map((b) => (
                          <tr key={b.id_registro} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    b.estado_actual === 'suspendido' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {iniciales(b.nombre)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{b.nombre}</p>
                                  <p className="text-xs text-gray-400">{b.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colorBadgeTipo(b.tipo_accion)}`}>
                                {etiquetaTipo(b.tipo_accion)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${b.estado_actual === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {b.estado_actual === 'activo' ? 'Activo' : 'Suspendido'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{b.fecha_accion}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setModalContexto(b)}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium transition"
                              >
                                Ver contexto
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loadingB && lastPageB > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Página {paginaB} de {lastPageB} — {totalBit} registros
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs disabled:opacity-40"
                        disabled={paginaB === 1}
                        onClick={() => cargarBitacora(paginaB - 1)}
                      >
                        ← Anterior
                      </button>
                      <button
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs disabled:opacity-40"
                        disabled={paginaB === lastPageB}
                        onClick={() => cargarBitacora(paginaB + 1)}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TECNOLOGÍAS */}
          {tab === 'tecnologias' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Tecnologías</h2>
                  <p className="text-sm text-gray-500 mt-1">Gestiona el catálogo de tecnologías disponibles</p>
                </div>
                <button
                  onClick={() => {
                    setFormTec({ nombre: '', categoria: '' });
                    setModal({ tipo: 'nueva-tecnologia' });
                  }}
                  className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  + Agregar tecnología
                </button>
              </div>
              <div className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden">
                {loadingT ? (
                  <SkeletonRows n={4} />
                ) : tecnologias.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                    <span className="text-3xl">⚙️</span>
                    <p className="text-sm">No hay tecnologías</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Categoría</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tecnologias.map((t) => (
                        <tr key={t.id_tecnologia} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-800">{t.nombre}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{t.categoria}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFormTec({ nombre: t.nombre, categoria: t.categoria });
                                  setModal({ tipo: 'editar-tecnologia', item: t });
                                }}
                                className="rounded-full border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50 transition"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setModal({ tipo: 'eliminar-tecnologia', item: t })}
                                className="rounded-full border border-red-200 text-red-600 px-3 py-1 text-xs hover:bg-red-50 transition"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* GRADOS */}
          {tab === 'grados' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Grados académicos</h2>
                  <p className="text-sm text-gray-500 mt-1">Gestiona los grados académicos disponibles</p>
                </div>
                <button
                  onClick={() => {
                    setFormGrado({ nombre_grado: '' });
                    setModal({ tipo: 'nuevo-grado' });
                  }}
                  className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  + Agregar grado
                </button>
              </div>
              <div className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden">
                {loadingG ? (
                  <SkeletonRows n={4} />
                ) : grados.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
                    <span className="text-3xl">🎓</span>
                    <p className="text-sm">No hay grados</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre del grado</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grados.map((g) => (
                        <tr key={g.id_grado} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-800">{g.nombre_grado}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFormGrado({ nombre_grado: g.nombre_grado });
                                  setModal({ tipo: 'editar-grado', item: g });
                                }}
                                className="rounded-full border border-gray-200 px-3 py-1 text-xs hover:bg-gray-50 transition"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => setModal({ tipo: 'eliminar-grado', item: g })}
                                className="rounded-full border border-red-200 text-red-600 px-3 py-1 text-xs hover:bg-red-50 transition"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ANUNCIOS */}
          {tab === 'anuncios' && (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Anuncios</h2>
                  <p className="text-sm text-gray-500 mt-1">Gestiona los anuncios visibles en la plataforma</p>
                </div>
                <button
                  onClick={() => {
                    resetFormAnuncio();
                    setModal({ tipo: 'nuevo-anuncio' });
                  }}
                  className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  + Agregar anuncio
                </button>
              </div>
              {loadingAN ? (
                <SkeletonRows n={3} />
              ) : anuncios.length === 0 ? (
                <div className="rounded-2xl border border-app-border bg-white shadow-sm flex flex-col items-center gap-2 py-12 text-gray-400">
                  <span className="text-3xl">📢</span>
                  <p className="text-sm">No hay anuncios</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {anuncios.map((a) => (
                    <article key={a.id_anuncio} className="rounded-2xl border border-app-border bg-white shadow-sm overflow-hidden flex flex-col">
                      {a.foto_url && (
                        <div className="h-36 overflow-hidden">
                          <img src={a.foto_url} alt={a.titulo} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{a.titulo}</h3>
                        {a.descripcion && <p className="text-xs text-gray-500 line-clamp-2">{a.descripcion}</p>}
                        <a href={a.url_redireccion} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate">
                          🔗 {a.url_redireccion}
                        </a>
                        <p className="text-xs text-gray-400">{a.creado_en}</p>
                      </div>
                      <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setFormAnuncio({
                              titulo: a.titulo,
                              descripcion: a.descripcion ?? '',
                              url_redireccion: a.url_redireccion,
                            });
                            setPreviewFoto(a.foto_url);
                            setFotoAnuncio(null);
                            setModal({ tipo: 'editar-anuncio', item: a });
                          }}
                          className="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setModal({ tipo: 'eliminar-anuncio', item: a })}
                          className="flex-1 rounded-full border border-red-200 text-red-600 px-3 py-1.5 text-xs hover:bg-red-50 transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BACKUP */}
          {tab === 'backup' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gestión de backup</h2>
                <p className="text-sm text-gray-500 mt-1">Exporta o restaura los datos de la plataforma</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-app-border bg-white shadow-sm p-6 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">⬇️</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Exportar backup</h3>
                    <p className="text-sm text-gray-500 mt-1">Descarga un archivo JSON con todos los datos actuales de la plataforma.</p>
                  </div>
                  <button
                    onClick={handleDescargar}
                    disabled={descargando}
                    className="rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 w-fit"
                  >
                    {descargando ? 'Generando...' : 'Descargar backup'}
                  </button>
                </div>
                <div className="rounded-2xl border border-app-border bg-white shadow-sm p-6 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">⬆️</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Importar backup</h3>
                    <p className="text-sm text-gray-500 mt-1">Carga un archivo de backup para restaurar datos. Formatos: .json o .zip (máx. 10 MB).</p>
                  </div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-center"
                  >
                    <span className="text-2xl">📁</span>
                    <span className="text-sm text-gray-600">Haz clic para seleccionar el archivo</span>
                    <span className="text-xs text-gray-400">JSON o ZIP, máximo 10 MB</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".json,.zip" className="hidden" onChange={handleArchivoSeleccionado} />
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                    <span className="shrink-0">⚠️</span>
                    <span>Al importar, <strong>todas las sesiones se cerrarán</strong> y serás redirigido al login.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {modal?.tipo === 'suspender' && (
        <Modal onClose={() => setModal(null)}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🚫</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Confirmar suspensión</h3>
          <p className="text-sm text-gray-500 mb-4">La cuenta será suspendida de inmediato. El usuario no podrá acceder hasta que sea reactivada.</p>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
              {iniciales(modal.usuario.nombre)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{modal.usuario.nombre}</p>
              <p className="text-xs text-gray-400">{modal.usuario.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50" onClick={() => setModal(null)} disabled={saving}>
              Cancelar
            </button>
            <button className="flex-1 bg-red-600 text-white rounded-full py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" onClick={handleSuspender} disabled={saving}>
              {saving ? 'Procesando...' : 'Suspender'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'reactivar' && (
        <Modal onClose={() => setModal(null)}>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl mb-4">✅</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Confirmar reactivación</h3>
          <p className="text-sm text-gray-500 mb-4">La cuenta será reactivada y el usuario podrá acceder nuevamente.</p>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              {iniciales(modal.usuario.nombre)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{modal.usuario.nombre}</p>
              <p className="text-xs text-gray-400">{modal.usuario.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50" onClick={() => setModal(null)} disabled={saving}>
              Cancelar
            </button>
            <button className="flex-1 bg-green-600 text-white rounded-full py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50" onClick={handleReactivar} disabled={saving}>
              {saving ? 'Procesando...' : 'Reactivar'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'importar' && (
        <Modal onClose={() => !importando && setModal(null)}>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl mb-4">⚠️</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Confirmar importación</h3>
          <p className="text-sm text-gray-500 mb-3">
            Se importará <strong>{modal.archivo.name}</strong>. Esta acción sobreescribirá todos los datos y cerrará todas las sesiones.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-5">
            Esta acción es <strong>irreversible</strong>. Asegúrate de tener una copia de seguridad.
          </div>
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50" onClick={() => setModal(null)} disabled={importando}>
              Cancelar
            </button>
            <button className="flex-1 bg-red-600 text-white rounded-full py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" onClick={handleImportar} disabled={importando}>
              {importando ? 'Importando...' : 'Confirmar'}
            </button>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nueva-tecnologia' || modal?.tipo === 'editar-tecnologia') && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {modal.tipo === 'nueva-tecnologia' ? '+ Nueva tecnología' : 'Editar tecnología'}
          </h3>
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Ej: React"
                value={formTec.nombre}
                onChange={(e) => setFormTec({ ...formTec, nombre: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Ej: Frontend"
                value={formTec.categoria}
                onChange={(e) => setFormTec({ ...formTec, categoria: e.target.value })}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50" onClick={() => setModal(null)} disabled={saving}>
              Cancelar
            </button>
            <button className="flex-1 bg-blue-600 text-white rounded-full py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50" onClick={handleGuardarTec} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-tecnologia' && (
        <Modal onClose={() => setModal(null)}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Eliminar tecnología</h3>
          <p className="text-sm text-gray-500 mb-5">
            ¿Seguro que deseas eliminar <strong>{modal.item.nombre}</strong>? Se eliminarán también sus asociaciones con proyectos.
          </p>
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50" onClick={() => setModal(null)} disabled={saving}>
              Cancelar
            </button>
            <button className="flex-1 bg-red-600 text-white rounded-full py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" onClick={handleEliminarTec} disabled={saving}>
              {saving ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nuevo-grado' || modal?.tipo === 'editar-grado') && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {modal.tipo === 'nuevo-grado' ? '+ Nuevo grado' : 'Editar grado'}
          </h3>
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del grado *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Ej: Licenciatura"
              value={formGrado.nombre_grado}
              onChange={(e) => setFormGrado({ nombre_grado: e.target.value })}
              autoComplete="off"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50" onClick={() => setModal(null)} disabled={saving}>
              Cancelar
            </button>
            <button className="flex-1 bg-blue-600 text-white rounded-full py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50" onClick={handleGuardarGrado} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-grado' && (
        <Modal onClose={() => setModal(null)}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Eliminar grado</h3>
          <p className="text-sm text-gray-500 mb-5">
            ¿Seguro que deseas eliminar <strong>{modal.item.nombre_grado}</strong>?
          </p>
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50" onClick={() => setModal(null)} disabled={saving}>
              Cancelar
            </button>
            <button className="flex-1 bg-red-600 text-white rounded-full py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" onClick={handleEliminarGrado} disabled={saving}>
              {saving ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}

      {(modal?.tipo === 'nuevo-anuncio' || modal?.tipo === 'editar-anuncio') && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {modal.tipo === 'nuevo-anuncio' ? '+ Nuevo anuncio' : 'Editar anuncio'}
          </h3>
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="Título del anuncio"
                value={formAnuncio.titulo}
                onChange={(e) => setFormAnuncio({ ...formAnuncio, titulo: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
                rows={3}
                placeholder="Descripción (opcional si sube imagen)"
                value={formAnuncio.descripcion}
                onChange={(e) => setFormAnuncio({ ...formAnuncio, descripcion: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL de redirección *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
                placeholder="https://..."
                value={formAnuncio.url_redireccion}
                onChange={(e) => setFormAnuncio({ ...formAnuncio, url_redireccion: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Imagen (opcional)</label>
              {previewFoto && (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 mb-2">
                  <img src={previewFoto} alt="preview" className="w-full h-full object-cover" />
                  <button
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center"
                    onClick={() => {
                      setFotoAnuncio(null);
                      setPreviewFoto(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              <div
                onClick={() => fotoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition text-center"
              >
                <span className="text-xl">🖼️</span>
                <span className="text-xs text-gray-500">{previewFoto ? 'Cambiar imagen' : 'Seleccionar imagen'}</span>
                <span className="text-xs text-gray-400">JPG, PNG, WebP — máx. 5 MB</span>
              </div>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFotoAnuncio}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                setModal(null);
                resetFormAnuncio();
              }}
              disabled={saving}
            >
              Cancelar
            </button>
            <button className="flex-1 bg-blue-600 text-white rounded-full py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50" onClick={handleGuardarAnuncio} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {modal?.tipo === 'eliminar-anuncio' && (
        <Modal onClose={() => setModal(null)}>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl mb-4">🗑️</div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">Eliminar anuncio</h3>
          <p className="text-sm text-gray-500 mb-5">
            ¿Seguro que deseas eliminar <strong>{modal.item.titulo}</strong>? La imagen también será eliminada.
          </p>
          <div className="flex gap-3">
            <button className="flex-1 border border-gray-200 rounded-full py-2 text-sm hover:bg-gray-50" onClick={() => setModal(null)} disabled={saving}>
              Cancelar
            </button>
            <button className="flex-1 bg-red-600 text-white rounded-full py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50" onClick={handleEliminarAnuncio} disabled={saving}>
              {saving ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL CONTEXTO BITÁCORA */}
      {modalContexto && (
        <Modal onClose={() => setModalContexto(null)} wide>
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                modalContexto.estado_actual === 'suspendido' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {iniciales(modalContexto.nombre)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{modalContexto.nombre}</p>
              <p className="text-xs text-gray-400">{modalContexto.email}</p>
            </div>
            <span
              className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${
                modalContexto.rol === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {modalContexto.rol === 'admin' ? 'Admin' : 'Usuario'}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tipo de acción</p>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${colorBadgeTipo(modalContexto.tipo_accion)}`}>
              {etiquetaTipo(modalContexto.tipo_accion)}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Fecha y hora</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-fit">
              <span>🕐</span>
              <span className="text-sm text-gray-700 font-medium">{modalContexto.fecha_accion}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Estado actual del usuario</p>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                modalContexto.estado_actual === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {modalContexto.estado_actual === 'activo' ? 'Activo' : 'Suspendido'}
            </span>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contexto detallado</p>
            {modalContexto.contexto && Object.keys(modalContexto.contexto).length > 0 ? (
              <div className="space-y-2">
                {modalContexto.contexto.ip && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm">🌐</span>
                    <span className="text-xs text-gray-500 w-28 shrink-0">Dirección IP</span>
                    <span className="text-xs font-mono bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-gray-700">
                      {modalContexto.contexto.ip}
                    </span>
                  </div>
                )}
                {modalContexto.contexto.dispositivo && (
                  <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm shrink-0">💻</span>
                    <span className="text-xs text-gray-500 w-28 shrink-0">Dispositivo</span>
                    <span className="text-xs text-gray-700 break-all">{modalContexto.contexto.dispositivo}</span>
                  </div>
                )}
                {modalContexto.contexto.tabla_principal_afectada && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm">🗂️</span>
                    <span className="text-xs text-gray-500 w-28 shrink-0">Tabla afectada</span>
                    <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg">
                      {modalContexto.contexto.tabla_principal_afectada}
                    </span>
                  </div>
                )}
                {modalContexto.contexto.accion && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm">⚡</span>
                    <span className="text-xs text-gray-500 w-28 shrink-0">Acción</span>
                    <span className="text-xs text-gray-700">{modalContexto.contexto.accion}</span>
                  </div>
                )}
                {modalContexto.contexto.motivo && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    <span className="text-sm shrink-0">📝</span>
                    <span className="text-xs text-gray-500 w-28 shrink-0">Motivo</span>
                    <span className="text-xs text-amber-700">{modalContexto.contexto.motivo}</span>
                  </div>
                )}
                {modalContexto.contexto.ejecutado_por && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm">👤</span>
                    <span className="text-xs text-gray-500 w-28 shrink-0">Ejecutado por</span>
                    <span className="text-xs font-mono text-gray-600 break-all">{modalContexto.contexto.ejecutado_por}</span>
                  </div>
                )}
                {modalContexto.contexto.fecha_ult_acceso_anterior && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm">🕐</span>
                    <span className="text-xs text-gray-500 w-28 shrink-0">Acceso anterior</span>
                    <span className="text-xs text-gray-700">{modalContexto.contexto.fecha_ult_acceso_anterior}</span>
                  </div>
                )}
                {modalContexto.contexto.archivo && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-sm">📁</span>
                    <span className="text-xs text-gray-500 w-28 shrink-0">Archivo</span>
                    <span className="text-xs text-gray-700">{modalContexto.contexto.archivo}</span>
                  </div>
                )}
                <details className="mt-3 group">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none flex items-center gap-1 list-none">
                    <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                    Ver JSON completo
                  </summary>
                  <pre className="mt-2 bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-auto max-h-48 font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(modalContexto.contexto, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400">
                <span>ℹ️</span>
                <span>No hay información adicional disponible.</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setModalContexto(null)}
            className="w-full border border-gray-200 rounded-full py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        </Modal>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium shadow-lg
          ${toast.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}
        >
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;