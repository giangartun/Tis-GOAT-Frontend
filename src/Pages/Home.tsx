import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

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

function Home() {
  const navigate = useNavigate();
  return (
    <section className="bg-app-bg px-6 py-6">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface px-4 py-3">
        <Search size={18} className="text-app-muted" />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-app-muted"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-app-text">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-app-card text-lg font-bold text-app-text">
                {profile.name.charAt(0)}
              </div>

              <div>
                <h3 className="text-base font-semibold text-app-text">
                  {profile.name}
                </h3>
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

            <button 
              onClick={() => navigate('/perfil')}
              className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-medium transition hover:bg-zinc-200"
            >
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
  );
}

export default Home;