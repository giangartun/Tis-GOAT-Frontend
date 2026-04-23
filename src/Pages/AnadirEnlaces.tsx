import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Settings,
  Mail,
  MapPin,
  GraduationCap,
  Globe,
  Trash2,
  ChevronDown,
  LogOut
} from 'lucide-react';

interface LinkItem {
  id_redes_prof: string;
  id_usuario: string;
  nombre_red: string;
  url_red: string;
  created_at?: string;
  updated_at?: string;
}

interface Usuario {
  id?: number | string;
  id_usuario?: number | string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  profesion?: string;
  email?: string;
  ciudad?: string;
  institucion?: string;
  biografia?: string;
}

const getFullName = (u: Usuario) =>
  [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' ');

const getShortName = (u: Usuario) =>
  [u.nombre, u.apellido_paterno].filter(Boolean).join(' ');

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000';

export const PLATFORM_BASES: Record<string, string> = {
  "LinkedIn":    "https://www.linkedin.com/in/",
  "GitHub":      "https://github.com/",
  "GitLab":      "https://gitlab.com/",
  "LeetCode":    "https://leetcode.com/",
  "HackerRank":  "https://www.hackerrank.com/",
  "Kaggle":      "https://www.kaggle.com/",
  "Instagram":   "https://www.instagram.com/",
  "Facebook":    "https://www.facebook.com/",
  "Twitter / X": "https://x.com/"
};

// Mapa de minúsculas (valor enviado al backend) → label legible para mostrar en UI
const NETWORK_LABEL_MAP: Record<string, string> = {
  linkedin:   "LinkedIn",
  github:     "GitHub",
  gitlab:     "GitLab",
  leetcode:   "LeetCode",
  hackerrank: "HackerRank",
  kaggle:     "Kaggle",
  instagram:  "Instagram",
  facebook:   "Facebook",
  twitter:    "Twitter / X"
};

const NETWORK_OPTIONS = Object.keys(PLATFORM_BASES).map(key => ({
  value: key,
  label: key
}));

