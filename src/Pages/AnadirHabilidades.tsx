import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Skill {
  id: string;
  name: string;
  type: string;
  percentage: number;
  visible: boolean;
}

const initialSkills: Skill[] = [
  { id: '1', name: 'JavaScript', type: 'Lenguajes de programacion', percentage: 80, visible: true },
  { id: '2', name: 'Phyton', type: 'Lenguajes de programacion', percentage: 75, visible: true },
  { id: '3', name: 'Java', type: 'Lenguajes de programacion', percentage: 85, visible: true },
  
  { id: '4', name: 'React', type: 'Frameworks y Librerias', percentage: 75, visible: true },
  { id: '5', name: 'Node.js', type: 'Frameworks y Librerias', percentage: 80, visible: true },
  { id: '6', name: 'Django', type: 'Frameworks y Librerias', percentage: 85, visible: true },
  
  { id: '7', name: 'MySQL', type: 'Base de Datos', percentage: 80, visible: true },
  { id: '8', name: 'PostgreSQL', type: 'Base de Datos', percentage: 75, visible: true },
  { id: '9', name: 'MongoDB', type: 'Base de Datos', percentage: 85, visible: true },

  { id: '10', name: 'Git', type: 'Herramientas y Tecnologias', percentage: 80, visible: true },
  { id: '11', name: 'Docker', type: 'Herramientas y Tecnologias', percentage: 75, visible: true },
  { id: '12', name: 'Linux', type: 'Herramientas y Tecnologias', percentage: 85, visible: true },
];

