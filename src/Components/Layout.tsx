import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { getAnunciosPublicos } from "../Services/anunciosPublicos";
import type { Anuncio } from "../Services/admin";

interface Usuario {
  nombre?: string;
  apellido_paterno?: string;
  email?: string;
}

type CodigoIdioma = "ES" | "FR" | "EN";

interface Idioma {
  codigo: CodigoIdioma;
  nombreKey: string;
  bandera: string;
  i18nCode: string;
}

const idiomas: Idioma[] = [
  { codigo: "ES", nombreKey: "layout.languages.spanish", bandera: "🇪🇸", i18nCode: "es" },
  { codigo: "FR", nombreKey: "layout.languages.french", bandera: "🇫🇷", i18nCode: "fr" },
  { codigo: "EN", nombreKey: "layout.languages.english", bandera: "🇺🇸", i18nCode: "en" },
];

const obtenerUsuario = (): Usuario | null => {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
};

const obtenerIdiomaInicial = (): Idioma => {
  const langGuardado = localStorage.getItem("lang") || "es";
  return idiomas.find((idioma) => idioma.i18nCode === langGuardado) || idiomas[0];
};

function SelectorIdioma() {
  const { t, i18n } = useTranslation();

  const [abierto, setAbierto] = useState(false);
  const [idiomaActual, setIdiomaActual] = useState<Idioma>(obtenerIdiomaInicial);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const idiomaGuardado = localStorage.getItem("lang") || "es";
    const idiomaEncontrado =
      idiomas.find((idioma) => idioma.i18nCode === idiomaGuardado) || idiomas[0];

    setIdiomaActual(idiomaEncontrado);
    i18n.changeLanguage(idiomaGuardado);
  }, [i18n]);

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
    localStorage.setItem("lang", idioma.i18nCode);
    i18n.changeLanguage(idioma.i18nCode);
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
                <span>{t(idioma.nombreKey)}</span>
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const esHome = location.pathname === "/" || location.pathname === "/home";
  const esPerfil = location.pathname === "/perfil";

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loadingAnuncios, setLoadingAnuncios] = useState(false);

  useEffect(() => {
    setUsuario(obtenerUsuario());
  }, []);

  const cargarAnuncios = async () => {
  setLoadingAnuncios(true);
  try {
    const res = await getAnunciosPublicos();
    setAnuncios(res.anuncios);
  } catch (error) {
    console.error("Error al cargar anuncios:", error);
    setAnuncios([]);
  } finally {
    setLoadingAnuncios(false);
  }
  };

  useEffect(() => {
    cargarAnuncios();
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
        {t("layout.nav.my_profile")}
      </Link>

      <Link to="/mis-proyectos" className="transition hover:text-white/80">
        {t("layout.nav.my_projects")}
      </Link>

      <Link to="/portafolio" className="transition hover:text-white/80">
        {t("layout.nav.portfolio")}
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
              {t("layout.logout.loading")}
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
            {t("layout.system_name")}
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
              {t("layout.auth.logout")}
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                {t("layout.auth.login")}
              </button>

              <button
                onClick={() => navigate("/register")}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
              >
                <UserRound size={18} />
                {t("layout.auth.register")}
              </button>
            </>
          )}
        </div>
      </header>

      <nav className="border-b border-app-border bg-app-topbar px-4 py-3 text-white sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center justify-start gap-6 overflow-x-auto whitespace-nowrap text-sm font-medium">
            <Link to="/" className="transition hover:text-white/80">
              {t("layout.nav.home")}
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
              {t("layout.nav.home")}
            </Link>

            {haySesion && enlacesUsuario}
          </div>
        )}
      </nav>

      <nav className="border-b border-app-border bg-app-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-app-muted">
          <Link to="/" className="hover:text-app-text">
            {t("layout.nav.home")}
          </Link>

          <span>&gt;</span>

          <span className={esPerfil ? "font-semibold text-app-text" : "text-app-text"}>
            {esPerfil ? t("layout.nav.my_profile") : t("layout.nav.navigation")}
          </span>
        </div>
      </nav>

      {/* MAIN - Grid dinámico según la página */}
      <main
        className={`min-h-[calc(100vh-180px)] ${
          esPerfil 
            ? "flex flex-col" 
            : esHome 
              ? "lg:grid lg:grid-cols-[88px_1fr_360px]"  // Home: 3 columnas
              : "lg:grid lg:grid-cols-[88px_1fr]"        // Otras páginas: 2 columnas
        }`}
      >
        {/* Sidebar izquierdo - se muestra en todas las páginas excepto /perfil */}
        {!esPerfil && (
          <aside className="hidden border-r border-app-border bg-app-sidebar py-6 text-white lg:flex lg:flex-col lg:items-center lg:gap-6">
            <button
              onClick={() => navigate("/perfil")}
              disabled={!haySesion}
              title={t("layout.nav.my_profile")}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                haySesion
                  ? "bg-white/15 hover:bg-white/25"
                  : "bg-white/5 opacity-40 cursor-not-allowed"
              }`}
            >
              <UserRound size={22} />
            </button>

            <button
              onClick={() => navigate("/")}
              title={t("layout.nav.home")}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 transition hover:bg-white/25"
            >
              <Home size={22} />
            </button>

            <button
              onClick={() => navigate("/privacidad")}
              disabled={!haySesion}
              title={t("layout.sidebar.privacy_settings")}
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                haySesion
                  ? "bg-white/15 hover:bg-white/25"
                  : "bg-white/5 opacity-40 cursor-not-allowed"
              }`}
            >
              <Settings size={22} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/personalizacion-portafolio")}
              disabled={!haySesion}
              title={t("layout.sidebar.portfolio_customization")}
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                haySesion
                  ? "bg-white/15 hover:bg-white/25"
                  : "bg-white/5 opacity-40 cursor-not-allowed"
              }`}
            >
              <Palette size={22} />
            </button>
          </aside>
        )}

        <section className="flex-1 overflow-auto">
          <Outlet />
        </section>

        {/* Sección de anuncios - SOLO en el Home */}
        {esHome && (
          <aside className="hidden border-l border-app-border bg-app-surface px-5 py-6 lg:block">
            <div className="rounded-2xl border border-app-border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                  {t("layout.notifications.title")}
                </h3>

                {anuncios.length > 0 && (
                  <Link to="/anuncios" className="text-xs text-app-muted hover:text-app-text">
                    {t("layout.notifications.view_all")}
                  </Link>
                )}
              </div>

              {loadingAnuncios ? (
                <div className="space-y-3">
                  <div className="h-32 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                </div>
              ) : anuncios.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No hay anuncios disponibles</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {anuncios.slice(0, 3).map((anuncio) => (
                    <a
                      key={anuncio.id_anuncio}
                      href={anuncio.url_redireccion}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      {anuncio.foto_url && (
                        <div className="h-32 rounded-xl overflow-hidden mb-2">
                          <img
                            src={anuncio.foto_url}
                            alt={anuncio.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-app-text group-hover:text-blue-600 transition">
                        {anuncio.titulo}
                      </h4>
                      {anuncio.descripcion && (
                        <p className="mt-1 text-sm text-app-muted line-clamp-2">
                          {anuncio.descripcion}
                        </p>
                      )}
                      <span className="inline-block mt-2 text-xs text-blue-500 group-hover:underline">
                        {t("layout.notifications.read_more")}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </main>

      <footer className="border-t border-app-border bg-app-header px-4 py-4 text-center text-white sm:px-6">
        <div className="flex flex-col items-center justify-center gap-1 text-sm">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>{t("layout.footer.copyright")}</span>
            <span className="text-white/40">|</span>

            <a href="#" className="hover:text-white/80">
              {t("layout.footer.terms")}
            </a>

            <a href="#" className="hover:text-white/80">
              {t("layout.footer.privacy")}
            </a>
          </div>

          <p className="text-xs text-white/70">
            {t("layout.footer.location")}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;