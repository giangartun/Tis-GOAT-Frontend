import i18n from "../locales/i18n";
import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  Home,
  Settings,
  UserRound,
  LogOut,
  Menu,
  X,
  Palette,
  Globe2,
  ChevronDown,
  Check,
} from "lucide-react";

interface Usuario {
  nombre?: string;
  apellido_paterno?: string;
  email?: string;
}

type CodigoIdioma = "ES" | "FR" | "EN";

interface Idioma {
  codigo: CodigoIdioma;
  nombre: string;
  bandera: string;
}

const idiomas: Idioma[] = [
  { codigo: "ES", nombre: "Español", bandera: "🇪🇸" },
  { codigo: "FR", nombre: "Francés", bandera: "🇫🇷" },
  { codigo: "EN", nombre: "Inglés", bandera: "🇺🇸" },
];

const obtenerUsuario = (): Usuario | null => {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
};

const obtenerIdiomaInicial = (): Idioma => {
  const idiomaGuardado = localStorage.getItem("idioma") as CodigoIdioma | null;
  return idiomas.find((idioma) => idioma.codigo === idiomaGuardado) || idiomas[0];
};

function SelectorIdioma() {
  const [abierto, setAbierto] = useState(false);
  const [idiomaActual, setIdiomaActual] = useState<Idioma>(obtenerIdiomaInicial);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cerrarDropdown = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", cerrarDropdown);
    return () => document.removeEventListener("mousedown", cerrarDropdown);
  }, []);

  const cambiarIdioma = (idioma: Idioma) => {
    setIdiomaActual(idioma);
    localStorage.setItem("idioma", idioma.codigo);
    i18n.changeLanguage(idioma.codigo);
    setAbierto(false);
  };

  return (
    <div ref={selectorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        <Globe2 size={17} />
        <span>{idiomaActual.codigo}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 text-gray-800 shadow-xl">
          {idiomas.map((idioma) => (
            <button
              key={idioma.codigo}
              type="button"
              onClick={() => cambiarIdioma(idioma)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{idioma.bandera}</span>
                <span>{idioma.nombre}</span>
              </div>

              {idiomaActual.codigo === idioma.codigo && (
                <Check size={17} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const esPerfil = location.pathname === "/perfil";

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setUsuario(obtenerUsuario());
  }, []);

  const nombreCompleto = usuario
    ? `${usuario.nombre || ""} ${usuario.apellido_paterno || ""}`.trim()
    : "";

  const haySesion = Boolean(usuario && localStorage.getItem("token"));

  const cerrarSesion = async () => {
    setLoadingLogout(true);

    try {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/usuario/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("id_portafolio");

      setUsuario(null);
      setLoadingLogout(false);
      navigate("/login");
    }
  };

  const enlacesUsuario = (
    <>
      <Link to="/perfil" className="transition hover:text-white/80">
        Mi perfil
      </Link>

      <Link to="/mis-proyectos" className="transition hover:text-white/80">
        Mis proyectos
      </Link>

      <Link to="/portafolio" className="transition hover:text-white/80">
        Portafolio
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-app-bg font-inter text-app-text">
      {loadingLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-white/30" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white" />
            </div>

            <p className="text-sm tracking-wide text-white">
              Cerrando sesión...
            </p>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-4 border-b border-app-border bg-app-header px-4 py-4 text-white sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm font-bold sm:h-12 sm:w-12">
            TG
          </div>

          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Sistema de Portafolios Digitales
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {usuario && (
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium">{nombreCompleto}</p>
              <p className="text-xs text-white/70">{usuario.email}</p>
            </div>
          )}

          <SelectorIdioma />

          {usuario ? (
            <button
              onClick={cerrarSesion}
              className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Iniciar Sesión
              </button>

              <button
                onClick={() => navigate("/register")}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
              >
                <UserRound size={18} />
                Registrarse
              </button>
            </>
          )}
        </div>
      </header>

      <nav className="border-b border-app-border bg-app-topbar px-4 py-3 text-white sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center justify-start gap-6 overflow-x-auto whitespace-nowrap text-sm font-medium">
            <Link to="/" className="transition hover:text-white/80">
              Inicio
            </Link>

            {haySesion && enlacesUsuario}
          </div>

          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20 lg:hidden"
          >
            {menuAbierto ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuAbierto && (
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/10 p-3 text-sm lg:hidden">
            <Link to="/" className="transition hover:text-white/80">
              Inicio
            </Link>

            {haySesion && enlacesUsuario}
          </div>
        )}
      </nav>

      <nav className="border-b border-app-border bg-app-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-app-muted">
          <Link to="/" className="hover:text-app-text">
            Inicio
          </Link>

          <span>&gt;</span>

          <span className={esPerfil ? "font-semibold text-app-text" : "text-app-text"}>
            {esPerfil ? "Mi perfil" : "Navegación"}
          </span>
        </div>
      </nav>

      <main
        className={`min-h-[calc(100vh-180px)] ${
          esPerfil ? "flex flex-col" : "lg:grid lg:grid-cols-[88px_1fr_360px]"
        }`}
      >
        {!esPerfil && (
          <aside className="hidden border-r border-app-border bg-app-sidebar py-6 text-white lg:flex lg:flex-col lg:items-center lg:gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <UserRound size={22} />
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Home size={22} />
            </div>

            <Link
              to="/privacidad"
              title="Configuración de privacidad"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25"
            >
              <Settings size={22} />
            </Link>

            <button
              type="button"
              title="Personalización del portafolio"
              onClick={() => navigate("/personalizacion-portafolio")}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25"
            >
              <Palette size={22} />
            </button>
          </aside>
        )}

        <section className="flex-1 overflow-auto">
          <Outlet />
        </section>

        {!esPerfil && (
          <aside className="hidden border-l border-app-border bg-app-surface px-5 py-6 lg:block">
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
                Descubre técnicas y conceptos para mejorar tus habilidades de
                desarrollo web.
              </p>
            </div>
          </aside>
        )}
      </main>

      <footer className="border-t border-app-border bg-app-header px-4 py-4 text-center text-white sm:px-6">
        <div className="flex flex-col items-center justify-center gap-1 text-sm">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>© 2026 Generation Of Advanced Technology</span>
            <span className="text-white/40">|</span>

            <a href="#" className="hover:text-white/80">
              Términos de uso
            </a>

            <a href="#" className="hover:text-white/80">
              Política de privacidad
            </a>
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