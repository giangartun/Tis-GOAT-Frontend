import { useEffect, useState } from "react";
import NuevoProyectoModal from "../Components/NuevoProyectoModal";
import {
  actualizarProyecto,
  crearProyecto,
  listarProyectos,
} from "../Services/proyectos";

type ProyectoLocal = {
  nombre: string;
  descripcion: string;
  github: string;
  demo: string;
  fechaInicio: string;
  fechaFin: string;
  tecnologias: string;
  imagen: string;
};

type Tecnologia = {
  id_tecnologia?: string;
  id?: string;
  nombre?: string;
  nombre_tecnologia?: string;
};

type Proyecto = {
  id_proyecto: string;
  nombre: string;
  descripcion: string | null;
  url_proyecto: string | null;
  imagen_url: string | null;
  fecha_ini: string;
  fecha_fin: string | null;
  demo?: string | null;
  tecnologias?: Tecnologia[];
};

function MisProyectos() {
  const [isOpen, setIsOpen] = useState(false);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const idPortafolio = localStorage.getItem("id_portafolio") ?? "";

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return new Intl.DateTimeFormat("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        if (!idPortafolio) return;

        const data = await listarProyectos(idPortafolio);
        setProyectos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      }
    };

    cargar();
  }, [idPortafolio]);

  const handleEditar = (proyecto: Proyecto) => {
    setProyectoEditando(proyecto);
    setIsOpen(true);
  };

  const cerrarModal = () => {
    setIsOpen(false);
    setProyectoEditando(null);
  };

  const handleSave = async (form: ProyectoLocal) => {
    try {
      setSuccessMessage("");
      setErrorMessage("");

      const tecnologiasIds =
        proyectoEditando?.tecnologias
          ?.map((tec) => tec.id_tecnologia ?? tec.id)
          .filter((id): id is string => Boolean(id)) ?? [];

      const payload = {
        id_portafolio: idPortafolio,
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        url_proyecto: form.github || null,
        imagen_url: form.imagen || null,
        fecha_ini: form.fechaInicio,
        fecha_fin: form.fechaFin || null,
        tecnologias: tecnologiasIds,
      };

      console.log("PAYLOAD:", payload);

      if (proyectoEditando) {
        const response = await actualizarProyecto(
          proyectoEditando.id_proyecto,
          payload
        );

        const actualizado = response.data?.data ?? response.data;

        setProyectos((prev) =>
          prev.map((p) =>
            p.id_proyecto === proyectoEditando.id_proyecto
              ? { ...actualizado, demo: form.demo }
              : p
          )
        );

        setSuccessMessage("Proyecto actualizado correctamente.");
      } else {
        const response = await crearProyecto(payload);
        const nuevo = response.data?.data ?? response.data;

        setProyectos((prev) => [...prev, { ...nuevo, demo: form.demo }]);

        setSuccessMessage("Proyecto guardado correctamente.");
      }

      cerrarModal();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Error guardando proyecto:", error?.response?.data || error);

      setErrorMessage(
        error?.response?.data?.message ||
          "No se pudo guardar el proyecto. Revisa los datos."
      );

      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  return (
    <section className="min-h-screen bg-white px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-app-text">
            Mis Proyectos
          </h1>
          <p className="mt-1 text-base text-app-muted">
            Gestiona y organiza tus proyectos de software
          </p>
        </div>

        <button
          onClick={() => {
            setProyectoEditando(null);
            setIsOpen(true);
          }}
          className="rounded-full bg-app-topbar px-6 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-xl border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-8 space-y-4">
        {proyectos.length === 0 ? (
          <p className="text-gray-500">No tienes proyectos aún.</p>
        ) : (
          proyectos.map((proyecto) => (
            <div
              key={proyecto.id_proyecto}
              className="overflow-hidden rounded-2xl border border-[#1f7fd1] bg-app-surface shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-5 p-5 lg:flex-row">
                <div className="flex h-36 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-100 text-center text-sm text-gray-400 lg:w-36">
                  {proyecto.imagen_url ? (
                    <img
                      src={proyecto.imagen_url}
                      alt={proyecto.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>Captura o portada del proyecto</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {proyecto.nombre}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {proyecto.descripcion || "Sin descripción"}
                  </p>

                  <div className="mt-3 space-y-1 text-sm">
                    {proyecto.url_proyecto && (
                      <a
                        href={proyecto.url_proyecto}
                        target="_blank"
                        rel="noreferrer"
                        className="block font-medium text-blue-600 hover:underline"
                      >
                        Link GitHub
                      </a>
                    )}

                    {proyecto.demo && (
                      <a
                        href={proyecto.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="block font-medium text-blue-600 hover:underline"
                      >
                        Link Demo
                      </a>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-6 text-xs text-gray-400">
                    <span>
                      Fecha de inicio: {formatFecha(proyecto.fecha_ini)}
                    </span>
                    <span>Fecha de fin: {formatFecha(proyecto.fecha_fin)}</span>
                  </div>

                  {proyecto.tecnologias && proyecto.tecnologias.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {proyecto.tecnologias.map((tec, index) => {
                        const nombre =
                          tec.nombre || tec.nombre_tecnologia || "Tecnología";

                        return (
                          <span
                            key={index}
                            className="rounded-full border border-app-border bg-app-card px-3 py-1 text-xs font-medium text-app-text"
                          >
                            {nombre}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-end">
                  <button
                    onClick={() => handleEditar(proyecto)}
                    className="rounded-full bg-blue-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <NuevoProyectoModal
        isOpen={isOpen}
        onClose={cerrarModal}
        onSave={handleSave}
        proyectoInicial={
          proyectoEditando
            ? {
                nombre: proyectoEditando.nombre,
                descripcion: proyectoEditando.descripcion ?? "",
                github: proyectoEditando.url_proyecto ?? "",
                demo: proyectoEditando.demo ?? "",
                fechaInicio: proyectoEditando.fecha_ini
                  ? proyectoEditando.fecha_ini.slice(0, 10)
                  : "",
                fechaFin: proyectoEditando.fecha_fin
                  ? proyectoEditando.fecha_fin.slice(0, 10)
                  : "",
                tecnologias: "",
                imagen: proyectoEditando.imagen_url ?? "",
              }
            : null
        }
      />
    </section>
  );
}

export default MisProyectos;