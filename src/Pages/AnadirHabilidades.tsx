import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Mail, MapPin, GraduationCap, ChevronDown, Trash2 } from 'lucide-react';

interface Skill {
  id: number;
  nombre: string;
  categoria: string | null;
  tipo: 'Dura' | 'Blanda';
  porcentaje: number;
  visible: boolean;
}

export default function AnadirHabilidades() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>(() => {
    const saved = localStorage.getItem('habilidades_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('más recientes');

  // User Info
  const [usuario] = useState<any>(JSON.parse(localStorage.getItem('usuario') || '{}'));

  // Modal Form State
  const [tipoHabilidad, setTipoHabilidad] = useState<'Dura' | 'Blanda'>('Dura');
  const [nombreHabilidadDura, setNombreHabilidadDura] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nivel, setNivel] = useState(80);
  const [habilidadBlanda, setHabilidadBlanda] = useState('');
  const [visible, setVisible] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nombre = tipoHabilidad === 'Dura' ? nombreHabilidadDura : habilidadBlanda;
    if (!nombre || (tipoHabilidad === 'Dura' && !categoria)) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    const newSkill: Skill = {
      id: Date.now(),
      nombre: nombre,
      categoria: tipoHabilidad === 'Dura' ? categoria : 'Habilidad Blanda',
      tipo: tipoHabilidad,
      porcentaje: tipoHabilidad === 'Dura' ? nivel : 100,
      visible: visible
    };

    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);
    localStorage.setItem('habilidades_v1', JSON.stringify(updatedSkills));
    
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNombreHabilidadDura('');
    setCategoria('');
    setNivel(80);
    setHabilidadBlanda('');
    setVisible(true);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta habilidad?')) return;
    const updated = skills.filter(s => s.id !== id);
    setSkills(updated);
    localStorage.setItem('habilidades_v1', JSON.stringify(updated));
  };

  const sortedSkills = [...skills].sort((a, b) => {
    return sortBy === 'más recientes' ? b.id - a.id : a.id - b.id;
  });

  const groupedSkills = sortedSkills.reduce((acc, skill) => {
    const key = skill.categoria || 'Otras';
    if (!acc[key]) acc[key] = [];
    acc[key].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex flex-col font-inter">
      {/* Top Header 1 (Dark) */}
      <header className="bg-[#2E3A4D] text-white py-[6px] px-8 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-[34px] h-[42px] bg-transparent" />
          <h1 className="text-[32px] font-bold tracking-tight">Sistema de Portafolios Digitales</h1>
        </div>
        {/* Profile removed from right side as per request */}
        <div className="w-[180px]"></div>
      </header>

      {/* Top Header 2 (Blue Nav) */}
      <nav className="bg-[#1D4A76] text-white py-[14px] px-8 flex items-center z-10 border-t border-white/5 shrink-0">
        <div className="w-64 pl-2"></div>
        <div className="flex-1 flex justify-center gap-20 text-[18px] font-semibold">
          <span onClick={() => navigate('/')} className="cursor-pointer text-white/80 hover:text-white transition">Inicio</span>
          <span onClick={() => navigate('/perfil')} className="cursor-pointer text-white hover:text-white transition">Mi perfil</span>
          <span onClick={() => navigate('/mis-proyectos')} className="cursor-pointer text-white/80 hover:text-white transition">Mis proyectos</span>
        </div>
        <div className="w-[180px]"></div>
      </nav>

      {/* Breadcrumbs */}
      <div className="bg-[#2E3A4D] text-gray-200 py-2.5 px-8 text-[14px] font-medium flex gap-3 shadow-md z-10 border-b border-black/10 shrink-0">
        <span className="hover:text-white cursor-pointer hover:underline">Navegación</span> <span>&gt;</span>
        <span className="hover:text-white cursor-pointer hover:underline" onClick={() => navigate('/perfil')}>Mi perfil</span> <span>&gt;</span>
        <span className="font-semibold text-white">Habilidades</span>
      </div>


      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[280px] bg-[#1D4A76] text-white flex flex-col items-center py-12 shadow-inner shrink-0">
          {/* Empty photo space */}
          <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-white/5 mb-6 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-white/10" />
          </div>
          <h2 className="text-[20px] font-bold tracking-wide mb-0.5">{usuario.nombre} {usuario.apellido_paterno}</h2>
          <p className="text-[15px] text-blue-100 font-medium mb-12 opacity-80">{usuario.profesion || 'Ingeniera de Software'}</p>

          <div className="w-full flex-1">
            <button onClick={() => navigate('/')} className="flex items-center w-full pl-[50px] py-[14px] text-[18px] font-semibold text-blue-100 hover:text-white hover:bg-white/10 transition-colors">
              <Home className="w-7 h-7 mr-4" /> Inicio
            </button>
            <button className="flex items-center w-full pl-[50px] py-[14px] text-[18px] font-semibold text-blue-100 hover:text-white hover:bg-white/10 transition-colors">
              <Settings className="w-7 h-7 mr-4" /> Ajustes
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 bg-transparent flex flex-col overflow-y-auto">
          <div className="p-8 px-12">
            
            {/* Profile Header Section */}
            <div className="mb-6 w-full text-left">
              <div className="flex justify-between items-start mb-6">
                <div className="text-left w-full relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-[26px] font-bold text-gray-900 mb-2">{usuario.nombre} {usuario.apellido_paterno}</h2>
                      <p className="text-gray-500 text-[15px] max-w-3xl leading-relaxed font-medium">
                        {usuario.biografia || 'Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.'}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/perfil')}
                      className="bg-[#1F4E79] text-white px-6 py-2 rounded-full text-[14px] font-bold shadow-md hover:bg-opacity-90 transition-all active:scale-95"
                    >
                      Editar Perfil
                    </button>
                  </div>
                  <div className="flex flex-row items-center gap-8 mt-4 text-[14px] text-gray-500 font-medium">
                    <span className="flex items-center gap-2"><Mail size={18} className="opacity-60" /> {usuario.email}</span>
                    <span className="flex items-center gap-2"><MapPin size={18} className="opacity-60" /> {usuario.ciudad || 'Cochabamba'}, {usuario.pais || 'BO'}</span>
                    <span className="flex items-center gap-2"><GraduationCap size={20} className="opacity-60" /> {usuario.institucion || 'Universidad Mayor de San Simon'}</span>
                  </div>
                </div>
              </div>
              
              {/* Profile Nav Tabs */}
              <div className="bg-white rounded-full px-10 py-[10px] flex gap-24 items-center text-[15px] shadow-sm w-full mb-6 border border-gray-100">
                <button onClick={() => navigate('/mis-proyectos')} className="text-gray-500 font-semibold hover:text-gray-800 transition-colors">Proyectos</button>
                <button className="text-blue-900 font-bold border-b-2 border-blue-900">Habilidades</button>
                <button onClick={() => navigate('/enlaces')} className="text-gray-500 font-semibold hover:text-gray-800 transition-colors">Enlaces</button>
              </div>
            </div>

            {/* List Controls */}
            <div className="flex justify-end items-center gap-5 mb-5 mt-4 text-[14px]">
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-[#1F4E79] hover:opacity-90 text-white px-5 py-[8px] rounded-[14px] font-bold shadow-md transition-colors flex items-center justify-center tracking-wide"
              >
                + Añadir Habilidad
              </button>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-gray-800">Ordenar por:</span>
                <div className="relative">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-200 rounded-full pl-4 pr-9 py-[8px] text-[14px] text-gray-500 font-semibold shadow-sm outline-none cursor-pointer appearance-none"
                  >
                    <option>más recientes</option>
                    <option>más antiguas</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-2 gap-6 pb-20">
              {Object.entries(groupedSkills).map(([type, typeSkills]) => (
                <div key={type} className="bg-white border border-gray-100 rounded-[16px] p-7 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[17px] font-bold text-gray-900">{type}</h3>
                    </div>
                  {typeSkills.map(skill => (
                    <div key={skill.id} className="mb-5 relative group">
                      <div className="flex justify-between items-center text-[14px] mb-2 pr-8">
                        <span className="font-bold text-gray-800">{skill.nombre}</span>
                        {skill.tipo === 'Dura' && <span className="font-medium text-gray-500">{skill.porcentaje}%</span>}
                        <button 
                          onClick={() => handleDelete(skill.id)}
                          className="absolute right-0 top-0 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {skill.tipo === 'Dura' ? (
                        <div className="h-[10px] w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-200 rounded-full transition-all duration-500" style={{ width: `${skill.porcentaje}%` }} />
                        </div>
                      ) : (
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold">{skill.tipo}</span>
                      )}
                    </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => {
                        const isBlanda = type === 'Habilidad Blanda';
                        setTipoHabilidad(isBlanda ? 'Blanda' : 'Dura');
                        if (!isBlanda) setCategoria(type);
                        else setCategoria('');
                        setIsModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                      title="Añadir más habilidades a esta categoría"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {skills.length === 0 && (
                <div className="col-span-2 text-center py-20 text-gray-400 font-medium">No hay habilidades añadidas aún.</div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[550px] p-10 m-4 relative animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[95vh]">
            <h2 className="text-[22px] font-bold text-gray-900 mb-8 font-inter">Editar Habilidades</h2>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              {/* Tipo de habilidad */}
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">Tipo de habilidad</label>
                <div className="relative">
                  <select 
                    value={tipoHabilidad}
                    onChange={(e) => setTipoHabilidad(e.target.value as any)}
                    className="w-full px-4 py-[14px] bg-white border border-gray-300 rounded-[14px] text-[15px] text-gray-900 focus:ring-2 focus:ring-[#1F4E79] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Dura">Habilidad dura</option>
                    <option value="Blanda">Habilidad blanda</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Nombre de la habilidad dura */}
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">Nombre de la habilidad dura</label>
                <input
                  type="text"
                  disabled={tipoHabilidad === 'Blanda'}
                  value={nombreHabilidadDura}
                  onChange={(e) => setNombreHabilidadDura(e.target.value)}
                  placeholder="Escribe el nombre de la habilidad"
                  className={`w-full px-4 py-[14px] bg-white border border-gray-300 rounded-[14px] text-[15px] text-black font-medium focus:ring-2 focus:ring-[#1F4E79] focus:outline-none transition-opacity ${tipoHabilidad === 'Blanda' ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">Categoria</label>
                <div className="relative">
                  <select 
                    disabled={tipoHabilidad === 'Blanda'}
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className={`w-full px-4 py-[14px] bg-white border border-gray-300 rounded-[14px] text-[15px] text-black font-medium focus:ring-2 focus:ring-[#1F4E79] focus:outline-none appearance-none cursor-pointer transition-opacity ${tipoHabilidad === 'Blanda' ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecciona la categoria</option>
                    <option value="Lenguajes de programación">Lenguajes de programación</option>
                    <option value="Base de Datos">Base de Datos</option>
                    <option value="Frameworks y Librerías">Frameworks y Librerías</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Nivel */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[14px] font-bold text-gray-700">Nivel</label>
                  <span className="text-[14px] font-bold text-gray-700">{nivel}%</span>
                </div>
                <div className={`relative h-2 bg-blue-50 rounded-full transition-opacity ${tipoHabilidad === 'Blanda' ? 'opacity-40' : ''}`}>
                   <div className="h-full bg-[#1F4E79] rounded-full" style={{ width: `${nivel}%` }} />
                   <input 
                    type="range"
                    min="0"
                    max="100"
                    disabled={tipoHabilidad === 'Blanda'}
                    value={nivel}
                    onChange={(e) => setNivel(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                   />
                </div>
              </div>

              {/* Seleccione una habilidad blanda */}
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">Seleccione una habilidad blanda</label>
                <div className="relative">
                  <select 
                    disabled={tipoHabilidad === 'Dura'}
                    value={habilidadBlanda}
                    onChange={(e) => setHabilidadBlanda(e.target.value)}
                    className={`w-full px-4 py-[14px] bg-white border border-gray-300 rounded-[14px] text-[15px] text-black font-medium focus:ring-2 focus:ring-[#1F4E79] focus:outline-none appearance-none cursor-pointer transition-opacity ${tipoHabilidad === 'Dura' ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecciona una habilidad</option>
                    <option value="Trabajo en equipo">Trabajo en equipo</option>
                    <option value="Liderazgo">Liderazgo</option>
                    <option value="Adaptabilidad">Adaptabilidad</option>
                    <option value="Comunicación">Comunicación</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Visible */}
              <div className="flex items-center justify-between mt-2">
                <div>
                  <label className="block text-[15px] font-bold text-gray-900">Visible</label>
                  <p className="text-[14px] text-gray-400 font-medium">Mostrar esta habilidad en el perfil</p>
                </div>
                <div 
                  onClick={() => setVisible(!visible)}
                  className={`w-[54px] h-[28px] rounded-full p-1 cursor-pointer transition-colors ${visible ? 'bg-[#1F4E79]' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${visible ? 'translate-x-[26px]' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-[12px] bg-[#E5E7EB] text-gray-600 text-[15px] font-bold rounded-[14px] hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-10 py-[12px] bg-[#1F4E79] text-white text-[15px] font-bold rounded-[14px] hover:bg-opacity-90 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Guardar Habilidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}