import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Home, Settings, UserRound, LogOut } from "lucide-react";

interface Usuario {
  nombre?: string;
  apellido_paterno?: string;
  email?: string;
}

function Layout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(import.meta.env.VITE_API_URL+'/api/usuario/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('portafolio');
      setUsuario(null);
      setLoadingLogout(false);
      navigate('/login');
    }
  };

  const nombreCompleto = usuario 
    ? `${usuario.nombre || ''} ${usuario.apellido_paterno || ''}`.trim()
    : '';

  return (
    <div className="min-h-screen bg-app-bg font-inter text-app-text">
      {loadingLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] pointer-events-auto">
          <div className="flex flex-col items-center gap-3">
            {/* Spinner moderno */}
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white"></div>
            </div>
            <p className="text-white text-sm tracking-wide">
              Cerrando sesión...
            </p>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-app-border bg-app-header px-6 py-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm font-bold">
            TG
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sistema de Portafolios Digitales
          </h1>
        </div>

        {/* Botones de usuario */}
        {usuario ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{nombreCompleto}</p>
              <p className="text-xs text-white/70">{usuario.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              <UserRound size={18} />
              Registrarse
            </button>
          </div>
        )}
      </header>

      <nav className="flex items-center justify-center border-b border-app-border bg-app-topbar px-6 py-3 text-sm text-white">
        <div className="flex gap-8 font-medium">
          <Link to="/" className="hover:text-white/80 transition">Inicio</Link>
          <Link to="/perfil" className="hover:text-white/80 transition">Mi perfil</Link>
          <Link to="/mis-proyectos" className="hover:text-white/80 transition">Mis proyectos</Link>
        </div>
      </nav>

      <nav className="border-b border-app-border bg-app-surface px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-app-muted">
          <Link to="/" className="hover:text-app-text">Inicio</Link>
          <span>&gt;</span>
          <span className="text-app-text">Navegación</span>
        </div>
      </nav>

      <main className="grid min-h-[calc(100vh-180px)] grid-cols-[88px_1fr_360px]">
        <aside className="flex flex-col items-center gap-6 border-r border-app-border bg-app-sidebar py-6 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <UserRound size={22} />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Home size={22} />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Settings size={22} />
          </div>
        </aside>

        <section className="overflow-auto">
          <Outlet />
        </section>

        <aside className="border-l border-app-border bg-app-surface px-5 py-6">
          <div className="rounded-2xl border border-app-border bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Artículos y notificaciones</h3>
              <a href="#" className="text-xs text-app-muted hover:text-app-text">
                Ver todos
              </a>
            </div>
            <div className="h-40 rounded-xl bg-app-card" />
            <h4 className="mt-4 text-base font-semibold">
              Mejores prácticas de desarrollo web
            </h4>
            <p className="mt-2 text-sm text-app-muted">
              Descubre técnicas y conceptos para mejorar tus habilidades de desarrollo web.
            </p>
          </div>
        </aside>
      </main>

      <footer className="border-t border-app-border bg-app-header px-6 py-4 text-center text-white">
        <div className="flex flex-col items-center justify-center gap-1 text-sm">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>© 2026 Generation Of Advanced Technology</span>
            <span className="text-white/40">|</span>
            <a href="#" className="hover:text-white/80">Términos de uso</a>
            <a href="#" className="hover:text-white/80">Política de privacidad</a>
          </div>
          <p className="text-xs text-white/70">
            Cochabamba, Bolivia | Universidad Mayor de San Simón
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;