export default function AnadirEnlaces() {
  const navigate = useNavigate();
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [usuario] = useState<Usuario>(() => {
    try {
      const data = JSON.parse(localStorage.getItem('usuario') || '{}');
      return {
        nombre: 'Eliana',
        apellido_paterno: 'Martinez',
        profesion: 'Ingeniera de Software',
        ...data
      };
    } catch {
      return {
        nombre: 'Eliana',
        apellido_paterno: 'Martinez',
        profesion: 'Ingeniera de Software'
      };
    }
  });

  const token = localStorage.getItem('token');
  const idUsuario = String(usuario?.id_usuario || usuario?.id || '');

  const [links, setLinks] = useState<LinkItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cachedLinks') || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(links.length === 0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [sortBy, setSortBy] = useState('más recientes');

  const [nombreRed, setNombreRed] = useState('');
  const [nuevaUrl, setNuevaUrl] = useState('');

  // Auto-rellena la URL base cuando se selecciona una plataforma
  useEffect(() => {
    if (nombreRed && PLATFORM_BASES[nombreRed]) {
      setNuevaUrl(PLATFORM_BASES[nombreRed]);
    } else {
      setNuevaUrl('');
    }
  }, [nombreRed]);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    [token]
  );

  const normalizeLink = (item: any): LinkItem => ({
    id_redes_prof: String(item?.id_redes_prof ?? ''),
    id_usuario:    String(item?.id_usuario ?? ''),
    nombre_red:    item?.nombre_red ?? '',
    url_red:       String(item?.url_red ?? ''),
    created_at:    item?.created_at,
    updated_at:    item?.updated_at
  });

  // FIX: busca primero en el mapa de minúsculas (lo que devuelve el backend),
  // y si no lo encuentra busca en las opciones del select (por si acaso).
  const getNetworkLabel = (value: string) => {
    return (
      NETWORK_LABEL_MAP[value.toLowerCase()] ||
      NETWORK_OPTIONS.find((opt) => opt.value === value)?.label ||
      value
    );
  };

  useEffect(() => {
    if (urlInputRef.current) urlInputRef.current.scrollLeft = 0;
  }, [nuevaUrl]);

  const fetchLinks = async () => {
    if (!token) {
      navigate('/signin');
      return;
    }

    if (!idUsuario) {
      setLoading(false);
      setError('No se encontró el id del usuario en sesión.');
      return;
    }

    if (links.length === 0) setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/redes-profesionales/${idUsuario}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudieron cargar los enlaces.');
      }

      const rawLinks = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const normalized = rawLinks.map(normalizeLink);
      setLinks(normalized);
      localStorage.setItem('cachedLinks', JSON.stringify(normalized));
    } catch (err: any) {
      console.error('Error fetching links:', err);
      setError(err?.message || 'Ocurrió un error al cargar los enlaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const isValidUrl = (url: string) => {
    try {
      const normalized =
        url.startsWith('http://') || url.startsWith('https://')
          ? url
          : `https://${url}`;
      new URL(normalized);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeUrlBeforeSend = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return trimmed;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  const resetForm = () => {
    setNombreRed('');
    setNuevaUrl('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      navigate('/signin');
      return;
    }

    if (!idUsuario) {
      alert('No se encontró el id del usuario.');
      return;
    }

    if (!nombreRed) {
      alert('Por favor selecciona una plataforma.');
      return;
    }

    if (!nuevaUrl.trim()) {
      alert('La URL es obligatoria.');
      return;
    }

    const basePlatform = PLATFORM_BASES[nombreRed];
    if (basePlatform && nuevaUrl.trim() === basePlatform) {
      alert('Debes ingresar tu usuario al final de la URL base.');
      return;
    }

    if (!isValidUrl(nuevaUrl)) {
      alert('URL no válida.');
      return;
    }

    // FIX: se envía nombre_red en minúsculas para que coincida con la
    // validación del backend: in:linkedin,github,gitlab,...
    const payload = {
      id_usuario:  idUsuario,
      nombre_red:  nombreRed.toLowerCase(),
      url_red:     normalizeUrlBeforeSend(nuevaUrl)
    };

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/redes-profesionales`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo guardar el enlace.');
      }

      const savedLink = normalizeLink(data?.red ?? data);

      setLinks((prev) => {
        const newLinks = [savedLink, ...prev];
        localStorage.setItem('cachedLinks', JSON.stringify(newLinks));
        return newLinks;
      });
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      resetForm();
    } catch (err: any) {
      console.error('Error saving link:', err);
      setError(err?.message || 'Ocurrió un error al guardar el enlace.');
      alert(err?.message || 'Ocurrió un error al guardar el enlace.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id_redes_prof: string) => {
    setShowDeleteConfirm(id_redes_prof);
  };

  const executeDelete = async () => {
    if (!showDeleteConfirm || !token) {
      if (!token) navigate('/signin');
      return;
    }

    setDeletingId(showDeleteConfirm);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE}/api/redes-profesionales/${showDeleteConfirm}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo eliminar el enlace.');
      }

      setLinks((prev) => {
        const newLinks = prev.filter((l) => l.id_redes_prof !== showDeleteConfirm);
        localStorage.setItem('cachedLinks', JSON.stringify(newLinks));
        return newLinks;
      });

      setShowDeleteConfirm(null);
      setShowDeleteSuccess(true);
    } catch (err: any) {
      console.error('Error deleting link:', err);
      setError(err?.message || 'Ocurrió un error al eliminar el enlace.');
      alert(err?.message || 'Ocurrió un error al eliminar el enlace.');
    } finally {
      setDeletingId(null);
    }
  };

  const sortedLinks = [...links].sort((a, b) => {
    const tA = new Date(a.created_at || 0).getTime();
    const tB = new Date(b.created_at || 0).getTime();

    if (tA !== tB) {
      return sortBy === 'más recientes' ? tB - tA : tA - tB;
    }

    return sortBy === 'más recientes'
      ? b.id_redes_prof.localeCompare(a.id_redes_prof)
      : a.id_redes_prof.localeCompare(b.id_redes_prof);
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-inter text-black">
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-app-border bg-app-header px-4 md:px-6 py-4 text-white shrink-0 gap-4 md:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm font-bold shrink-0">
            TG
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-center sm:text-left">
            Sistema de Portafolios Digitales
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-center sm:text-right hidden sm:block">
            <p className="text-sm font-medium">{getShortName(usuario)}</p>
            <p className="text-xs text-white/70">{usuario.email}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('usuario');
              localStorage.removeItem('portafolio');
              navigate('/login');
            }}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      <nav className="flex items-center justify-center border-b border-app-border bg-app-topbar px-4 md:px-6 py-3 text-sm text-white shrink-0 overflow-x-auto">
        <div className="flex gap-6 md:gap-8 font-medium min-w-max">
          <span onClick={() => navigate('/')} className="cursor-pointer hover:text-white/80 transition">Inicio</span>
          <span onClick={() => navigate('/perfil')} className="cursor-pointer hover:text-white/80 transition">Mi perfil</span>
          <span onClick={() => navigate('/mis-proyectos')} className="cursor-pointer hover:text-white/80 transition">Mis proyectos</span>
        </div>
      </nav>

      <nav className="border-b border-app-border bg-app-surface px-4 md:px-6 py-3 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs md:text-sm text-app-muted min-w-max">
          <span onClick={() => navigate('/')} className="cursor-pointer hover:text-app-text">Inicio</span>
          <span>&gt;</span>
          <span className="text-app-text">Navegación</span>
          <span>&gt;</span>
          <span onClick={() => navigate('/perfil')} className="cursor-pointer hover:text-app-text">Mi perfil</span>
          <span>&gt;</span>
          <span className="text-app-text font-semibold">Enlaces</span>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row flex-1">
        <aside className="w-full md:w-[280px] bg-[#1D4A76] text-white flex flex-col items-center py-8 md:py-12 shadow-inner shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/20 bg-white/5 mb-4 md:mb-6 flex items-center justify-center shrink-0">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/10" />
          </div>

          <h2 className="text-[18px] md:text-[20px] font-bold text-center px-4">
            {getFullName(usuario)}
          </h2>
          <p className="text-[14px] md:text-[15px] text-blue-100 font-medium mb-6 md:mb-12 opacity-80 text-center px-2">
            {usuario.profesion}
          </p>

          <div className="w-full">
            <button onClick={() => navigate('/')} className="flex items-center w-full pl-[50px] py-3 hover:bg-white/10 transition">
              <Home className="w-7 h-7 mr-4" /> Inicio
            </button>
            <button className="flex items-center w-full pl-8 md:pl-[50px] py-3 hover:bg-white/10 transition">
              <Settings className="w-6 h-6 md:w-7 md:h-7 mr-4" /> Ajustes
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 md:px-12 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 text-black gap-4 md:gap-0">
            <div className="text-center md:text-left">
              <h2 className="text-[22px] md:text-[26px] font-bold text-gray-900 mb-2">
                {getFullName(usuario)}
              </h2>
              <p className="text-gray-500 text-[14px] md:text-[15px] max-w-3xl font-medium">
                {usuario.biografia || 'Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/perfil')}
              className="bg-[#1F4E79] text-white px-6 py-2 rounded-full text-[14px] font-bold shadow-md hover:bg-opacity-90 active:scale-95 transition whitespace-nowrap w-full md:w-auto"
            >
              Editar Perfil
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6 text-[13px] md:text-[14px] text-gray-500 font-medium justify-center md:justify-start">
            <span className="flex items-center gap-2"><Mail size={18} /> <span className="break-all">{usuario.email}</span></span>
            <span className="flex items-center gap-2"><MapPin size={18} /> {usuario.ciudad || 'Cochabamba'}</span>
            <span className="flex items-center gap-2"><GraduationCap size={20} /> {usuario.institucion || 'UMSS'}</span>
          </div>

          <div className="bg-white rounded-[20px] md:rounded-full px-4 sm:px-10 py-3 sm:py-[10px] flex flex-col sm:flex-row justify-between sm:justify-start sm:gap-24 items-center text-[14px] md:text-[15px] shadow-sm mb-6 md:mb-8 border border-gray-100 gap-4">
            <button onClick={() => navigate('/mis-proyectos')} className="text-gray-500 font-semibold hover:text-gray-800 transition w-full sm:w-auto">
              Proyectos
            </button>
            <button onClick={() => navigate('/habilidades')} className="text-gray-500 font-semibold hover:text-gray-800 transition w-full sm:w-auto">
              Habilidades
            </button>
            <button className="text-blue-900 font-bold border-b-2 border-blue-900 w-full sm:w-auto">
              Enlaces
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between md:justify-end gap-4 md:gap-5 mb-5 items-stretch sm:items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1F4E79] text-white px-6 py-2 rounded-full text-[14px] font-bold shadow-md hover:bg-opacity-90 active:scale-95 transition w-full sm:w-auto"
            >
              + Añadir Enlace
            </button>

            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border rounded-full pl-4 pr-9 py-2 text-[14px] text-gray-500 font-semibold cursor-pointer appearance-none outline-none"
              >
                <option>más recientes</option>
                <option>más antiguas</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-gray-400 font-medium tracking-wide">
              Cargando enlaces...
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium tracking-wide">
              No hay enlaces añadidos aún.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedLinks.map((l) => (
                <div key={l.id_redes_prof} className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5 text-[#1F4E79] font-bold">
                      <Globe size={20} />
                      <span>{getNetworkLabel(l.nombre_red)}</span>
                    </div>

                    <button
                      onClick={() => confirmDelete(l.id_redes_prof)}
                      disabled={deletingId === l.id_redes_prof}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition disabled:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <a
                    href={l.url_red}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-[14px] truncate block w-full"
                  >
                    {l.url_red}
                  </a>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-6 md:p-10 relative animate-in fade-in zoom-in duration-200 my-auto pb-20 md:pb-24">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h2 className="text-[20px] md:text-[22px] font-bold text-gray-900 font-inter uppercase tracking-tight">
                Añadir Red
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  Plataforma
                </label>
                <div className="relative">
                  <select
                    value={nombreRed}
                    onChange={(e) => setNombreRed(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-black border rounded-[14px] focus:ring-2 focus:ring-[#1F4E79] outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Selecciona una opción</option>
                    {NETWORK_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  URL
                </label>
                <input
                  ref={urlInputRef}
                  required
                  value={nuevaUrl}
                  onFocus={(e) => (e.target.scrollLeft = 0)}
                  onBlur={(e) => (e.target.scrollLeft = 0)}
                  onChange={(e) => setNuevaUrl(e.target.value)}
                  placeholder="linkedin.com/in/usuario"
                  className="w-full px-4 py-3 bg-white text-black border rounded-[14px] focus:ring-2 focus:ring-[#1F4E79] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  disabled={saving}
                  className="px-4 md:px-6 py-2 bg-[#E5E7EB] text-gray-600 font-bold rounded-[14px] hover:bg-gray-300 transition w-full md:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 md:px-6 py-2 bg-[#1F4E79] text-white font-bold rounded-[14px] shadow-lg active:scale-95 transition hover:opacity-90 disabled:opacity-60 w-full md:w-auto"
                >
                  {saving ? 'Guardando...' : 'Guardar Enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[420px] p-8 md:p-12 text-center animate-in fade-in zoom-in duration-300 my-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h3 className="text-[24px] font-extrabold text-gray-900 mb-3 uppercase tracking-tight">
              Enlace añadido
            </h3>
            <p className="text-gray-500 mb-10 font-medium leading-relaxed">
              Tú enlace se ha guardado con éxito
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full bg-[#1F4E79] text-white font-bold py-3.5 rounded-2xl shadow-lg transition active:scale-95 hover:opacity-90"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-sm w-full text-center my-auto animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-600 mb-6 border-[8px] border-red-100">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-2 font-inter uppercase tracking-tight">Eliminar Enlace</h3>
            <p className="text-gray-500 mb-8 text-[15px] font-medium">¿Estás seguro que quieres eliminar el enlace?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button disabled={deletingId !== null} onClick={executeDelete} className="w-full sm:w-auto px-6 py-2.5 bg-[#1F4E79] text-white font-bold rounded-xl shadow-md hover:bg-opacity-90 active:scale-95 transition disabled:opacity-60">Aceptar</button>
              <button disabled={deletingId !== null} onClick={() => setShowDeleteConfirm(null)} className="w-full sm:w-auto px-6 py-2.5 bg-[#E5E7EB] hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition disabled:opacity-60">Denegar</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-sm w-full text-center my-auto animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-600 mb-6 border-[8px] border-red-100">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-2 font-inter uppercase tracking-tight">Enlace Eliminado</h3>
            <p className="text-gray-500 mb-8 text-[15px] font-medium">Tu enlace se eliminó con éxito</p>
            <div className="flex justify-center">
              <button onClick={() => setShowDeleteSuccess(false)} className="px-10 py-2.5 bg-[#1748DF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition">Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}