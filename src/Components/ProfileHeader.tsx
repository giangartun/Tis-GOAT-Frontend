import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, MapPin, GraduationCap } from 'lucide-react';

interface Usuario {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  profesion?: string;
  email?: string;
  ciudad?: string;
  pais?: string;
  institucion?: string;
}

const getFullName = (u?: Usuario) => {
  if (!u) return 'Cargando...';
  return [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' ');
};

interface ProfileHeaderProps {
  usuario: Usuario;
  children: React.ReactNode;
}

export default function ProfileHeader({ usuario, children }: ProfileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-col font-inter">
      <main className="flex-1 overflow-y-auto pt-12 pb-20">
        <div className="max-w-[1240px] mx-auto flex flex-col shadow-2xl rounded-[16px] overflow-hidden">
          {/* Header Superior Azul */}
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
                      <Mail size={16} /> {usuario.email || 'correo@ejemplo.com'}
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

          {/* Nav Tabs Blancos */}
          <div className="bg-white px-12 flex items-center border-b border-gray-100 shadow-sm text-[15px]">
            <button
              onClick={() => navigate('/mis-proyectos')}
              className={`py-5 px-4 font-extrabold transition-all border-b-2 mr-6 ${
                currentPath === '/mis-proyectos'
                  ? 'text-blue-900 border-[#1F4E79]'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              Proyectos
            </button>
            <button
              onClick={() => navigate('/habilidades')}
              className={`py-5 px-4 font-extrabold transition-all border-b-2 mr-6 ${
                currentPath === '/habilidades'
                  ? 'text-blue-900 border-[#1F4E79]'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              Habilidades
            </button>
            <button
              onClick={() => navigate('/enlaces')}
              className={`py-5 px-4 font-extrabold transition-all border-b-2 ${
                currentPath === '/enlaces'
                  ? 'text-blue-900 border-[#1F4E79]'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              Enlaces
            </button>
          </div>

          {/* Contenido Principal (Background Blanco o Gris Claro según vista) */}
          <div className="bg-white p-12 lg:p-16 flex flex-col items-stretch">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
