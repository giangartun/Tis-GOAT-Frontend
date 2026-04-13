import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Settings,
  Mail,
  MapPin,
  GraduationCap,
  ChevronDown,
  Trash2
} from 'lucide-react';

type SkillTypeApi = 'tecnica' | 'blanda';

interface Skill {
  id_habilidad: string;
  nombre: string;
  tipo: SkillTypeApi;
  nivel: number;
  visible: boolean;
  categoria?: string | null;
}

interface Usuario {
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

export default function AnadirHabilidades() {
  const navigate = useNavigate();

  const [usuario] = useState<Usuario>(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      return {};
    }
  });

  const token = localStorage.getItem('token');

  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cachedSkills') || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(skills.length === 0);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('más recientes');

  const [tipoHabilidad, setTipoHabilidad] = useState<'Dura' | 'Blanda'>('Dura');
  const [nombreDura, setNombreDura] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categoriaOtro, setCategoriaOtro] = useState('');
  const [nivel, setNivel] = useState(80);
  const [nombreBlanda, setNombreBlanda] = useState('');
  const [nombreBlandaOtro, setNombreBlandaOtro] = useState('');
  const [visible, setVisible] = useState(true);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }),
    [token]
  );

  const normalizeSkill = (item: any): Skill => {
    const id = String(item?.id_habilidad ?? '');
    const nombre = String(item?.nombre ?? '');
    const catCache = JSON.parse(localStorage.getItem('skillCategories') || '{}');
    const locallySaved = catCache[id] || catCache[nombre.toLowerCase()];

    return {
      id_habilidad: id,
      nombre,
      tipo: item?.tipo === 'blanda' ? 'blanda' : 'tecnica',
      nivel: Number(item?.nivel ?? 0),
      visible:
        item?.visible === true ||
        item?.visible === 1 ||
        item?.visible === '1',
      categoria: item?.categoria ?? locallySaved ?? null
    };
  };

  const flattenGroupedSkills = (data: any): Skill[] => {
    if (Array.isArray(data)) {
      return data.map(normalizeSkill);
    }

    if (data && typeof data === 'object') {
      const tecnica = Array.isArray(data.tecnica) ? data.tecnica : [];
      const blanda = Array.isArray(data.blanda) ? data.blanda : [];
      return [...tecnica, ...blanda].map(normalizeSkill);
    }

    return [];
  };

  const fetchSkills = async () => {
    if (!token) {
      navigate('/signin');
      return;
    }

    if (skills.length === 0) setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/habilidad`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudieron cargar las habilidades.');
      }

      const finalSkills = flattenGroupedSkills(data);
      setSkills(finalSkills);
      localStorage.setItem('cachedSkills', JSON.stringify(finalSkills));
    } catch (err: any) {
      console.error('Error fetching skills:', err);
      setError(err?.message || 'Ocurrió un error al cargar las habilidades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const resetForm = () => {
    setTipoHabilidad('Dura');
    setNombreDura('');
    setCategoria('');
    setCategoriaOtro('');
    setNivel(80);
    setNombreBlanda('');
    setNombreBlandaOtro('');
    setVisible(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      navigate('/signin');
      return;
    }

    const finalNombreBlanda = nombreBlanda === 'Otro' ? nombreBlandaOtro.trim() : nombreBlanda;
    const finalCategoria = categoria === 'Otro' ? categoriaOtro.trim() : categoria;

    const nombre =
      tipoHabilidad === 'Dura' ? nombreDura.trim() : finalNombreBlanda.trim();

    if (!nombre) {
      alert('Completa el nombre de la habilidad.');
      return;
    }

    if (tipoHabilidad === 'Dura' && !finalCategoria.trim()) {
      alert('Selecciona una categoría.');
      return;
    }

    const payload = {
      nombre,
      tipo: tipoHabilidad === 'Dura' ? 'tecnica' : 'blanda',
      nivel: tipoHabilidad === 'Dura' ? nivel : 100,
      visible,
      categoria: tipoHabilidad === 'Dura' ? finalCategoria : null
    };

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/habilidad`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo guardar la habilidad.');
      }

      const savedSkill = normalizeSkill(data?.habilidad ?? data);

      // categoria no se guarda en tu backend actual, así que la mantenemos en localStorage
      if (tipoHabilidad === 'Dura') {
        savedSkill.categoria = finalCategoria;
        const catCache = JSON.parse(localStorage.getItem('skillCategories') || '{}');
        catCache[savedSkill.id_habilidad] = finalCategoria;
        catCache[savedSkill.nombre.toLowerCase()] = finalCategoria;
        localStorage.setItem('skillCategories', JSON.stringify(catCache));
      } else {
        savedSkill.categoria = 'Habilidades Blandas';
      }

      setSkills((prev) => [savedSkill, ...prev]);
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      resetForm();
    } catch (err: any) {
      console.error('Error saving skill:', err);
      setError(err?.message || 'Ocurrió un error al guardar la habilidad.');
      alert(err?.message || 'Ocurrió un error al guardar la habilidad.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id_habilidad: string) => {
    if (!token) {
      navigate('/signin');
      return;
    }

    if (!window.confirm('¿Eliminar habilidad?')) return;

    setDeletingId(id_habilidad);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/habilidad/${id_habilidad}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo eliminar la habilidad.');
      }

      setSkills((prev) => {
        const newSkills = prev.filter((s) => s.id_habilidad !== id_habilidad);
        localStorage.setItem('cachedSkills', JSON.stringify(newSkills));
        return newSkills;
      });
    } catch (err: any) {
      console.error('Error deleting skill:', err);
      setError(err?.message || 'Ocurrió un error al eliminar la habilidad.');
      alert(err?.message || 'Ocurrió un error al eliminar la habilidad.');
    } finally {
      setDeletingId(null);
    }
  };

  const sortedSkills = [...skills].sort((a, b) => {
    if (sortBy === 'más recientes') return b.id_habilidad.localeCompare(a.id_habilidad);
    return a.id_habilidad.localeCompare(b.id_habilidad);
  });

  const grouped = sortedSkills.reduce((acc, s) => {
    let key = 'Otras';

    if (s.tipo === 'blanda') {
      key = 'Habilidades Blandas';
    } else {
      key = s.categoria || 'Habilidades Técnicas';
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, Skill[]>);

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
        <span className="font-semibold text-white uppercase">Habilidades</span>
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
            {usuario.profesion || 'Ingeniera de Software'}
          </p>

          <div className="w-full">
            <button
              onClick={() => navigate('/')}
              className="flex items-center w-full pl-[50px] py-3 hover:bg-white/10 transition"
            >
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
            <span className="flex items-center gap-2">
              <Mail size={18} /> {usuario.email}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={18} /> {usuario.ciudad || 'Cochabamba'}
            </span>
            <span className="flex items-center gap-2">
              <GraduationCap size={20} /> {usuario.institucion || 'UMSS'}
            </span>
          </div>

          <div className="bg-white rounded-full px-10 py-[10px] flex gap-24 items-center text-[15px] shadow-sm mb-6 border border-gray-100">
            <button
              onClick={() => navigate('/mis-proyectos')}
              className="text-gray-500 font-semibold hover:text-gray-800 transition"
            >
              Proyectos
            </button>
            <button className="text-blue-900 font-bold border-b-2 border-blue-900">
              Habilidades
            </button>
            <button
              onClick={() => navigate('/enlaces')}
              className="text-gray-500 font-semibold hover:text-gray-800 transition"
            >
              Enlaces
            </button>
          </div>

          <div className="flex justify-end gap-5 mb-5 items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1F4E79] text-white px-5 py-2 rounded-[14px] font-bold shadow-md transition hover:bg-opacity-90 active:scale-95"
            >
              + Añadir Habilidad
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
            <div className="text-center py-20 text-gray-400 font-medium tracking-wide">
              Cargando habilidades...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {Object.entries(grouped).map(([categoryLabel, skillList]) => (
                <div
                  key={categoryLabel}
                  className="bg-white border border-gray-100 rounded-[16px] p-7 shadow-sm"
                >
                  <h3 className="text-[17px] font-bold text-gray-900 mb-6">
                    {categoryLabel}
                  </h3>

                  {skillList.map((skill) => (
                    <div key={skill.id_habilidad} className="mb-5 relative group">
                      <div className="flex justify-between items-center text-[14px] mb-2 pr-8">
                        <span className="font-bold text-gray-800">{skill.nombre}</span>

                        {skill.tipo === 'tecnica' && (
                          <span className="font-medium text-gray-500">
                            {skill.nivel}%
                          </span>
                        )}

                        <button
                          onClick={() => handleDelete(skill.id_habilidad)}
                          disabled={deletingId === skill.id_habilidad}
                          className="absolute right-0 top-0 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition disabled:opacity-100"
                          title="Eliminar habilidad"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {skill.tipo === 'tecnica' ? (
                        <div className="h-[10px] bg-gray-100 rounded-full overflow-hidden leading-[10px]">
                          <div
                            className="h-full bg-orange-200 rounded-full transition-all duration-500"
                            style={{ width: `${skill.nivel}%` }}
                          />
                        </div>
                      ) : (
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold">
                          Blanda
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {skills.length === 0 && (
                <div className="col-span-2 text-center py-20 text-gray-400 font-medium tracking-wide">
                  No hay habilidades añadidas aún.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-10 m-4 relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[95vh]">
            <h2 className="text-[22px] font-bold text-gray-900 mb-8 font-inter uppercase tracking-tight">
              Añadir Habilidad
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  Tipo de habilidad
                </label>
                <div className="relative">
                  <select
                    value={tipoHabilidad}
                    onChange={(e) => setTipoHabilidad(e.target.value as 'Dura' | 'Blanda')}
                    className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none cursor-pointer appearance-none transition-colors"
                  >
                    <option value="Dura">Habilidad dura</option>
                    <option value="Blanda">Habilidad blanda</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  Nombre de la habilidad {tipoHabilidad === 'Dura' ? 'dura' : ''}
                </label>

                {tipoHabilidad === 'Dura' ? (
                  <input
                    required
                    value={nombreDura}
                    onChange={(e) => setNombreDura(e.target.value)}
                    placeholder="Ej: React, Python"
                    className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none transition-all"
                  />
                ) : (
                  <>
                    <div className="relative">
                      <select
                        value={nombreBlanda}
                        onChange={(e) => setNombreBlanda(e.target.value)}
                        className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Selecciona una opción</option>
                        <option>Trabajo en equipo</option>
                        <option>Liderazgo</option>
                        <option>Comunicación</option>
                        <option>Resolución de problemas</option>
                        <option>Adaptabilidad</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {nombreBlanda === 'Otro' && (
                      <div className="mt-4">
                        <label className="block text-[14px] font-bold text-gray-700 mb-2">
                          Escribe la habilidad blanda
                        </label>
                        <input
                          required
                          value={nombreBlandaOtro}
                          onChange={(e) => setNombreBlandaOtro(e.target.value)}
                          placeholder="Ej. Creatividad..."
                          className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none transition-all"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {tipoHabilidad === 'Dura' && (
                <>
                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 mb-2">
                      Categoría
                    </label>
                    <div className="relative">
                      <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Selecciona categoría</option>
                        <option>Lenguajes de programación</option>
                        <option>Base de Datos</option>
                        <option>Frameworks y Librerías</option>
                        <option>DevOps</option>
                        <option>Testing</option>
                        <option>Diseño</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {categoria === 'Otro' && (
                      <div className="mt-4">
                        <label className="block text-[14px] font-bold text-gray-700 mb-2">
                          Escribe la nueva categoría
                        </label>
                        <input
                          required
                          value={categoriaOtro}
                          onChange={(e) => setCategoriaOtro(e.target.value)}
                          placeholder="Ej. Metodologías Ágiles..."
                          className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[14px] font-bold text-gray-700">Nivel</label>
                      <span className="text-[14px] font-bold text-gray-700">{nivel}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={nivel}
                      onChange={(e) => setNivel(parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-50 rounded-full cursor-pointer accent-[#1F4E79]"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between mt-2">
                <div>
                  <label className="block text-[15px] font-bold text-gray-900">Visible</label>
                  <p className="text-[13px] text-gray-400 font-medium tracking-tight">
                    Mostrar en el perfil
                  </p>
                </div>

                <div
                  onClick={() => setVisible(!visible)}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition ${
                    visible ? 'bg-[#1F4E79]' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      visible ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
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
                  className="px-6 py-2 bg-[#1F4E79] text-white font-bold rounded-[14px] shadow-lg active:scale-95 transition hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar Habilidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[420px] p-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h3 className="text-[24px] font-extrabold text-gray-900 mb-3 uppercase tracking-tight">
              Habilidad añadida
            </h3>
            <p className="text-gray-500 mb-10 font-medium leading-relaxed">
              Tu nueva habilidad se ha guardado con éxito
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
    </div>
  );
}