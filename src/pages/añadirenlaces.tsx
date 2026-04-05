import React, { useState } from 'react';

interface UserLink {
  id: string;
  title: string;
  url: string;
}

export default function AnadirEnlaces() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Estado dinámico para los enlaces
  const [enlaces, setEnlaces] = useState<UserLink[]>([
    { id: '1', title: 'LinkedIn', url: 'https://github.com/elianamartinez' },
    { id: '2', title: 'GitHub', url: 'https://github.com/elianamartinez' },
    { id: '3', title: 'Mi Sitio Web', url: 'https://github.com/elianamartinez' },
  ]);

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaUrl, setNuevaUrl] = useState('');

  const handleOpenModal = () => {
    setNuevoTitulo('');
    setNuevaUrl('');
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoTitulo.trim() !== '' && nuevaUrl.trim() !== '') {
      const newLink: UserLink = {
        id: Date.now().toString(),
        title: nuevoTitulo,
        url: nuevaUrl,
      };
      setEnlaces([...enlaces, newLink]);
      setIsModalOpen(false);
      setIsSuccessOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setEnlaces(enlaces.filter(enlace => enlace.id !== id));
  };

  const handleSuccessClose = () => setIsSuccessOpen(false);

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

  const GithubLinkIcon = () => (
    <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );

  const LinkedinLinkIcon = () => (
    <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );

  const GlobeLinkIcon = () => (
    <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.09 13.36 4 12.69 4 12s.09-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.07c.96-1.66 2.49-2.93 4.33-3.56C8.8 5.55 8.34 6.75 8.02 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm1.24 3.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.17.64.26 1.31.26 2s-.09 1.36-.26 2h-3.38z" clipRule="evenodd" />
    </svg>
  );

  const getIconForTitle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('github')) return <GithubLinkIcon />;
    if (t.includes('linkedin')) return <LinkedinLinkIcon />;
    return <GlobeLinkIcon />;
  };

  const ProfileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80";

  return (
    <div className="min-h-screen bg-[#DBDFE4] flex flex-col font-sans w-full overflow-hidden">
      
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
          <span className="cursor-pointer text-white/80 hover:text-white">Mi perfil</span>
          <span className="cursor-pointer text-white">Mis proyectos</span>
        </div>
        <div className="w-[180px]"></div> {/* Spacer */}
      </nav>

      {/* Breadcrumbs */}
      <div className="bg-[#364359] text-gray-200 py-2.5 px-8 text-[14px] font-medium flex gap-3 shadow-md z-10 border-b border-black/10">
        <span className="hover:text-white cursor-pointer hover:underline">Navegación</span> <span>&gt;</span>
        <span className="hover:text-white cursor-pointer hover:underline">Enlaces</span>
        {isModalOpen && <> <span className="text-gray-400">&gt;</span> <span className="font-semibold text-white">Añadir enlace</span> </>}
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 h-0">
        
        {/* Left Sidebar */}
        <aside className="w-[280px] bg-[#1D4A76] text-white flex flex-col items-center py-12 shadow-inner h-full">
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

        {/* Right Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#E5E9EC] p-8 px-12 relative">
          
          {/* Profile Details Card */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-[26px] font-bold text-gray-900 mb-2">Eliana Martinez</h2>
                <p className="text-gray-500 text-[15px] max-w-3xl leading-relaxed font-medium">
                  Apasionada por las creaciones de aplicaciones web y la elaboración de experiencias de usuario excepcionales, con experiencia en trabajo equipo.
                </p>
                <div className="flex items-center gap-8 mt-4 text-[14px] text-gray-500 font-medium">
                  <span className="flex items-center gap-2"><MailIcon /> eliana.martinez@gmail.com</span>
                  <span className="flex items-center gap-2"><MapPinIcon /> Cochabamba, BO</span>
                  <span className="flex items-center gap-2"><EduIcon /> Universidad Mayor de San Simon</span>
                </div>
              </div>
              <button className="px-6 py-[6px] bg-[#4B5563] hover:bg-[#374151] text-white text-[14px] font-semibold rounded-full transition-colors shadow-sm mt-1">
                Editar Perfil
              </button>
            </div>
            
            {/* Nav Tabs */}
            <div className="bg-white rounded-full px-6 py-2 flex gap-10 items-center text-[15px] shadow-sm w-max mb-6">
              <button className="text-gray-500 font-semibold hover:text-gray-800 transition-colors">Proyectos</button>
              <button className="text-gray-500 font-semibold hover:text-gray-800 transition-colors">Habilidades</button>
              <button className="text-gray-900 font-bold px-2 border-b-2 border-transparent">Enlaces</button>
            </div>
          </div>

          {/* Table Header: Add Button & Filter */}
          <div className="flex justify-end items-center gap-5 mb-5 mt-4 text-[14px]">
            <button 
              onClick={handleOpenModal} 
              className="bg-[#1e4572] hover:bg-[#153457] text-white px-5 py-[8px] rounded-[10px] font-bold shadow-md transition-colors flex items-center justify-center tracking-wide"
            >
              + Añadir Enlace
            </button>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-gray-800">Ordenar por:</span>
              <div className="relative">
                <select className="bg-white border-none rounded-full pl-4 pr-9 py-[8px] text-[14px] text-gray-500 font-semibold shadow-sm outline-none cursor-pointer appearance-none">
                  <option>más recientes</option>
                  <option>más antiguas</option>
                  <option>alfabético</option>
                </select>
                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-5 pb-20">
            {enlaces.map((enlace) => (
              <div key={enlace.id} className="bg-white rounded-[16px] p-5 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2.5">
                    {getIconForTitle(enlace.title)}
                    <span className="font-bold text-gray-900 text-[16px]">{enlace.title}</span>
                  </div>
                  <div className="flex gap-4">
                    <button className="text-[#3b82f6] text-[14px] font-semibold hover:underline">
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(enlace.id)}
                      className="text-red-500 text-[14px] font-semibold hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <a href={enlace.url} target="_blank" rel="noopener noreferrer" className="text-[#1D4A76] hover:underline text-[14px] truncate w-full inline-block">
                  {enlace.url}
                </a>
              </div>
            ))}
            
            {enlaces.length === 0 && (
              <div className="col-span-2 text-center text-gray-500 py-10 font-medium">
                No hay enlaces añadidos. Haz clic en "+ Añadir Enlace" para crear uno nuevo.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- MODALS OVERLAY --- */}

      {/* Modal Añadir Enlace */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-opacity">
          <div className="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] w-full max-w-[500px] p-10 m-4 relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-[20px] font-bold text-gray-900 mb-6 font-sans">Añadir Enlace</h2>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
               {/* Titulo */}
               <div>
                 <label className="block text-[14px] font-semibold text-gray-800 mb-2">
                   Titulo del enlace
                 </label>
                 <input
                   type="text"
                   required
                   value={nuevoTitulo}
                   onChange={(e) => setNuevoTitulo(e.target.value)}
                   className="w-full px-4 py-[14px] border border-gray-300 rounded-[14px] text-[15px] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent focus:outline-none placeholder-gray-400 font-sans transition-all"
                   placeholder="Escribe el titulo del enlace"
                 />
               </div>

               {/* URL */}
               <div>
                 <label className="block text-[14px] font-semibold text-gray-800 mb-2">
                   URL
                 </label>
                 <input
                   type="url"
                   required
                   value={nuevaUrl}
                   onChange={(e) => setNuevaUrl(e.target.value)}
                   className="w-full px-4 py-[14px] border border-gray-300 rounded-[14px] text-[15px] focus:ring-2 focus:ring-[#2563eb] focus:border-transparent focus:outline-none placeholder-gray-400 font-sans transition-all"
                   placeholder="http://ejemplo.com"
                 />
               </div>

               {/* Actions */}
               <div className="flex justify-end gap-4 pt-4 mt-2">
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
                   Guardar Enlace
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
            <div className="flex justify-center mb-5">
              <div className="w-[84px] h-[84px] bg-[#4ADE80] rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(74,222,128,0.35)]">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-[20px] font-bold text-gray-900 mb-2 tracking-tight text-center w-full">
              Enlace añadido con exito
            </h2>
            <p className="text-[15px] text-gray-500 mb-8 font-medium text-center w-full">
              Su nuevo enlace se ha añadido con exito
            </p>
            
            <button
              type="button"
              onClick={handleSuccessClose}
              className="px-[45px] py-[12px] bg-[#2563eb] text-white text-[16px] font-bold rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
