import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Settings,
  Mail,
  MapPin,
  GraduationCap,
  ChevronDown,
  Trash2,
  LogOut
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

const getShortName = (u: Usuario) =>
  [u.nombre, u.apellido_paterno].filter(Boolean).join(' ');

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000';

const habilidadesPorCategoria: Record<string, string[]> = {
  'Lenguajes de Programación': [
    'Java',
    'Python',
    'JavaScript',
    'TypeScript',
    'C',
    'C++',
    'C#',
    'PHP',
    'Go',
    'Ruby',
    'Swift',
    'Kotlin',
    'SQL',
    'R',
    'Rust'
  ],
  'Desarrollo Web Frontend': [
    'HTML5',
    'CSS3',
    'JavaScript',
    'TypeScript',
    'React',
    'Vue.js',
    'Angular',
    'Next.js',
    'Bootstrap',
    'Tailwind CSS',
    'SASS',
    'jQuery'
  ],
  'Desarrollo Web Backend': [
    'Node.js',
    'Express.js',
    'Laravel',
    'PHP',
    'Django',
    'Flask',
    'Spring Boot',
    'Java EE',
    'ASP.NET Core',
    'NestJS',
    'Ruby on Rails',
    'FastAPI'
  ],
  'Desarrollo Móvil': [
    'Android Studio',
    'Java Android',
    'Kotlin',
    'Swift',
    'Flutter',
    'React Native',
    'Ionic',
    'Xamarin'
  ],
  'Bases de Datos': [
    'MySQL',
    'PostgreSQL',
    'SQL Server',
    'Oracle Database',
    'MongoDB',
    'Firebase Firestore',
    'MariaDB',
    'SQLite',
    'Redis',
    'Cassandra'
  ],
  'Frameworks y Librerías': [
    'React',
    'Vue.js',
    'Angular',
    'Laravel',
    'Django',
    'Spring Boot',
    'Express.js',
    'Bootstrap',
    'Tailwind CSS',
    'TensorFlow',
    'PyTorch',
    'jQuery'
  ],
  'DevOps / Infraestructura': [
    'Docker',
    'Kubernetes',
    'Jenkins',
    'GitHub Actions',
    'GitLab CI/CD',
    'Ansible',
    'Terraform',
    'Nginx',
    'Apache',
    'Linux Server'
  ],
  'Cloud Computing': [
    'AWS',
    'Microsoft Azure',
    'Google Cloud Platform',
    'Firebase',
    'DigitalOcean',
    'Heroku',
    'Vercel',
    'Netlify'
  ],
  'Seguridad Informática': [
    'OWASP',
    'Pentesting',
    'Ethical Hacking',
    'Burp Suite',
    'Wireshark',
    'Kali Linux',
    'Firewall',
    'Criptografía',
    'Autenticación JWT',
    'Ciberseguridad Web'
  ],
  'Inteligencia Artificial / Data Science': [
    'Python',
    'Pandas',
    'NumPy',
    'Scikit-learn',
    'TensorFlow',
    'PyTorch',
    'Power BI',
    'Tableau',
    'Machine Learning',
    'Deep Learning',
    'Data Mining',
    'Análisis de Datos'
  ],
  'Testing / QA': [
    'Postman',
    'Selenium',
    'Cypress',
    'JUnit',
    'PyTest',
    'Testing Manual',
    'Testing Automatizado',
    'Pruebas Unitarias',
    'Pruebas Funcionales',
    'QA Analyst'
  ],
  'Herramientas de Diseño': [
    'Figma',
    'Adobe XD',
    'Photoshop',
    'Illustrator',
    'Canva',
    'UI Design',
    'UX Design',
    'Wireframing',
    'Prototyping',
    'Diseño Responsive'
  ]
};

