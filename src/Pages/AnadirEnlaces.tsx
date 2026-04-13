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
  ChevronDown
} from 'lucide-react';

interface LinkItem {
  id_redes_prof: string;
  id_usuario: string;
  nombre_red: 'linkedin' | 'github' | 'twitter' | 'behance' | 'otro';
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

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000';

const NETWORK_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'behance', label: 'Behance' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'otro', label: 'Otro' }
] as const;

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
  const [sortBy, setSortBy] = useState('más recientes');

  const [nombreRed, setNombreRed] = useState<LinkItem['nombre_red']>('linkedin');
  const [nombreRedOtro, setNombreRedOtro] = useState('');
  const [nuevaUrl, setNuevaUrl] = useState('');

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
    id_usuario: String(item?.id_usuario ?? ''),
    nombre_red: (item?.nombre_red ?? 'otro') as LinkItem['nombre_red'],
    url_red: String(item?.url_red ?? ''),
    created_at: item?.created_at,
    updated_at: item?.updated_at
  });

  const getNetworkLabel = (value: string) => {
    return NETWORK_OPTIONS.find((opt) => opt.value === value)?.label || value;
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
      const normalized = url.startsWith('http://') || url.startsWith('https://')
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
    setNombreRed('linkedin');
    setNombreRedOtro('');
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

    const finalNombreRed = nombreRed === 'otro' ? nombreRedOtro.trim() : nombreRed;

    if (!finalNombreRed || !nuevaUrl.trim()) {
      alert('Completa todos los campos.');
      return;
    }

    if (!isValidUrl(nuevaUrl)) {
      alert('URL no válida.');
      return;
    }

    const payload = {
      id_usuario: idUsuario,
      nombre_red: finalNombreRed,
      url_red: normalizeUrlBeforeSend(nuevaUrl)
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

  const handleDelete = async (id_redes_prof: string) => {
    if (!token) {
      navigate('/signin');
      return;
    }

    if (!window.confirm('¿Eliminar?')) return;

    setDeletingId(id_redes_prof);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/redes-profesionales/${id_redes_prof}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo eliminar el enlace.');
      }

      setLinks((prev) => {
        const newLinks = prev.filter((l) => l.id_redes_prof !== id_redes_prof);
        localStorage.setItem('cachedLinks', JSON.stringify(newLinks));
        return newLinks;
      });
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
      <header className="bg-[#2E3A4D] text-white py-[6px] px-8 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-[34px] h-[42px]" />
          <h1 className="text-[32px] font-bold">Sistema de Portafolios Digitales</h1>
        </div>
      </header>

      <nav className="bg-[#1D4A76] text-white py-[14px] px-8 flex items-center border-t border-white/5 shrink-0">
        <div className="w-64" />
        <div className="flex-1 flex justify-center gap-20 text-[18px] font-semibold">
          <span onClick={() => navigate('/')} className="cursor-pointer opacity-80 hover:opacity-100 transition">
            Inicio
          </span>
          <span onClick={() => navigate('/perfil')} className="cursor-pointer opacity-80 hover:opacity-100 transition">
            Mi perfil
          </span>
          <span onClick={() => navigate('/mis-proyectos')} className="cursor-pointer hover:opacity-100 transition">
            Mis proyectos
          </span>
        </div>
      </nav>

      <div className="bg-[#2E3A4D] text-gray-200 py-2.5 px-8 text-[14px] flex gap-3 shadow-md border-b border-black/10 shrink-0">
        <span className="hover:underline cursor-pointer">Navegación</span> &gt;
        <span className="hover:underline cursor-pointer" onClick={() => navigate('/perfil')}>
          Mi perfil
        </span> &gt;
        <span className="font-semibold text-white uppercase">Enlaces</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[280px] bg-[#1D4A76] text-white flex flex-col items-center py-12 shadow-inner shrink-0">
          <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-white/5 mb-6 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-white/10" />
          </div>

          <h2 className="text-[20px] font-bold text-center px-4">
            {getFullName(usuario)}
          </h2>
          <p className="text-[15px] text-blue-100 font-medium mb-12 opacity-80">
            {usuario.profesion}
          </p>

          <div className="w-full">
            <button onClick={() => navigate('/')} className="flex items-center w-full pl-[50px] py-3 hover:bg-white/10 transition">
              <Home className="w-7 h-7 mr-4" /> Inicio
            </button>
            <button className="flex items-center w-full pl-[50px] py-3 hover:bg-white/10 transition">
              <Settings className="w-7 h-7 mr-4" /> Ajustes
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 px-12 overflow-y-auto">
          <div className="flex justify-between items-start mb-6 text-black">
            <div>
              <h2 className="text-[26px] font-bold text-gray-900 mb-2">
                {getFullName(usuario)}
              </h2>
              <p className="text-gray-500 text-[15px] max-w-3xl font-medium">
                {usuario.biografia || 'Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/perfil')}
              className="bg-[#1F4E79] text-white px-6 py-2 rounded-full text-[14px] font-bold shadow-md hover:bg-opacity-90 active:scale-95 transition"
            >
              Editar Perfil
            </button>
          </div>

          <div className="flex gap-8 mb-6 text-[14px] text-gray-500 font-medium flex-wrap">
            <span className="flex items-center gap-2"><Mail size={18} /> {usuario.email}</span>
            <span className="flex items-center gap-2"><MapPin size={18} /> {usuario.ciudad || 'Cochabamba'}</span>
            <span className="flex items-center gap-2"><GraduationCap size={20} /> {usuario.institucion || 'UMSS'}</span>
          </div>

          <div className="bg-white rounded-full px-10 py-[10px] flex gap-24 items-center text-[15px] shadow-sm mb-6 border border-gray-100">
            <button onClick={() => navigate('/mis-proyectos')} className="text-gray-500 font-semibold hover:text-gray-800 transition">
              Proyectos
            </button>
            <button onClick={() => navigate('/habilidades')} className="text-gray-500 font-semibold hover:text-gray-800 transition">
              Habilidades
            </button>
            <button className="text-blue-900 font-bold border-b-2 border-blue-900">
              Enlaces
            </button>
          </div>

          <div className="flex justify-end gap-5 mb-5 items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1F4E79] text-white px-5 py-2 rounded-[14px] font-bold shadow-md hover:opacity-90 transition"
            >
              + Añadir Enlace
            </button>

            <div className="relative">
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
            <div className="text-center py-20 text-gray-400 font-medium text-black">
              Cargando enlaces...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20">
              {sortedLinks.map((l) => (
                <div key={l.id_redes_prof} className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5 text-[#1F4E79] font-bold">
                      <Globe size={20} />
                      <span>{getNetworkLabel(l.nombre_red)}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(l.id_redes_prof)}
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

              {links.length === 0 && (
                <div className="col-span-2 text-center py-20 text-gray-400 font-medium text-black">
                  No hay enlaces añadidos aún.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-10 m-4 relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-[22px] font-bold text-gray-900 mb-8">Añadir Enlace</h2>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  Plataforma
                </label>
                <div className="relative">
                  <select
                    value={nombreRed}
                    onChange={(e) => setNombreRed(e.target.value as LinkItem['nombre_red'])}
                    className="w-full px-4 py-3 bg-white text-black border rounded-[14px] focus:ring-2 focus:ring-[#1F4E79] outline-none appearance-none cursor-pointer"
                  >
                    {NETWORK_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>

              {nombreRed === 'otro' && (
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2">
                    Nombre de la Plataforma
                  </label>
                  <input
                    required
                    value={nombreRedOtro}
                    onChange={(e) => setNombreRedOtro(e.target.value)}
                    placeholder="Ej. Mi Blog, Portfolio..."
                    className="w-full px-4 py-3 bg-white text-black border rounded-[14px] focus:ring-2 focus:ring-[#1F4E79] outline-none"
                  />
                </div>
              )}

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

              <div className="flex justify-end gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-6 py-2 bg-[#E5E7EB] text-gray-600 font-bold rounded-[14px] hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#1F4E79] text-white font-bold rounded-[14px] shadow-lg transition active:scale-95 hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar Enlace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[420px] p-12 m-4 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h3 className="text-[24px] font-extrabold text-gray-900 mb-3">
              Enlace añadido con éxito
            </h3>
            <p className="text-gray-500 text-[16px] font-medium mb-10 leading-relaxed">
              Su nuevo enlace se ha añadido con éxito
            </p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full bg-[#1F4E79] hover:opacity-90 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}