export default function AnadirHabilidades() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const navigate = useNavigate();

  const [skills, setSkills] = useState<Skill[]>(initialSkills);

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [nivel, setNivel] = useState(80);
  const [visible, setVisible] = useState(true);

  const handleOpenModal = () => {
    setNombre('');
    setTipo('');
    setNivel(80);
    setVisible(true);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && tipo.trim()) {
      const newSkill: Skill = {
        id: Date.now().toString(),
        name: nombre,
        type: tipo,
        percentage: nivel,
        visible: visible
      };
      setSkills([...skills, newSkill]);
      setIsModalOpen(false);
      setIsSuccessOpen(true);
    }
  };

  const handleDeleteGroup = (typeToDelete: string) => {
    // Elimina todas las habilidades que coincidan con ese 'tipo' (frame)
    setSkills(skills.filter(skill => skill.type !== typeToDelete));
  };

  const handleSuccessClose = () => setIsSuccessOpen(false);

  // Group skills dynamically by type
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.type]) acc[skill.type] = [];
    acc[skill.type].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // SVG Icons
  const HomeIcon = () => (
    <svg className="w-7 h-7 mr-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );

  const SettingsIcon = () => (
    <svg className="w-7 h-7 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const MailIcon = () => (
    <svg className="w-[18px] h-[18px] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const MapPinIcon = () => (
    <svg className="w-[18px] h-[18px] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const EduIcon = () => (
    <svg className="w-[20px] h-[20px] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v4M12 20.055V22" />
    </svg>
  );

  const ProfileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80";

  return (
    <div className="min-h-screen bg-[#DBDFE4] flex flex-col font-sans w-full">
      
      {/* Top Header 1 (Dark) */}
      <header className="bg-[#2B354F] text-white py-[6px] px-8 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-6">
          <svg width="34" height="42" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
            <polygon points="0,0 100,0 50,130" fill="#ced4da" />
            <polygon points="0,0 100,0 50,75" fill="#dc2626" />
            <circle cx="50" cy="95" r="7" fill="white" />
            <line x1="50" y1="75" x2="50" y2="130" stroke="white" strokeWidth="2" />
            <text x="50" y="25" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="1">UMSS</text>
          </svg>
          <h1 className="text-[32px] font-bold tracking-tight">Sistema de Portafolios Digitales</h1>
        </div>
        <div className="flex flex-col items-center justify-center mr-4">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/20 mb-0.5">
            <img src={ProfileImage} alt="User" className="w-full h-full object-cover" />
          </div>
          <span className="text-[12px] font-bold tracking-wide">Eliana Martinez</span>
          <span className="text-[10px] text-gray-300 font-medium tracking-wide">Ingeniera de Software</span>
        </div>
      </header>

      {/* Top Header 2 (Blue) */}
      <nav className="bg-[#1D4A76] text-white py-[14px] px-8 flex items-center z-10 border-t border-white/5">
        <div className="w-64 font-bold text-[18px] pl-2">Menú</div>
        <div className="flex-1 flex justify-center gap-20 text-[18px] font-semibold">
          <span className="cursor-pointer text-white/80 hover:text-white">Inicio</span>
          <span className="cursor-pointer text-white">Mi perfil</span>
          <span className="cursor-pointer text-white/80 hover:text-white">Mis proyectos</span>
        </div>
        <div className="w-[180px]"></div> {/* Spacer */}
      </nav>

      {/* Breadcrumbs */}
      <div className="bg-[#364359] text-gray-200 py-2.5 px-8 text-[14px] font-medium flex gap-3 shadow-md z-10 border-b border-black/10">
        <span className="hover:text-white cursor-pointer hover:underline">Navegación</span> <span>&gt;</span>
        <span className="hover:text-white cursor-pointer hover:underline">Mi perfil</span> <span>&gt;</span>
        <span className="font-semibold text-white">Habilidades</span>
        {isModalOpen && <> <span className="text-gray-400">&gt;</span> <span className="font-semibold text-white">Editar habilidad</span> </>}
      </div>

      {/* Main Layout Area - Eliminated container constraints so Sidebar expands completely */}
      <div className="flex flex-1 items-stretch">
        
        {/* Left Sidebar - Will automatically stretch down 100% of flex container height */}
        <aside className="w-[280px] bg-[#1D4A76] text-white flex flex-col items-center py-12 shadow-inner shrink-0">
          <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-[4px] border-[#3B82F6] mb-5 shadow-lg bg-gray-200">
            <img src={ProfileImage} alt="Eliana" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[20px] font-bold tracking-wide mb-0.5">Eliana Martinez</h2>
          <p className="text-[15px] text-blue-100 font-medium mb-12 opacity-80">Ingeniera de Software</p>

          <div className="w-full flex-1">
            <button className="flex items-center w-full pl-[50px] py-[14px] text-[18px] font-semibold text-blue-100 hover:text-white hover:bg-white/10 transition-colors">
              <HomeIcon /> Inicio
            </button>
            <button className="flex items-center w-full pl-[50px] py-[14px] text-[18px] font-semibold text-blue-100 hover:text-white hover:bg-white/10 transition-colors">
              <SettingsIcon /> Ajustes
            </button>
          </div>
        </aside>

        {/* Right Content Area - Rediseñado para verse mucho más blanco sin romper el contorno */}
        <main className="flex-1 bg-[#F0F2F5] p-8 px-12 relative text-left">
          
          {/* Profile Details Card */}
          <div className="mb-6 w-full text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="text-left w-full">
                <h2 className="text-[26px] font-bold text-gray-900 mb-2">Eliana Martinez</h2>
                <p className="text-gray-500 text-[15px] max-w-3xl leading-relaxed font-medium text-left">
                  Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.
                </p>
                {/* User Information - Strictly in ONE horizontal line */}
                <div className="flex flex-row items-center gap-8 mt-4 text-[14px] text-gray-500 font-medium whitespace-nowrap flex-nowrap overflow-visible">
                  <span className="flex items-center gap-2"><MailIcon /> eliana.martinez@gmail.com</span>
                  <span className="flex items-center gap-2"><MapPinIcon /> Cochabamba, BO</span>
                  <span className="flex items-center gap-2"><EduIcon /> Universidad Mayor de San Simon</span>
                </div>
              </div>
              <button className="px-6 py-[6px] bg-[#4B5563] hover:bg-[#374151] text-white text-[14px] font-semibold rounded-full transition-colors shadow-sm mt-1 shrink-0">
                Editar Perfil
              </button>
            </div>
            
            {/* Nav Tabs */}
            <div className="bg-white rounded-full px-10 py-[10px] flex gap-24 items-center text-[15px] shadow-sm w-full mb-6">
              <button onClick={() => navigate('/proyectos')} className="text-gray-500 font-semibold hover:text-gray-800 transition-colors">Proyectos</button>
              <button className="text-gray-900 font-bold">Habilidades</button>
              <button onClick={() => navigate('/enlaces')} className="text-gray-500 font-semibold hover:text-gray-800 transition-colors">Enlaces</button>
            </div>
          </div>

          {/* Table Header: Add Button & Filter */}
          <div className="flex justify-end items-center gap-5 mb-5 mt-4 text-[14px]">
            <button 
              onClick={handleOpenModal} 
              className="bg-[#1e4572] hover:bg-[#153457] text-white px-5 py-[8px] rounded-[14px] font-bold shadow-md transition-colors flex items-center justify-center tracking-wide"
            >
              + Añadir Habilidad
            </button>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-gray-800">Ordenar por:</span>
              <div className="relative">
                {/* Selector de orden: únicamente opciones recientes/antiguos */}
                <select className="bg-white border-none rounded-full pl-4 pr-9 py-[8px] text-[14px] text-gray-500 font-semibold shadow-sm outline-none cursor-pointer appearance-none">
                  <option>más recientes</option>
                  <option>más antiguas</option>
                </select>
                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Dynamic Skills Grid */}
          <div className="grid grid-cols-2 gap-6 pb-20">
            {Object.entries(groupedSkills).map(([type, typeSkills]) => (
              <div key={type} className="bg-white rounded-[16px] p-7 shadow-sm">
                
                {/* Título de la tarjeta y Botón ELIMINAR negro a la derecha */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[17px] font-bold text-gray-900">{type}</h3>
                  <button 
                    type="button"
                    onClick={() => handleDeleteGroup(type)}
                    className="text-gray-800 hover:text-black hover:underline text-[13px] font-bold transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
                
                {/* Listado de barras (ya sin botón individual) */}
                {typeSkills.map(skill => (
                  <SkillBar key={skill.id} skill={skill} />
                ))}
              </div>
            ))}

            {Object.keys(groupedSkills).length === 0 && (
              <div className="col-span-2 text-center text-gray-500 py-10 font-medium">
                No hay habilidades añadidas. Haz clic en "+ Añadir Habilidad" para crear una nueva.
              </div>
            )}
          </div>

        </main>
      </div>

      {/* --- MODALS OVERLAY --- */}

      {/* Modal Añadir/Editar Habilidad */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-opacity">
          <div className="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] w-full max-w-[550px] p-10 m-4 relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-[20px] font-bold text-gray-900 mb-6 font-sans text-left">Editar Habilidad</h2>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
               {/* Nombre */}
               <div>
                 <label className="block text-[14px] font-semibold text-gray-800 mb-2 text-left">
                   Nombre de la habilidad
                 </label>
                 <input
                   type="text"
                   required
                   value={nombre}
                   onChange={(e) => setNombre(e.target.value)}
                   className="w-full px-4 py-[14px] bg-white border border-gray-300 rounded-[14px] text-[15px] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent focus:outline-none placeholder-gray-400 font-sans transition-all"
                   placeholder="Escribe el nombre de la habilidad"
                 />
               </div>

               {/* Tipo */}
               <div>
                 <label className="block text-[14px] font-semibold text-gray-800 mb-2 text-left">
                   Tipo
                 </label>
                 <input
                   type="text"
                   required
                   value={tipo}
                   onChange={(e) => setTipo(e.target.value)}
                   className="w-full px-4 py-[14px] bg-white border border-gray-300 rounded-[14px] text-[15px] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent focus:outline-none placeholder-gray-400 font-sans transition-all"
                   placeholder="Escribe el tipo de habilidad"
                 />
               </div>

               {/* Nivel Slider */}
               <div>
                 <label className="block text-[14px] font-semibold text-gray-800 mb-3 text-left">
                   Nivel
                 </label>
                 <div className="flex items-center gap-5">
                   <div className="relative flex-1 h-[14px] rounded-full bg-[#dbeafe] overflow-hidden shadow-inner">
                     <div 
                       className="absolute left-0 top-0 h-full bg-[#2563eb] pointer-events-none transition-all duration-150 ease-out"
                       style={{ width: `${nivel}%` }}
                     ></div>
                     <input
                       type="range"
                       min="0"
                       max="100"
                       value={nivel}
                       onChange={(e) => setNivel(parseInt(e.target.value))}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 m-0 p-0"
                     />
                   </div>
                   <span className="text-[17px] font-bold text-gray-700 w-[45px] text-right">
                     {nivel}%
                   </span>
                 </div>
               </div>

               {/* Visible Toggle */}
               <div className="flex items-center justify-between pb-3 mt-1">
                 <div className="text-left">
                   <label className="block text-[14px] font-semibold text-gray-800 mb-1 text-left">
                     Visible
                   </label>
                   <p className="text-[14px] text-gray-400 font-medium text-left">
                     Mostrar esta habilidad en el perfil
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={() => setVisible(!visible)}
                   role="switch"
                   aria-checked={visible}
                   className={`relative inline-flex h-[30px] w-[54px] items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 ${
                     visible ? 'bg-[#2563eb]' : 'bg-gray-200'
                   }`}
                 >
                   <span className="sr-only">Toggle visibility</span>
                   <span
                     className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                       visible ? 'translate-x-[26px]' : 'translate-x-1'
                     }`}
                   />
                 </button>
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-4 pt-1">
                 <button
                   type="button"
                   onClick={handleCloseModal}
                   className="px-8 py-[12px] bg-[#E5E7EB] text-gray-800 text-[15px] font-bold rounded-[14px] hover:bg-gray-300 transition-colors shadow-sm"
                 >
                   Cancelar
                 </button>
                 <button
                   type="submit"
                   className="px-8 py-[12px] bg-[#2563eb] text-white text-[15px] font-bold rounded-[14px] hover:bg-blue-700 transition-colors shadow-md"
                 >
                   Guardar Habilidad
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-opacity">
          <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] w-full max-w-[420px] py-10 px-8 m-4 relative text-center flex flex-col items-center animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center mb-6">
              <div className="w-[90px] h-[90px] bg-[#10B981] rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(16,185,129,0.35)]">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-[20px] font-bold text-gray-900 mb-2 tracking-tight">
              Habilidad añadida con exito
            </h2>
            <p className="text-[15px] text-gray-500 mb-8 font-medium">
              Su nueva habilidad se ha añadido con exito
            </p>
            
            <button
              type="button"
              onClick={handleSuccessClose}
              className="px-[45px] py-[12px] bg-[#2563eb] text-white text-[16px] font-bold rounded-[12px] hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent para dibujar las barritas de porcentaje en el fondo
function SkillBar({ skill }: { skill: Skill }) {
  return (
    <div className="mb-[18px]">
      <div className="flex justify-between items-center text-[14px] mb-2">
        <span className="font-bold text-gray-800">{skill.name}</span>
        <span className="font-medium text-gray-500">{skill.percentage}%</span>
      </div>
      <div className="h-[10px] w-full bg-[#E5E7EB] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#FDBA74] rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${skill.percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
