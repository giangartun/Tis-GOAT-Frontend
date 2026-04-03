import { Home, Search, Settings, UserRound } from "lucide-react";

const profiles = [
  {
    name: "Carlos Sanchez",
    role: "Ingeniero Frontend",
    location: "Medellín, CO",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    name: "Lucía Torres",
    role: "Desarrolladora Full Stack",
    location: "Argentina, AR",
    tags: ["Vue.js", "Node.js", "JavaScript"],
  },
  {
    name: "Gabriel Rojas",
    role: "Desarrollador Full Stack",
    location: "Santiago, CL",
    tags: ["Vue.js", "Node.js", "JavaScript"],
  },
];

function App() {
  return (
    <div className="min-h-screen bg-app-bg font-inter text-app-text">
      {/* Header superior */}
      <header className="flex items-center justify-between border-b border-app-border bg-app-header px-6 py-4 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm font-bold">
            TG
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sistema de Portafolios Digitales
          </h1>
        </div>

        <button className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20">
          <UserRound size={18} />
          Registrarse
        </button>
      </header>

      {/* Barra horizontal de menú */}
      <nav className="flex items-center justify-center border-b border-app-border bg-app-topbar px-6 py-3 text-sm text-white">
        <div className="flex gap-8 font-medium">
          <a href="#" className="text-white hover:text-white/80">
            Inicio
          </a>
          <a href="#" className="text-white/90 hover:text-white">
            Mi perfil
          </a>
          <a href="#" className="text-white/90 hover:text-white">
            Mis proyectos
          </a>
        </div>
      </nav>

      {/* Barra secundaria */}
      <nav className="border-b border-app-border bg-app-surface px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-app-muted">
          <a href="#" className="hover:text-app-text">
            Inicio
          </a>
          <span>&gt;</span>
          <span className="text-app-text">Navegación</span>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="grid min-h-[calc(100vh-180px)] grid-cols-[88px_1fr_360px]">
        {/* Sidebar izquierdo */}
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

        {/* Zona central */}
        <section className="overflow-auto bg-app-bg px-6 py-6">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface px-4 py-3">
            <Search size={18} className="text-app-muted" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-app-muted"
            />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              ¡Hola de nuevo! Explora nuevos perfiles y amplía tus conexiones
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-app-muted">
              Descubre otros perfiles de desarrolladores y conecta con colegas del sector tecnológico.
            </p>
          </div>

          <div className="space-y-4">
            {profiles.map((profile) => (
              <article
                key={profile.name}
                className="flex items-center justify-between rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-app-card text-lg font-bold">
                    {profile.name.charAt(0)}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold">{profile.name}</h3>
                    <p className="text-sm text-app-muted">{profile.role}</p>
                    <p className="text-xs text-app-muted">{profile.location}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-app-border bg-app-card px-3 py-1 text-xs text-app-text"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-medium transition hover:bg-zinc-200">
                  Ver perfil
                </button>
              </article>
            ))}
          </div>

          <div className="mt-6 text-right text-sm text-app-muted">
            <a href="#" className="hover:text-app-text">
              Ver más perfiles
            </a>
          </div>
        </section>

        {/* Panel derecho */}
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
            <p className="mt-4 text-xs text-app-muted">Hace 3 días</p>
          </div>

          <div className="mt-5 rounded-2xl border border-app-border bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Enlaces amigos</h3>
              <a href="#" className="text-xs text-app-muted hover:text-app-text">
                Ver todos
              </a>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-app-border bg-app-card p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-border text-white">
                <span className="text-sm font-bold">A</span>
              </div>
              <div>
                <p className="text-sm font-medium">Consejos para entrevistas técnicas</p>
                <p className="text-xs text-app-muted">
                  Prepárate mejor para tus entrevistas de trabajo.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer / Copyright */}
      <footer className="border-t border-app-border bg-app-header px-6 py-4 text-center text-white">
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

export default App;