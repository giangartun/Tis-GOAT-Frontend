import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  GraduationCap,
  Globe
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
  id?: number | string;
  id_usuario?: number | string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  profesion?: string;
  email?: string;
  ciudad?: string;
  pais?: string;
  institucion?: string;
  biografia?: string;
  portafolio?: {
    id?: number;
  };
  portafolio_id?: number;
  id_portafolio?: number;
}

const getFullName = (u: Usuario) => 
  [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' ');

interface RedProfesional {
  id_redes_prof: string;
  id_usuario: string;
  nombre_red: 'linkedin' | 'github' | 'twitter' | 'behance' | 'otro';
  url_red: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000';

const PerfilUsuario = () => {
  const navigate = useNavigate();

  const [usuario] = useState<Usuario>(() => {
    try {
      const saved = localStorage.getItem('usuario');
      const data = saved ? JSON.parse(saved) : {};
      return {
        nombre: 'Eliana',
        apellido_paterno: 'Martinez',
        profesion: 'Ingeniera de Software',
        email: 'eliana.martinez@gmail.com',
        ciudad: 'Cochabamba',
        pais: 'BO',
        institucion: 'Universidad Mayor de San Simon',
        biografia:
          'Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.',
        ...data
      };
    } catch {
      return {
        nombre: 'Eliana',
        apellido_paterno: 'Martinez',
        profesion: 'Ingeniera de Software',
        email: 'eliana.martinez@gmail.com',
        ciudad: 'Cochabamba',
        pais: 'BO',
        institucion: 'Universidad Mayor de San Simon',
        biografia:
          'Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.'
      };
    }
  });

  const token = localStorage.getItem('token');
  const userId = usuario?.id_usuario || usuario?.id;

  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cachedSkills') || '[]');
    } catch {
      return [];
    }
  });
  const [skillsLoading, setSkillsLoading] = useState(skills.length === 0);
  const [skillsError, setSkillsError] = useState('');

  const [links, setLinks] = useState<RedProfesional[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cachedLinks') || '[]');
    } catch {
      return [];
    }
  });
  const [linksError, setLinksError] = useState('');

  const experiences = [
    {
      role: 'Software Developer - Empresa X',
      period: '2023 - Actual',
      desc: 'APIs REST, Docker, microservicios'
    },
    {
      role: 'Backend Developer - Empresa Y',
      period: '2022 - 2023',
      desc: 'Optimización de base de datos'
    }
  ];

  const projects = [
    {
      title: 'Sistema de Gestión',
      desc: 'Plataforma de administración de tareas',
      repo: 'https://github.com/tuusuario/tustareas',
      demo: 'https://demo-gestionsistemas.com',
      tags: ['React', 'Node.js', 'MongoDB'],
      period: '2021 - 2022'
    },
    {
      title: 'E- Commerce App',
      desc: 'App de ventas online',
      repo: 'https://github.com/tuusuario/tuventas',
      demo: 'https://demo-usuarioventas.com',
      tags: ['Vue.js', 'Firebase', 'Stripe'],
      period: '2020 - 2021'
    }
  ];

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

  const getNetworkLabel = (nombreRed: string) => {
    switch (nombreRed) {
      case 'linkedin':
        return 'LinkedIn';
      case 'github':
        return 'GitHub';
      case 'twitter':
        return 'Twitter / X';
      case 'behance':
        return 'Behance';
      case 'otro':
        return 'Otro';
      default:
        return nombreRed;
    }
  };

  const fetchSkills = async () => {
    if (!token) {
      setSkills([]);
      setSkillsLoading(false);
      return;
    }

    if (skills.length === 0) setSkillsLoading(true);
    setSkillsError('');

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
      setSkillsError(err?.message || 'Error al cargar habilidades.');
      setSkills([]);
    } finally {
      setSkillsLoading(false);
    }
  };

  const fetchLinks = async () => {
    if (!token || !userId) return;

    try {
      setLinksError('');

      const response = await fetch(`${API_BASE}/api/redes-profesionales/${userId}`, {
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

      const normalized = rawLinks;
      setLinks(normalized);
      localStorage.setItem('cachedLinks', JSON.stringify(normalized));
    } catch (err: any) {
      console.error('Error fetching links:', err);
      setLinksError(err?.message || 'Error al cargar enlaces.');
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchLinks();
    }
  }, [userId]);

  const visibleSkills = useMemo(
    () => skills.filter((skill) => skill.visible),
    [skills]
  );

  const sortedSkills = useMemo(
    () => [...visibleSkills].sort((a, b) => b.id_habilidad.localeCompare(a.id_habilidad)),
    [visibleSkills]
  );

  const hardSkills = sortedSkills.filter((s) => s.tipo === 'tecnica');
  const softSkillsArray = sortedSkills.filter((s) => s.tipo === 'blanda');

  const groupedSkills = hardSkills.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
    const key = skill.categoria || 'Habilidades Técnicas';
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const displayLinks = links.map((l) => ({
    label: getNetworkLabel(l.nombre_red),
    icon: <Globe size={18} />,
    url: l.url_red
  }));

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-inter">
      <header className="bg-[#2E3A4D] text-white py-[10px] px-12 flex justify-between items-center shadow-sm z-30 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-[34px] h-[44px] bg-transparent" />
          <h1 className="text-[28px] font-bold tracking-tight">Sistema de Portafolios Digitales</h1>
        </div>
        <div className="flex items-center gap-12 font-semibold text-[16px]">
          <Link to="/" className="hover:text-blue-300 transition">Inicio</Link>
          <Link to="/perfil" className="hover:text-blue-300 transition underline underline-offset-4 font-bold">Mi perfil</Link>
          <Link to="/mis-proyectos" className="hover:text-blue-300 transition">Mis proyectos</Link>
        </div>
      </header>

      <div className="bg-[#2E3A4D] text-white/80 py-3 px-12 text-[13px] font-medium flex gap-3 z-30 border-t border-white/5 shadow-md">
        <span>Navegación</span> <span>&gt;</span>
        <span>Mi perfil</span> <span>&gt;</span>
        <span className="font-bold text-white uppercase tracking-wider">Perfil</span>
      </div>

      <main className="flex-1 overflow-y-auto pt-12 pb-20">
        <div className="max-w-[1240px] mx-auto flex flex-col shadow-2xl rounded-[16px] overflow-hidden">
          <div className="bg-[#1F4E79] text-white p-12 relative overflow-hidden shrink-0">
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-10">
                <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center shadow-inner">
                  <div className="w-28 h-28 rounded-full bg-white/10" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[42px] font-bold mb-1 tracking-tight">
                    {getFullName(usuario)}
                  </h2>
                  <p className="text-blue-200 text-[20px] font-medium opacity-90 mb-6 italic">
                    {usuario.profesion || 'Ingeniera de Software'}
                  </p>

                  <div className="flex flex-wrap gap-x-12 gap-y-4 text-[13px] font-medium">
                    <span className="flex items-center gap-2.5 opacity-80">
                      <Mail size={16} /> {usuario.email}
                    </span>
                    <span className="flex items-center gap-2.5 opacity-80">
                      <MapPin size={16} /> {usuario.ciudad || 'Cochabamba'}, {usuario.pais || 'BO'}
                    </span>
                    <span className="flex items-center gap-2.5 opacity-80">
                      <GraduationCap size={18} /> {usuario.institucion || 'Universidad Mayor de San Simon'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/perfil')}
                className="bg-white/10 hover:bg-white/25 text-white px-10 py-2.5 rounded-[14px] text-[14px] font-bold border border-white/20 transition-all shadow-lg active:scale-95"
              >
                Editar
              </button>
            </div>
          </div>

          <div className="bg-white p-16 flex flex-col gap-16 border-t border-white/10">
            <section className="scroll-mt-24" id="sobre-mi">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[22px] font-extrabold text-gray-800">Sobre mi</h3>
                <button className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-lg text-[12px] font-bold shadow-md hover:opacity-90 transition-all">
                  Editar
                </button>
              </div>
              <p className="text-gray-500 text-[18px] leading-relaxed max-w-5xl font-medium">
                {usuario.biografia || 'Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.'}
              </p>
            </section>

            <section className="scroll-mt-24" id="experiencia">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight">Experiencia</h3>
                <button className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-lg text-[12px] font-bold shadow-md hover:opacity-90 transition-all">
                  Editar
                </button>
              </div>
              <div className="flex flex-wrap gap-8">
                {experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="w-[340px] rounded-[14px] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-extrabold text-gray-800 text-[17px]">{exp.role}</h4>
                    <p className="text-[13px] font-bold text-gray-400 mt-1">{exp.period}</p>
                    <p className="mt-4 text-[14px] text-gray-500 leading-snug font-medium">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="scroll-mt-24" id="habilidades">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight">Habilidades</h3>
                <button
                  onClick={() => navigate('/habilidades')}
                  className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-[14px] text-[12px] font-bold shadow-md hover:opacity-90 transition-all"
                >
                  Editar
                </button>
              </div>

              {skillsError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium">
                  {skillsError}
                </div>
              )}

              {skillsLoading ? (
                <div className="text-gray-400 font-medium py-8">
                  Cargando habilidades...
                </div>
              ) : hardSkills.length === 0 ? (
                <div className="text-gray-400 font-medium py-8">
                  No hay habilidades técnicas añadidas.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {Object.entries(groupedSkills).map(([category, catSkills]) => (
                    <div
                      key={category}
                      className="rounded-[18px] border border-gray-100 p-8 pt-10 relative mb-8"
                    >
                      <h4 className="text-[15px] font-extrabold text-gray-800 mb-8 absolute -top-3 left-6 bg-white px-3">
                        {category}
                      </h4>
                      <div className="space-y-6">
                        {catSkills.map((skill) => (
                          <div key={skill.id_habilidad}>
                            <div className="flex justify-between text-[13px] font-bold text-gray-600 mb-1.5">
                              <span>{skill.nombre}</span>
                              <span className="opacity-60">{skill.nivel}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-blue-50/50 rounded-full overflow-hidden border border-gray-100">
                              <div
                                className="h-full bg-orange-200 rounded-full shadow-inner"
                                style={{ width: `${skill.nivel}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="scroll-mt-24" id="habilidades-blandas">
              <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight mb-8">
                Habilidades Blandas Desarrolladas
              </h3>
              <div className="flex flex-wrap gap-4">
                {skillsLoading ? (
                  <div className="w-full text-center py-5 text-gray-400 font-medium">
                    Cargando habilidades blandas...
                  </div>
                ) : softSkillsArray.length > 0 ? (
                  softSkillsArray.map((skill) => (
                    <span
                      key={skill.id_habilidad}
                      className="px-7 py-3 bg-[#F8FAFC] text-[#1F4E79] rounded-[14px] text-[14px] font-extrabold border border-gray-100 shadow-sm"
                    >
                      {skill.nombre}
                    </span>
                  ))
                ) : (
                  <div className="w-full text-center py-5 text-gray-400 font-medium">
                    No hay habilidades blandas añadidas.
                  </div>
                )}
              </div>
            </section>

            <section className="scroll-mt-24" id="enlaces">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight">Enlaces</h3>
                <button
                  onClick={() => navigate('/enlaces')}
                  className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-[14px] text-[12px] font-bold shadow-md hover:opacity-90 transition-all"
                >
                  Editar
                </button>
              </div>

              {linksError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium">
                  {linksError}
                </div>
              )}

              {displayLinks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayLinks.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-[14px] border border-gray-200 p-6 shadow-sm flex flex-col gap-3 group hover:border-[#1F4E79]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 font-extrabold text-gray-800 text-[16px]">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-blue-600 font-bold hover:underline truncate"
                      >
                        {item.url}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full text-center py-5 text-gray-400 font-medium">
                  No hay enlaces añadidos.
                </div>
              )}
            </section>

            <section className="scroll-mt-24" id="proyectos">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight">Proyectos</h3>
                <button
                  onClick={() => navigate('/mis-proyectos')}
                  className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-[14px] text-[12px] font-bold shadow-md hover:opacity-90 transition-all"
                >
                  Editar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {projects.map((proj, idx) => (
                  <article
                    key={idx}
                    className="rounded-[24px] overflow-hidden border border-gray-100 bg-gray-50/30 shadow-sm flex flex-col group hover:shadow-md transition-shadow"
                  >
                    <div className="h-64 bg-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/5" />
                    </div>
                    <div className="p-8 pb-12 flex flex-col flex-1 bg-white">
                      <h4 className="text-[22px] font-extrabold text-gray-800 mb-2">{proj.title}</h4>
                      <p className="text-gray-400 text-[15px] mb-8 font-semibold">{proj.desc}</p>

                      <div className="space-y-2 mb-10">
                        <div className="text-[14px] font-bold text-gray-700">
                          URL Repositorio:{' '}
                          <a
                            href={proj.repo}
                            className="text-blue-500 hover:underline inline-block truncate max-w-[200px] align-bottom ml-1"
                          >
                            {proj.repo}
                          </a>
                        </div>
                        <div className="text-[14px] font-bold text-gray-700">
                          URL Demo:{' '}
                          <a
                            href={proj.demo}
                            className="text-blue-500 hover:underline inline-block truncate max-w-[200px] align-bottom ml-1"
                          >
                            {proj.demo}
                          </a>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5 mt-auto">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-5 py-2 bg-[#1F4E79]/5 text-[#1F4E79] rounded-lg text-[12px] font-extrabold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-8 text-right">
                        <span className="text-[14px] font-bold text-gray-400 italic">{proj.period}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PerfilUsuario;