import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

  cantidad_proyectos?: number;
  total_proyectos?: number;
  proyectos_count?: number;
  numero_proyectos?: number;
  proyectos?: unknown[];
}

const AREAS_PROFESIONALES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Mobile",
  "UX/UI",
  "Data Science",
  "Ciberseguridad",
  "DevOps",
  "QA Testing",
  "Bases de Datos",
] as const;

type AreaProfesional = (typeof AREAS_PROFESIONALES)[number];

const PALABRAS_CLAVE_POR_AREA: Record<AreaProfesional, string[]> = {
  Frontend: [
    "frontend",
    "front end",
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "angular",
    "vue",
    "tailwind",
    "bootstrap",
  ],
  Backend: [
    "backend",
    "back end",
    "java",
    "python",
    "php",
    "node",
    "node.js",
    "express",
    "laravel",
    "spring",
    "django",
    "api",
  ],
  "Full Stack": [
    "full stack",
    "fullstack",
    "frontend",
    "backend",
    "react",
    "node",
    "laravel",
    "javascript",
    "typescript",
    "mysql",
    "mongodb",
  ],
  Mobile: [
    "mobile",
    "movil",
    "móvil",
    "android",
    "ios",
    "flutter",
    "react native",
    "kotlin",
    "swift",
    "dart",
  ],
  "UX/UI": [
    "ux",
    "ui",
    "ux/ui",
    "diseñador ux",
    "diseñador ui",
    "figma",
    "adobe xd",
    "photoshop",
    "prototipo",
    "wireframe",
  ],
  "Data Science": [
    "data science",
    "ciencia de datos",
    "python",
    "sql",
    "power bi",
    "pandas",
    "numpy",
    "machine learning",
    "ia",
    "inteligencia artificial",
    "analista de datos",
  ],
  Ciberseguridad: [
    "ciberseguridad",
    "seguridad",
    "seguridad informática",
    "cybersecurity",
    "ethical hacking",
    "hacking ético",
    "pentesting",
    "linux",
    "redes",
  ],
  DevOps: [
    "devops",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "linux",
    "ci/cd",
    "jenkins",
    "gitlab",
    "deploy",
  ],
  "QA Testing": [
    "qa",
    "testing",
    "tester",
    "pruebas",
    "automatización",
    "selenium",
    "cypress",
    "jest",
    "postman",
  ],
  "Bases de Datos": [
    "bases de datos",
    "base de datos",
    "database",
    "sql",
    "mysql",
    "postgresql",
    "postgres",
    "mongodb",
    "oracle",
    "sqlite",
    "sql server",
  ],
};

const normalizarTexto = (texto: string | number | null | undefined) => {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const obtenerTextoBuscable = (portafolio: Portafolio) => {
  const habilidades = portafolio.habilidades
    ?.map((habilidad) => habilidad.nombre)
    .join(" ");

  return normalizarTexto(`
    ${portafolio.usuario?.nombre ?? ""}
    ${portafolio.usuario?.profesion ?? ""}
    ${portafolio.usuario?.ubicacion ?? ""}
    ${habilidades ?? ""}
  `);
};

const obtenerTextoProfesional = (portafolio: Portafolio) => {
  const habilidades = portafolio.habilidades
    ?.map((habilidad) => habilidad.nombre)
    .join(" ");

  return normalizarTexto(`
    ${portafolio.usuario?.profesion ?? ""}
    ${habilidades ?? ""}
  `);
};

const obtenerCantidadProyectos = (portafolio: Portafolio) => {
  if (typeof portafolio.cantidad_proyectos === "number") {
    return portafolio.cantidad_proyectos;
  }

  if (typeof portafolio.total_proyectos === "number") {
    return portafolio.total_proyectos;
  }

  if (typeof portafolio.proyectos_count === "number") {
    return portafolio.proyectos_count;
  }

  if (typeof portafolio.numero_proyectos === "number") {
    return portafolio.numero_proyectos;
  }

  if (Array.isArray(portafolio.proyectos)) {
    return portafolio.proyectos.length;
  }

  return 0;
};

function Home() {
  const navigate = useNavigate();

  const [portafolios, setPortafolios] = useState<Portafolio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [cantidadVisible, setCantidadVisible] = useState(5);

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

  useEffect(() => {
    setCantidadVisible(5);
  }, [busqueda, areaSeleccionada]);

  const portafoliosFiltrados = useMemo(() => {
    const textoBusqueda = normalizarTexto(busqueda);

    return [...portafolios]
      .sort(
        (a, b) =>
          obtenerCantidadProyectos(b) - obtenerCantidadProyectos(a)
      )
      .filter((portafolio) => {
        const textoBuscable = obtenerTextoBuscable(portafolio);
        const textoProfesional = obtenerTextoProfesional(portafolio);

        const coincideBusqueda =
          textoBusqueda === "" || textoBuscable.includes(textoBusqueda);

        const coincideArea =
          areaSeleccionada === "" ||
          PALABRAS_CLAVE_POR_AREA[
            areaSeleccionada as AreaProfesional
          ].some((palabraClave) =>
            textoProfesional.includes(normalizarTexto(palabraClave))
          );

        return coincideBusqueda && coincideArea;
      });
  }, [portafolios, busqueda, areaSeleccionada]);

  const portafoliosVisibles = portafoliosFiltrados.slice(0, cantidadVisible);

  const hayMasPerfiles = cantidadVisible < portafoliosFiltrados.length;

  const limpiarFiltros = () => {
    setBusqueda("");
    setAreaSeleccionada("");
    setCantidadVisible(5);
  };

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
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, profesión o habilidad..."
          className="w-full bg-transparent text-sm text-app-text outline-none placeholder:text-app-muted"
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

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative inline-flex items-center">
          <select
            value={areaSeleccionada}
            onChange={(e) => setAreaSeleccionada(e.target.value)}
            className="h-12 appearance-none rounded-2xl border border-app-border bg-app-surface px-4 pr-11 text-sm font-medium text-app-text outline-none transition hover:bg-app-card"
          >
            <option value="">Área profesional</option>
            {AREAS_PROFESIONALES.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-app-muted"
          />
        </div>

        <button
          type="button"
          onClick={limpiarFiltros}
          className="h-12 rounded-2xl border border-app-border bg-app-surface px-5 text-sm font-medium text-app-text transition hover:bg-app-card"
        >
          Limpiar filtro
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {portafoliosVisibles.map((portafolio) => (
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

            <button
              onClick={() =>
                navigate(`/perfil-publico/${portafolio.id_portafolio}`)
              }
              className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-medium text-app-text transition hover:bg-zinc-200"
            >
              Ver perfil
            </button>
          </article>
        ))}

        {portafoliosVisibles.length === 0 && (
          <p className="text-sm text-app-muted">
            No hay perfiles disponibles con los filtros seleccionados.
          </p>
        )}
      </div>

      {/* Ver más perfiles */}
      {hayMasPerfiles && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setCantidadVisible((prev) => prev + 5)}
            className="rounded-full border border-app-border bg-app-card px-5 py-2 text-sm font-medium text-app-text transition hover:bg-zinc-200"
          >
            Ver más perfiles
          </button>
        </div>
      )}
    </section>
  );
}

export default Home;