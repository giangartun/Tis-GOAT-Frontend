import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Mail, MapPin, GraduationCap, Globe, Trash2, ChevronDown } from 'lucide-react';

interface UserLink {
  id: string;
  title: string;
  url: string;
  date: number;
}

export default function AnadirEnlaces() {
  const navigate = useNavigate();
  const [links, setLinks] = useState<UserLink[]>(JSON.parse(localStorage.getItem('links_v2') || '[]'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('más recientes');

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaUrl, setNuevaUrl] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLink: UserLink = {
      id: Date.now().toString(),
      title: nuevoTitulo,
      url: nuevaUrl.startsWith('http') ? nuevaUrl : 'https://' + nuevaUrl,
      date: Date.now()
    };
    const updated = [...links, newLink];
    setLinks(updated);
    localStorage.setItem('links_v2', JSON.stringify(updated));
    setIsModalOpen(false);
    setNuevoTitulo('');
    setNuevaUrl('');
  };

  const handleDelete = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    localStorage.setItem('links_v2', JSON.stringify(updated));
  };

  const sortedLinks = [...links].sort((a, b) => 
    sortBy === 'más recientes' ? b.date - a.date : a.date - b.date
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-inter">
      {/* Top Header 1 (Dark) */}
      <header className="bg-[#2E3A4D] text-white py-[6px] px-8 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-[34px] h-[42px] bg-transparent" />
          <h1 className="text-[32px] font-bold tracking-tight">Sistema de Portafolios Digitales</h1>
        </div>
        <div className="w-[180px]"></div>
      </header>

      {/* Top Header 2 (Blue Nav) */}
      <nav className="bg-[#1D4A76] text-white py-[14px] px-8 flex items-center z-10 border-t border-white/5 shrink-0">
        <div className="w-64 pl-2"></div>
        <div className="flex-1 flex justify-center gap-20 text-[18px] font-semibold">
          <span onClick={() => navigate('/')} className="cursor-pointer text-white/80 hover:text-white transition">Inicio</span>
          <span onClick={() => navigate('/perfil')} className="cursor-pointer text-white/80 hover:text-white transition">Mi perfil</span>
          <span onClick={() => navigate('/mis-proyectos')} className="cursor-pointer text-white hover:text-white transition">Mis proyectos</span>
        </div>
        <div className="w-[180px]"></div>
      </nav>

      {/* Breadcrumbs */}
      <div className="bg-[#2E3A4D] text-gray-200 py-2.5 px-8 text-[14px] font-medium flex gap-3 shadow-md z-10 border-b border-black/10 shrink-0">
        <span className="hover:text-white cursor-pointer hover:underline">Navegación</span> <span>&gt;</span>
        <span className="hover:text-white cursor-pointer hover:underline" onClick={() => navigate('/perfil')}>Mi perfil</span> <span>&gt;</span>
        <span className="font-semibold text-white">Enlaces</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[280px] bg-[#1D4A76] text-white flex flex-col items-center py-12 shadow-inner shrink-0">
          {/* Empty photo space */}
          <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-white/5 mb-6 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-white/10" />
          </div>
          <h2 className="text-[20px] font-bold tracking-wide mb-0.5">Eliana Martinez</h2>
          <p className="text-[15px] text-blue-100 font-medium mb-12 opacity-80">Ingeniera de Software</p>

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
                      <h2 className="text-[26px] font-bold text-gray-900 mb-2">Eliana Martinez</h2>
                      <p className="text-gray-500 text-[15px] max-w-3xl leading-relaxed font-medium">
                        Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.
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
                    <span className="flex items-center gap-2"><Mail size={18} className="opacity-60" /> eliana.martinez@gmail.com</span>
                    <span className="flex items-center gap-2"><MapPin size={18} className="opacity-60" /> Cochabamba, BO</span>
                    <span className="flex items-center gap-2"><GraduationCap size={20} className="opacity-60" /> Universidad Mayor de San Simon</span>
                  </div>
                </div>
              </div>
              
              {/* Profile Nav Tabs */}
              <div className="bg-white rounded-full px-10 py-[10px] flex gap-24 items-center text-[15px] shadow-sm w-full mb-6 border border-gray-100">
                <button onClick={() => navigate('/mis-proyectos')} className="text-gray-500 font-semibold hover:text-gray-800 transition-colors">Proyectos</button>
                <button onClick={() => navigate('/habilidades')} className="text-gray-500 font-semibold hover:text-gray-800 transition-colors">Habilidades</button>
                <button className="text-blue-900 font-bold border-b-2 border-blue-900">Enlaces</button>
              </div>
            </div>

            {/* List Controls */}
            <div className="flex justify-end items-center gap-5 mb-5 mt-4 text-[14px]">
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-[#1F4E79] hover:opacity-90 text-white px-5 py-[8px] rounded-[14px] font-bold shadow-md transition-colors flex items-center justify-center tracking-wide"
              >
                + Añadir Enlace
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

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-5 pb-20">
              {sortedLinks.map(link => (
                <div key={link.id} className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm flex flex-col justify-between group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <Globe className="text-[#1F4E79]" size={20} />
                      <span className="font-bold text-gray-900 text-[16px]">{link.title}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(link.id)}
                      className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-[14px] truncate w-full inline-block">
                    {link.url}
                  </a>
                </div>
              ))}
              {links.length === 0 && (
                <div className="col-span-2 text-center py-20 text-gray-400 font-medium">No hay enlaces añadidos aún.</div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-10 m-4 relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-[22px] font-bold text-gray-900 mb-8">Añadir Enlace</h2>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">Título del enlace</label>
                <input
                  type="text"
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej: GitHub, LinkedIn, Portfolio"
                  className="w-full px-4 py-[14px] bg-white border border-gray-300 rounded-[14px] text-[15px] text-black font-medium focus:ring-2 focus:ring-[#1F4E79] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">URL</label>
                <input
                  type="text"
                  required
                  value={nuevaUrl}
                  onChange={(e) => setNuevaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-[14px] bg-white border border-gray-300 rounded-[14px] text-[15px] text-black font-medium focus:ring-2 focus:ring-[#1F4E79] focus:outline-none"
                />
              </div>

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
                  Guardar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}