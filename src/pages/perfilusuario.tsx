import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  MapPin, 
  GraduationCap, 
  Globe
} from 'lucide-react';

interface Skill {
  id: number;
  nombre: string;
  categoria: string | null;
  tipo: 'Dura' | 'Blanda';
  porcentaje: number;
  visible: boolean;
}

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const [usuario] = useState<any>(() => {
    const saved = localStorage.getItem('usuario');
    const data = saved ? JSON.parse(saved) : {};
    return {
      nombre: "Eliana",
      apellido_paterno: "Martinez",
      profesion: "Ingeniera de Software",
      email: "eliana.martinez@gmail.com",
      ciudad: "Cochabamba",
      pais: "BO",
      institucion: "Universidad Mayor de San Simon",
      biografia: "Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.",
      ...data
    };
  });

  const portfolioId = usuario?.portafolio?.id || usuario?.portafolio_id || usuario?.id_portafolio || usuario.id_usuario || usuario.id;
  const token = localStorage.getItem('token');
  
  const [skills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem('habilidades_v1');
    const userSkills = saved ? JSON.parse(saved) : [];
    
    // Default mock skills
    const defaultSkills: Skill[] = [
      { id: 1, nombre: 'JavaScript', categoria: 'Lenguajes de programación', tipo: 'Dura', porcentaje: 90, visible: true },
      { id: 2, nombre: 'TypeScript', categoria: 'Lenguajes de programación', tipo: 'Dura', porcentaje: 85, visible: true },
      { id: 3, nombre: 'PostgreSQL', categoria: 'Base de Datos', tipo: 'Dura', porcentaje: 80, visible: true },
      { id: 4, nombre: 'React', categoria: 'Frameworks y Librerías', tipo: 'Dura', porcentaje: 95, visible: true },
      { id: 5, nombre: 'Node.js', categoria: 'Frameworks y Librerías', tipo: 'Dura', porcentaje: 75, visible: true },
      { id: 6, nombre: 'Trabajo en equipo', categoria: 'Habilidad Blanda', tipo: 'Blanda', porcentaje: 100, visible: true },
      { id: 7, nombre: 'Liderazgo', categoria: 'Habilidad Blanda', tipo: 'Blanda', porcentaje: 100, visible: true },
      { id: 8, nombre: 'Adaptabilidad', categoria: 'Habilidad Blanda', tipo: 'Blanda', porcentaje: 100, visible: true },
    ];

    return [...defaultSkills, ...userSkills];
  });

  const sortedSkills = [...skills].sort((a: Skill, b: Skill) => {
    return b.id - a.id; // Default to most recent (highest ID)
  });

  const hardSkills = sortedSkills.filter((s: Skill) => s.tipo === 'Dura');
  const groupedSkills = hardSkills.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
    const key = skill.categoria || 'Otras';
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const softSkillsArray = sortedSkills.filter((s: Skill) => s.tipo === 'Blanda');

  const experiences = [
    {
      role: "Software Developer - Empresa X",
      period: "2023 - Actual",
      desc: "APIs REST, Docker, microservicios",
    },
    {
      role: "Backend Developer - Empresa Y",
      period: "2022 - 2023",
      desc: "Optimización de base de datos",
    },
  ];

  const projects = [
    {
      title: "Sistema de Gestión",
      desc: "Plataforma de administración de tareas",
      repo: "https://github.com/tuusuario/tustareas",
      demo: "https://demo-gestionsistemas.com",
      tags: ["React", "Node.js", "MongoDB"],
      period: "2021 - 2022",
    },
    {
      title: "E- Commerce App",
      desc: "App de ventas online",
      repo: "https://github.com/tuusuario/tuventas",
      demo: "https://demo-usuarioventas.com",
      tags: ["Vue.js", "Firebase", "Stripe"],
      period: "2020 - 2021",
    },
  ];

  // Mock data for links (Examples)
  const [links, setLinks] = useState<any[]>([]);
  const defaultLinks = [
    { label: "LinkedIn", icon: <Globe size={18} />, url: "https://linkedin.com/in/elianamartinez" },
    { label: "GitHub", icon: <Globe size={18} />, url: "https://github.com/elianamartinez" },
    { label: "Mi Sitio Web", icon: <Globe size={18} />, url: "https://elianamartinez.dev" },
  ];

  useEffect(() => {
    if (portfolioId) {
      fetchLinks();
    }
  }, [portfolioId]);

  const fetchLinks = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/redes-profesionales/${portfolioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setLinks(data);
      }
    } catch (err) {
      console.error('Error fetching links:', err);
    }
  };

  const displayLinks = [
    ...defaultLinks,
    ...links.map((l: any) => ({
      label: l.nombre || l.title,
      icon: <Globe size={18} />,
      url: l.url
    }))
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-inter">
      {/* Top Header 1 (Dark) */}
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

      {/* Breadcrumbs */}
      <div className="bg-[#2E3A4D] text-white/80 py-3 px-12 text-[13px] font-medium flex gap-3 z-30 border-t border-white/5 shadow-md">
        <span>Navegación</span> <span>&gt;</span>
        <span>Mi perfil</span> <span>&gt;</span>
        <span className="font-bold text-white uppercase tracking-wider">Perfil</span>
      </div>

      <main className="flex-1 overflow-y-auto pt-12 pb-20">
        <div className="max-w-[1240px] mx-auto flex flex-col shadow-2xl rounded-[16px] overflow-hidden">
          
          {/* Joined Header - No Photo, No Gap */}
          <div className="bg-[#1F4E79] text-white p-12 relative overflow-hidden shrink-0">
             <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-10">
                   <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center shadow-inner">
                      <div className="w-28 h-28 rounded-full bg-white/10" />
                   </div>
                   <div className="flex flex-col">
                      <h2 className="text-[42px] font-bold mb-1 tracking-tight">{usuario.nombre} {usuario.apellido_paterno}</h2>
                      <p className="text-blue-200 text-[20px] font-medium opacity-90 mb-6 italic">{usuario.profesion || 'Ingeniera de Software'}</p>
                      
                      <div className="flex flex-wrap gap-x-12 gap-y-4 text-[13px] font-medium">
                        <span className="flex items-center gap-2.5 opacity-80"><Mail size={16} /> {usuario.email}</span>
                        <span className="flex items-center gap-2.5 opacity-80"><MapPin size={16} /> {usuario.ciudad || 'Cochabamba'}, {usuario.pais || 'BO'}</span>
                        <span className="flex items-center gap-2.5 opacity-80"><GraduationCap size={18} /> {usuario.institucion || 'Universidad Mayor de San Simon'}</span>
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

          {/* Joined Content Sheet - No Top Marginal Gap */}
          <div className="bg-white p-16 flex flex-col gap-16 border-t border-white/10">
            
            {/* 1. Sobre mi */}
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

            {/* 2. Experiencia */}
            <section className="scroll-mt-24" id="experiencia">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight">Experiencia</h3>
                <button className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-lg text-[12px] font-bold shadow-md hover:opacity-90 transition-all">
                  Editar
                </button>
              </div>
              <div className="flex flex-wrap gap-8">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="w-[340px] rounded-[14px] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-extrabold text-gray-800 text-[17px]">{exp.role}</h4>
                    <p className="text-[13px] font-bold text-gray-400 mt-1">{exp.period}</p>
                    <p className="mt-4 text-[14px] text-gray-500 leading-snug font-medium">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Habilidades */}
            <section className="scroll-mt-24" id="habilidades">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight">Habilidades</h3>
                <button onClick={() => navigate('/habilidades')} className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-[14px] text-[12px] font-bold shadow-md hover:opacity-90 transition-all">
                  Editar
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 {Object.entries(groupedSkills).map(([category, catSkills]: [string, Skill[]]) => (
                    <div key={category} className="rounded-[18px] border border-gray-100 p-8 pt-10 relative mb-8">
                      <h4 className="text-[15px] font-extrabold text-gray-800 mb-8 absolute -top-3 left-6 bg-white px-3">{category}</h4>
                      <div className="space-y-6">
                         {catSkills.map((skill: Skill) => (
                            <div key={skill.id}>
                              <div className="flex justify-between text-[13px] font-bold text-gray-600 mb-1.5">
                                <span>{skill.nombre}</span>
                                <span className="opacity-60">{skill.porcentaje}%</span>
                              </div>
                              <div className="h-2.5 w-full bg-blue-50/50 rounded-full overflow-hidden border border-gray-100">
                                <div className="h-full bg-orange-200 rounded-full shadow-inner" style={{ width: `${skill.porcentaje}%` }} />
                              </div>
                            </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
            </section>

            {/* 4. Habilidades Blandas */}
            <section className="scroll-mt-24" id="habilidades-blandas">
               <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight mb-8">Habilidades Blandas Desarrolladas</h3>
               <div className="flex flex-wrap gap-4">
                  {softSkillsArray.map((skill: Skill) => (
                    <span key={skill.id} className="px-7 py-3 bg-[#F8FAFC] text-[#1F4E79] rounded-[14px] text-[14px] font-extrabold border border-gray-100 shadow-sm">
                      {skill.nombre}
                    </span>
                  ))}
                  {softSkillsArray.length === 0 && (
                    <div className="w-full text-center py-5 text-gray-400 font-medium">No hay habilidades blandas añadidas.</div>
                  )}
               </div>
            </section>

            {/* 5. Enlaces */}
            <section className="scroll-mt-24" id="enlaces">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight">Enlaces</h3>
                <button onClick={() => navigate('/enlaces')} className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-[14px] text-[12px] font-bold shadow-md hover:opacity-90 transition-all">
                  Editar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayLinks.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-[14px] border border-gray-200 p-6 shadow-sm flex flex-col gap-3 group hover:border-[#1F4E79]/30 transition-colors">
                    <div className="flex items-center gap-3 font-extrabold text-gray-800 text-[16px]">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue-600 font-bold hover:underline truncate">
                      {item.url}
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Proyectos */}
            <section className="scroll-mt-24" id="proyectos">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight">Proyectos</h3>
                <button onClick={() => navigate('/mis-proyectos')} className="bg-[#1F4E79] text-white px-6 py-1.5 rounded-[14px] text-[12px] font-bold shadow-md hover:opacity-90 transition-all">
                  Editar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {projects.map((proj, idx) => (
                  <article key={idx} className="rounded-[24px] overflow-hidden border border-gray-100 bg-gray-50/30 shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                    <div className="h-64 bg-gray-200 relative overflow-hidden">
                       <div className="absolute inset-0 bg-black/5" />
                    </div>
                    <div className="p-8 pb-12 flex flex-col flex-1 bg-white">
                      <h4 className="text-[22px] font-extrabold text-gray-800 mb-2">{proj.title}</h4>
                      <p className="text-gray-400 text-[15px] mb-8 font-semibold">{proj.desc}</p>
                      
                      <div className="space-y-2 mb-10">
                        <div className="text-[14px] font-bold text-gray-700">URL Repositorio: <a href={proj.repo} className="text-blue-500 hover:underline inline-block truncate max-w-[200px] align-bottom ml-1">{proj.repo}</a></div>
                        <div className="text-[14px] font-bold text-gray-700">URL Demo: <a href={proj.demo} className="text-blue-500 hover:underline inline-block truncate max-w-[200px] align-bottom ml-1">{proj.demo}</a></div>
                      </div>

                      <div className="flex flex-wrap gap-2.5 mt-auto">
                        {proj.tags.map(tag => (
                          <span key={tag} className="px-5 py-2 bg-[#1F4E79]/5 text-[#1F4E79] rounded-lg text-[12px] font-extrabold">
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