const habilidadesBlandas = [
  'Trabajo en equipo',
  'Liderazgo',
  'Comunicación',
  'Resolución de problemas',
  'Adaptabilidad',
  'Pensamiento crítico',
  'Gestión del tiempo',
  'Creatividad',
  'Inteligencia emocional',
  'Proactividad'
];

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [sortBy, setSortBy] = useState('más recientes');

  const [tipoHabilidad, setTipoHabilidad] = useState<'Dura' | 'Blanda'>('Dura');
  const [categoria, setCategoria] = useState('');
  const [nombreDura, setNombreDura] = useState('');
  const [nombreBlanda, setNombreBlanda] = useState('');
  const [nivel, setNivel] = useState(80);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setNombreDura('');
  }, [categoria]);

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

    let catCache: Record<string, string> = {};
    try {
      catCache = JSON.parse(localStorage.getItem('skillCategories') || '{}');
    } catch {
      catCache = {};
    }

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
      const result: Skill[] = [];

      Object.entries(data).forEach(([tipo, categorias]) => {
        if (categorias && typeof categorias === 'object') {
          Object.entries(categorias as Record<string, any[]>).forEach(
            ([categoria, habilidades]) => {
              if (Array.isArray(habilidades)) {
                habilidades.forEach((habilidad) => {
                  result.push(
                    normalizeSkill({
                      ...habilidad,
                      tipo,
                      categoria
                    })
                  );
                });
              }
            }
          );
        }
      });

      return result;
    }

    return [];
  };

  const saveSkillCategoriesInCache = (skillsToSave: Skill[]) => {
    const catCache = skillsToSave.reduce((acc: Record<string, string>, skill) => {
      if (skill.categoria) {
        acc[skill.id_habilidad] = skill.categoria;
        acc[skill.nombre.toLowerCase()] = skill.categoria;
      }
      return acc;
    }, {});

    localStorage.setItem('skillCategories', JSON.stringify(catCache));
  };

  const fetchSkills = async () => {
    if (!token) {
      navigate('/login');
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
      saveSkillCategoriesInCache(finalSkills);
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
    setCategoria('');
    setNombreDura('');
    setNivel(80);
    setNombreBlanda('');
    setVisible(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      navigate('/login');
      return;
    }

    const nombre =
      tipoHabilidad === 'Dura' ? nombreDura.trim() : nombreBlanda.trim();

    if (!nombre) {
      alert('Completa el nombre de la habilidad.');
      return;
    }

    if (tipoHabilidad === 'Dura' && !categoria.trim()) {
      alert('Selecciona una categoría.');
      return;
    }

    const payload = {
      nombre,
      tipo: tipoHabilidad === 'Dura' ? 'tecnica' : 'blanda',
      nivel: tipoHabilidad === 'Dura' ? nivel : 100,
      visible,
      categoria: tipoHabilidad === 'Dura' ? categoria : 'Habilidades Blandas'
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

      if (tipoHabilidad === 'Dura') {
        savedSkill.categoria = categoria;
      } else {
        savedSkill.categoria = 'Habilidades Blandas';
      }

      const updatedSkills = [savedSkill, ...skills];
      setSkills(updatedSkills);
      localStorage.setItem('cachedSkills', JSON.stringify(updatedSkills));
      saveSkillCategoriesInCache(updatedSkills);

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

  const confirmDelete = (id_habilidad: string) => {
    setShowDeleteConfirm(id_habilidad);
  };

  const executeDelete = async () => {
    if (!showDeleteConfirm || !token) {
      if (!token) navigate('/login');
      return;
    }

    setDeletingId(showDeleteConfirm);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/habilidad/${showDeleteConfirm}`, {
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
        const newSkills = prev.filter((s) => s.id_habilidad !== showDeleteConfirm);
        localStorage.setItem('cachedSkills', JSON.stringify(newSkills));
        saveSkillCategoriesInCache(newSkills);
        return newSkills;
      });

      setShowDeleteConfirm(null);
      setShowDeleteSuccess(true);
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
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 w-full sm:w-auto"
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
          <span className="text-app-text font-semibold">Habilidades</span>
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
            {usuario.profesion || 'Ingeniera de Software'}
          </p>

          <div className="w-full">
            <button
              onClick={() => navigate('/')}
              className="flex items-center w-full pl-8 md:pl-[50px] py-3 hover:bg-white/10 transition"
            >
              <Home className="w-6 h-6 md:w-7 md:h-7 mr-4" /> Inicio
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
            <span className="flex items-center gap-2">
              <Mail size={18} /> <span className="break-all">{usuario.email}</span>
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={18} /> {usuario.ciudad || 'Cochabamba'}
            </span>
            <span className="flex items-center gap-2">
              <GraduationCap size={20} /> {usuario.institucion || 'UMSS'}
            </span>
          </div>

          <div className="bg-white rounded-[20px] md:rounded-full px-4 sm:px-10 py-3 sm:py-[10px] flex flex-col sm:flex-row justify-between sm:justify-start sm:gap-24 items-center text-[14px] md:text-[15px] shadow-sm mb-6 md:mb-8 border border-gray-100 gap-4">
            <button
              onClick={() => navigate('/mis-proyectos')}
              className="text-gray-500 font-semibold hover:text-gray-800 transition w-full sm:w-auto"
            >
              Proyectos
            </button>
            <button className="text-blue-900 font-bold border-b-2 border-blue-900 w-full sm:w-auto">
              Habilidades
            </button>
            <button
              onClick={() => navigate('/enlaces')}
              className="text-gray-500 font-semibold hover:text-gray-800 transition w-full sm:w-auto"
            >
              Enlaces
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between md:justify-end gap-4 md:gap-5 mb-5 items-stretch sm:items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1F4E79] text-white px-6 py-2 rounded-full text-[14px] font-bold shadow-md hover:bg-opacity-90 active:scale-95 transition w-full sm:w-auto"
            >
              + Añadir Habilidad
            </button>

            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border rounded-full pl-4 pr-9 py-2 text-[14px] text-gray-500 font-semibold cursor-pointer appearance-none outline-none w-full sm:w-auto"
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
                          onClick={() => confirmDelete(skill.id_habilidad)}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-6 md:p-10 pb-20 md:pb-24 relative animate-in fade-in zoom-in duration-200 mt-10 mb-auto md:my-auto">
            <div className="flex justify-between items-center mb-6 md:mb-8 font-inter uppercase tracking-tight">
              <h2 className="text-[20px] md:text-[22px] font-bold text-gray-900">
                Añadir Habilidad
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  Tipo de habilidad
                </label>
                <div className="relative">
                  <select
                    value={tipoHabilidad}
                    onChange={(e) => {
                      setTipoHabilidad(e.target.value as 'Dura' | 'Blanda');
                      setCategoria('');
                      setNombreDura('');
                      setNombreBlanda('');
                    }}
                    className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none cursor-pointer appearance-none transition-colors"
                  >
                    <option value="Dura">Habilidad dura</option>
                    <option value="Blanda">Habilidad blanda</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {tipoHabilidad === 'Dura' && (
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2">
                    Categoría
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Selecciona categoría</option>
                      {Object.keys(habilidadesPorCategoria).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">
                  Nombre de la habilidad {tipoHabilidad === 'Dura' ? 'dura' : 'blanda'}
                </label>

                {tipoHabilidad === 'Dura' ? (
                  <div className="relative">
                    <select
                      required
                      value={nombreDura}
                      onChange={(e) => setNombreDura(e.target.value)}
                      disabled={!categoria}
                      className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Selecciona una habilidad</option>
                      {categoria &&
                        habilidadesPorCategoria[categoria]?.map((hab) => (
                          <option key={hab} value={hab}>
                            {hab}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      required
                      value={nombreBlanda}
                      onChange={(e) => setNombreBlanda(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-black border rounded-[14px] outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Selecciona una opción</option>
                      {habilidadesBlandas.map((habilidad) => (
                        <option key={habilidad} value={habilidad}>
                          {habilidad}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </div>

              {tipoHabilidad === 'Dura' && (
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

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 md:px-6 py-2 bg-[#E5E7EB] text-gray-600 font-bold rounded-[14px] hover:bg-gray-300 transition w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 md:px-6 py-2 bg-[#1F4E79] text-white font-bold rounded-[14px] shadow-lg active:scale-95 transition hover:opacity-90 disabled:opacity-60 w-full sm:w-auto"
                >
                  {saving ? 'Guardando...' : 'Guardar Habilidad'}
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-sm w-full text-center my-auto animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-600 mb-6 border-[8px] border-red-100">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-[20px] font-bold text-gray-900 mb-2 font-inter uppercase tracking-tight">Eliminar Habilidad</h3>
            <p className="text-gray-500 mb-8 text-[15px] font-medium">¿Estás seguro que quieres eliminar la habilidad?</p>
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
            <h3 className="text-[20px] font-bold text-gray-900 mb-2 font-inter uppercase tracking-tight">Habilidad Eliminada</h3>
            <p className="text-gray-500 mb-8 text-[15px] font-medium">Tu habilidad se eliminó con éxito</p>
            <div className="flex justify-center">
              <button onClick={() => setShowDeleteSuccess(false)} className="px-10 py-2.5 bg-[#1748DF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition">Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}