import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Home, Search, Settings, UserRound } from "lucide-react";
import { Login } from './Pages/Login';
import { Register } from './Pages/Register';

// Tu componente Home (solo modificamos el botón para que navegue a /login)
function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-zinc-950 font-inter text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 text-sm font-bold">
            TG
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sistema de Portafolios Digitales
          </h1>
        </div>

        {/* Botón Registrarse - Ahora lleva a /login */}
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
        >
          <UserRound size={18} />
          Registrarse
        </button>
      </header>

      {/* Resto de tu home EXACTAMENTE IGUAL */}
      <nav className="flex items-center justify-center border-b border-zinc-800 bg-zinc-900/80 px-6 py-3 text-sm text-zinc-300">
        <div className="flex gap-8 font-medium">
          <a href="#" className="text-white hover:text-zinc-300">Inicio</a>
          <a href="#" className="hover:text-white">Mi perfil</a>
          <a href="#" className="hover:text-white">Mis proyectos</a>
        </div>
      </nav>

      <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <a href="#" className="hover:text-white">Inicio</a>
          <span>&gt;</span>
          <span className="text-zinc-200">Navegación</span>
        </div>
      </nav>

      <main className="grid min-h-[calc(100vh-180px)] grid-cols-[88px_1fr_360px]">
        <aside className="flex flex-col items-center gap-6 border-r border-zinc-800 bg-zinc-900 py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
            <UserRound size={22} />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
            <Home size={22} />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
            <Settings size={22} />
          </div>
        </aside>

        <section className="overflow-auto bg-zinc-950 px-6 py-6">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <Search size={18} className="text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              ¡Hola de nuevo! Explora nuevos perfiles y amplía tus conexiones
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Descubre otros perfiles de desarrolladores y conecta con colegas del sector tecnológico.
            </p>
          </div>

          <div className="space-y-4">
            {profiles.map((profile) => (
              <article key={profile.name} className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/20">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-700 text-lg font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{profile.name}</h3>
                    <p className="text-sm text-zinc-400">{profile.role}</p>
                    <p className="text-xs text-zinc-500">{profile.location}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700">
                  Ver perfil
                </button>
              </article>
            ))}
          </div>

          <div className="mt-6 text-right text-sm text-zinc-400">
            <a href="#" className="hover:text-white">Ver más perfiles</a>
          </div>
        </section>

        <aside className="border-l border-zinc-800 bg-zinc-900 px-5 py-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Artículos y notificaciones</h3>
              <a href="#" className="text-xs text-zinc-400 hover:text-white">Ver todos</a>
            </div>
            <div className="h-40 rounded-xl bg-zinc-800" />
            <h4 className="mt-4 text-base font-semibold">Mejores prácticas de desarrollo web</h4>
            <p className="mt-2 text-sm text-zinc-400">Descubre técnicas y conceptos para mejorar tus habilidades de desarrollo web.</p>
            <p className="mt-4 text-xs text-zinc-500">Hace 3 días</p>
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Enlaces amigos</h3>
              <a href="#" className="text-xs text-zinc-400 hover:text-white">Ver todos</a>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-700">
                <span className="text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-medium">Consejos para entrevistas técnicas</p>
                <p className="text-xs text-zinc-500">Prepárate mejor para tus entrevistas de trabajo.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-900 px-6 py-4 text-center">
        <div className="flex flex-col items-center justify-center gap-1 text-sm text-zinc-400">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>© 2026 Generation Of Advanced Technology</span>
            <span className="text-zinc-600">|</span>
            <a href="#" className="hover:text-white">Términos de uso</a>
            <a href="#" className="hover:text-white">Política de privacidad</a>
          </div>
          <p className="text-xs text-zinc-500">Cochabamba, Bolivia | Universidad Mayor de San Simón</p>
        </div>
      </footer>
    </div>
  );
}

const profiles = [
  { name: "Carlos Sanchez", role: "Ingeniero Frontend", location: "Medellín, CO", tags: ["React", "Node.js", "MongoDB"] },
  { name: "Lucía Torres", role: "Desarrolladora Full Stack", location: "Argentina, AR", tags: ["Vue.js", "Node.js", "JavaScript"] },
  { name: "Gabriel Rojas", role: "Desarrollador Full Stack", location: "Santiago, CL", tags: ["Vue.js", "Node.js", "JavaScript"] },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;