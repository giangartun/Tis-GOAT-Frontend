import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Habilidad {
  nombre: string;
}

interface Usuario {
  nombre: string;
  profesion: string;
  foto: string | null;
  ubicacion: string | null;
}

interface Portafolio {
  id_portafolio: string;
  enlace_pagi_web: string;
  usuario: Usuario;
  habilidades: Habilidad[];
}

function Home() {
  const navigate = useNavigate();

  const [portafolios, setPortafolios] = useState<Portafolio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/portafolios/publicos", {
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los perfiles");
        return res.json();
      })
      .then((data) => {
        setPortafolios(Array.isArray(data) ? data : []);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <section className="bg-app-bg px-6 py-6">
        <p className="text-sm text-app-muted">Cargando perfiles...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-app-bg px-6 py-6">
        <p className="text-sm text-red-500">{error}</p>
      </section>
    );
  }

  return (
    <section className="bg-app-bg px-6 py-6">
      {/* Buscador */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface px-4 py-3">
        <Search size={18} className="text-app-muted" />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-app-muted"
        />
      </div>

      {/* Texto */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-app-text">
          ¡Hola de nuevo! Explora nuevos perfiles y amplía tus conexiones
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-app-muted">
          Descubre otros perfiles de desarrolladores y conecta con colegas del sector tecnológico.
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {portafolios.map((portafolio) => (
          <article
            key={portafolio.id_portafolio}
            className="flex items-center justify-between rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">

              {/* Foto */}
              {portafolio.usuario?.foto ? (
                <img
                  src={portafolio.usuario.foto}
                  alt={portafolio.usuario.nombre}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-app-card text-lg font-bold text-app-text">
                  {portafolio.usuario?.nombre?.charAt(0) || "?"}
                </div>
              )}

              {/* Info */}
              <div>
                <h3 className="text-base font-semibold text-app-text">
                  {portafolio.usuario?.nombre || "Usuario"}
                </h3>

                <p className="text-sm text-app-muted">
                  {portafolio.usuario?.profesion ?? "Sin profesión"}
                </p>

                <p className="text-xs text-app-muted">
                  {portafolio.usuario?.ubicacion ?? ""}
                </p>

                {/* Habilidades */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {portafolio.habilidades?.map((habilidad) => (
                    <span
                      key={habilidad.nombre}
                      className="rounded-full border border-app-border bg-app-card px-3 py-1 text-xs text-app-text"
                    >
                      {habilidad.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTÓN CORREGIDO 🔥 */}
            <button
              onClick={() => navigate(`/perfil-publico/${portafolio.id_portafolio}`)}
              className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-medium transition hover:bg-zinc-200"
            >
              Ver perfil
            </button>
          </article>
        ))}

        {portafolios.length === 0 && (
          <p className="text-sm text-app-muted">
            No hay perfiles disponibles.
          </p>
        )}
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