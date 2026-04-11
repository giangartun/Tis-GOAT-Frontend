/** HU: Gestión de Enlaces - Persistencia Local (Sin Backend) */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Mail, MapPin, GraduationCap, Globe, Trash2, ChevronDown } from 'lucide-react';

export default function AnadirEnlaces() {
  const navigate = useNavigate();
  const [links, setLinks] = useState<any[]>(() => {
    const saved = localStorage.getItem('enlaces_v1');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('más recientes');
  const [nombreRed, setNombreRed] = useState('LinkedIn');
  const [nuevaUrl, setNuevaUrl] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [usuario] = useState<any>(() => {
    const data = JSON.parse(localStorage.getItem('usuario') || '{}');
    return { nombre: "Eliana", apellido_paterno: "Martinez", profesion: "Ingeniera de Software", ...data };
  });

  useEffect(() => {
    if (urlInputRef.current) urlInputRef.current.scrollLeft = 0;
  }, [nuevaUrl]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreRed || !nuevaUrl) return alert('Completa todos los campos.');
    if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(nuevaUrl)) return alert('URL no válida.');

    const newLink = { id: Date.now().toString(), nombre_red: nombreRed, url_red: nuevaUrl, created_at: new Date().toISOString() };
    const updated = [newLink, ...links];
    setLinks(updated);
    localStorage.setItem('enlaces_v1', JSON.stringify(updated));
    setIsModalOpen(false); setNombreRed('LinkedIn'); setNuevaUrl('');
    setIsSuccessModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('¿Eliminar?')) return;
    const updated = links.filter(l => l.id !== id);
    setLinks(updated);
    localStorage.setItem('enlaces_v1', JSON.stringify(updated));
  };

  const sortedLinks = [...links].sort((a, b) => {
    const tA = new Date(a.created_at).getTime();
    const tB = new Date(b.created_at).getTime();
    return sortBy === 'más recientes' ? tB - tA : tA - tB;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-inter text-black">
      <header className="bg-[#2E3A4D] text-white py-[6px] px-8 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-6"><div className="w-[34px] h-[42px]" /><h1 className="text-[32px] font-bold">Sistema de Portafolios Digitales</h1></div>
      </header>
      <nav className="bg-[#1D4A76] text-white py-[14px] px-8 flex items-center border-t border-white/5 shrink-0">
        <div className="w-64" /><div className="flex-1 flex justify-center gap-20 text-[18px] font-semibold">
          <span onClick={() => navigate('/')} className="cursor-pointer opacity-80 hover:opacity-100 transition">Inicio</span>
          <span onClick={() => navigate('/perfil')} className="cursor-pointer opacity-80 hover:opacity-100 transition">Mi perfil</span>
          <span onClick={() => navigate('/mis-proyectos')} className="cursor-pointer hover:opacity-10 transition">Mis proyectos</span>
        </div>
      </nav>
      <div className="bg-[#2E3A4D] text-gray-200 py-2.5 px-8 text-[14px] flex gap-3 shadow-md border-b border-black/10 shrink-0">
        <span className="hover:underline cursor-pointer">Navegación</span> &gt; <span className="hover:underline cursor-pointer" onClick={() => navigate('/perfil')}>Mi perfil</span> &gt; <span className="font-semibold text-white uppercase">Enlaces</span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[280px] bg-[#1D4A76] text-white flex flex-col items-center py-12 shadow-inner shrink-0">
          <div className="w-32 h-32 rounded-full border-2 border-white/20 bg-white/5 mb-6 flex items-center justify-center"><div className="w-28 h-28 rounded-full bg-white/10" /></div>
          <h2 className="text-[20px] font-bold">{usuario.nombre} {usuario.apellido_paterno}</h2>
          <p className="text-[15px] text-blue-100 font-medium mb-12 opacity-80">{usuario.profesion}</p>
          <div className="w-full">
            <button onClick={() => navigate('/')} className="flex items-center w-full pl-[50px] py-3 hover:bg-white/10 transition"><Home className="w-7 h-7 mr-4" /> Inicio</button>
            <button className="flex items-center w-full pl-[50px] py-3 hover:bg-white/10 transition"><Settings className="w-7 h-7 mr-4" /> Ajustes</button>
          </div>
        </aside>
        <main className="flex-1 p-8 px-12 overflow-y-auto">
          <div className="flex justify-between items-start mb-6 text-black">
            <div><h2 className="text-[26px] font-bold text-gray-900 mb-2">{usuario.nombre} {usuario.apellido_paterno}</h2><p className="text-gray-500 text-[15px] max-w-3xl font-medium">{usuario.biografia || 'Apasionada por las creaciones de aplicaciones web...'}</p></div>
            <button onClick={() => navigate('/perfil')} className="bg-[#1F4E79] text-white px-6 py-2 rounded-full text-[14px] font-bold shadow-md hover:bg-opacity-90 active:scale-95 transition">Editar Perfil</button>
          </div>
          <div className="flex gap-8 mb-6 text-[14px] text-gray-500 font-medium">
            <span className="flex items-center gap-2"><Mail size={18} /> {usuario.email}</span>
            <span className="flex items-center gap-2"><MapPin size={18} /> {usuario.ciudad || 'Cochabamba'}</span>
            <span className="flex items-center gap-2"><GraduationCap size={20} /> {usuario.institucion || 'UMSS'}</span>
          </div>
          <div className="bg-white rounded-full px-10 py-[10px] flex gap-24 items-center text-[15px] shadow-sm mb-6 border border-gray-100">
            <button onClick={() => navigate('/mis-proyectos')} className="text-gray-500 font-semibold hover:text-gray-800 transition">Proyectos</button>
            <button onClick={() => navigate('/habilidades')} className="text-gray-500 font-semibold hover:text-gray-800 transition">Habilidades</button>
            <button className="text-blue-900 font-bold border-b-2 border-blue-900">Enlaces</button>
          </div>
          <div className="flex justify-end gap-5 mb-5 items-center">
            <button onClick={() => setIsModalOpen(true)} className="bg-[#1F4E79] text-white px-5 py-2 rounded-[14px] font-bold shadow-md hover:opacity-90 transition">+ Añadir Enlace</button>
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border rounded-full pl-4 pr-9 py-2 text-[14px] text-gray-500 font-semibold cursor-pointer appearance-none outline-none">
                <option>más recientes</option><option>más antiguas</option>
              </select><ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 mb-20">{sortedLinks.map(l => (
            <div key={l.id} className="bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm group">
              <div className="flex justify-between items-start mb-3"><div className="flex items-center gap-2.5 text-[#1F4E79] font-bold"><Globe size={20} /><span>{l.nombre_red}</span></div>
                <button onClick={() => handleDelete(l.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
              </div><a href={l.url_red} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-[14px] truncate block w-full">{l.url_red}</a>
            </div>
          ))}{links.length === 0 && <div className="col-span-2 text-center py-20 text-gray-400 font-medium text-black">No hay enlaces añadidos aún.</div>}</div>
        </main>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-10 m-4 relative animate-in fade-in zoom-in duration-200">
            <h2 className="text-[22px] font-bold text-gray-900 mb-8">Añadir Enlace</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <div><label className="block text-[14px] font-bold text-gray-700 mb-2">Plataforma</label>
                <div className="relative">
                  <select value={nombreRed} onChange={(e) => setNombreRed(e.target.value)} className="w-full px-4 py-3 bg-white text-black border rounded-[14px] focus:ring-2 focus:ring-[#1F4E79] outline-none appearance-none cursor-pointer">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="GitHub">GitHub</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter / X</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>
              <div><label className="block text-[14px] font-bold text-gray-700 mb-2">URL</label>
                <input ref={urlInputRef} required value={nuevaUrl} onFocus={(e) => e.target.scrollLeft = 0} onBlur={(e) => e.target.scrollLeft = 0} onChange={(e) => setNuevaUrl(e.target.value)} placeholder="github.com/usuario" className="w-full px-4 py-3 bg-white text-black border rounded-[14px] focus:ring-2 focus:ring-[#1F4E79] outline-none" />
              </div>
              <div className="flex justify-end gap-4 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-[#E5E7EB] text-gray-600 font-bold rounded-[14px] hover:bg-gray-300 transition">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-[#1F4E79] text-white font-bold rounded-[14px] shadow-lg transition active:scale-95 hover:opacity-90">Guardar Enlace</button>
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
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
            <h3 className="text-[24px] font-extrabold text-gray-900 mb-3">Enlace añadido con éxito</h3>
            <p className="text-gray-500 text-[16px] font-medium mb-10 leading-relaxed">Su nuevo enlace se ha añadido con éxito</p>
            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-[#1F4E79] hover:opacity-90 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all active:scale-95">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}