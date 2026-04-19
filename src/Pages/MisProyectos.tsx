import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import NuevoProyectoModal from "../Components/NuevoProyectoModal";
import {
  actualizarProyecto,
  crearProyecto,
  eliminarProyecto,
  listarProyectos,
  listarTecnologias,
  type Tecnologia,
} from "../Services/proyectos";

type ProyectoLocal = {
  nombre: string;
  descripcion: string;
  github: string;
  demo: string;
  fechaInicio: string;
  fechaFin: string;
  tecnologias: string[];
  imagen: string;
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
  const [tecnologiasDisponibles, setTecnologiasDisponibles] = useState<Tecnologia[]>([]);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [proyectoAEliminar, setProyectoAEliminar] = useState<Proyecto | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [buscar, setBuscar] = useState("");

  const [idPortafolioSesion, setIdPortafolioSesion] = useState(() => {
    return localStorage.getItem("id_portafolio") ?? "";
  });

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

  const sincronizarIdPortafolio = () => {
    const idActual = localStorage.getItem("id_portafolio") ?? "";
    setIdPortafolioSesion(idActual);
    return idActual;
  };

  const recargarProyectos = async (idPortafolio: string, termino: string = "") => {
    if (!idPortafolio) {
      setProyectos([]);
      return;
    }

    const data = await listarProyectos(idPortafolio, termino);
    setProyectos(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    sincronizarIdPortafolio();

    const onFocus = () => {
      sincronizarIdPortafolio();
    };

    const onStorage = () => {
      sincronizarIdPortafolio();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    setProyectos([]);
    setProyectoEditando(null);
    setProyectoAEliminar(null);

    const timeout = setTimeout(() => {
      const cargar = async () => {
        try {
          const idActual = sincronizarIdPortafolio();
          if (!idActual) {
            setProyectos([]);
            return;
          }

          await recargarProyectos(idActual, buscar);
        } catch (error) {
          console.error("Error cargando proyectos:", error);
          setProyectos([]);
        }
      };

      cargar();
    }, 300);

    return () => clearTimeout(timeout);
  }, [idPortafolioSesion, buscar]);

  useEffect(() => {
    const cargarTecnologias = async () => {
      try {
        const data = await listarTecnologias();
        setTecnologiasDisponibles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando tecnologías:", error);
      }
    };

    cargarTecnologias();
  }, []);

  const handleEditar = (proyecto: Proyecto) => {
    setProyectoEditando(proyecto);
    setIsOpen(true);
  };

  const cerrarModal = () => {
    setIsOpen(false);
    setProyectoEditando(null);
  };

  const solicitarEliminar = (proyecto: Proyecto) => {
    setProyectoAEliminar(proyecto);
  };

  const cerrarConfirmacionEliminar = () => {
    if (eliminando) return;
    setProyectoAEliminar(null);
  };

  const confirmarEliminar = async () => {
    if (!proyectoAEliminar) return;

    try {
      setEliminando(true);
      setSuccessMessage("");
      setErrorMessage("");

      await eliminarProyecto(proyectoAEliminar.id_proyecto);

      const idActual = sincronizarIdPortafolio();
      await recargarProyectos(idActual, buscar);

      setProyectoAEliminar(null);
      setSuccessMessage("Proyecto eliminado correctamente.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Error eliminando proyecto:", error?.response?.data || error);

      setErrorMessage(
        error?.response?.data?.message || "No se pudo eliminar el proyecto."
      );

      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setEliminando(false);
    }
  };

  const handleSave = async (form: ProyectoLocal) => {
    try {
      setSuccessMessage("");
      setErrorMessage("");

      const idPortafolioActual = sincronizarIdPortafolio();

      if (!idPortafolioActual) {
        setErrorMessage("No se encontró el portafolio de la sesión actual.");
        return;
      }

      const payload = {
        id_portafolio: idPortafolioActual,
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        url_proyecto: form.github || null,
        imagen_url: form.imagen || null,
        fecha_ini: form.fechaInicio,
        fecha_fin: form.fechaFin || null,
        tecnologias: form.tecnologias,
      };

      console.log("ID PORTAFOLIO ACTUAL:", idPortafolioActual);
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
      await recargarProyectos(idPortafolioActual, buscar);
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
    <section className="min-h-screen bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-app-text sm:text-4xl">
            Mis Proyectos
          </h1>
          <p className="mt-1 text-sm text-app-muted sm:text-base">
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

      <div className="mt-6 flex justify-center">
        <div className="flex w-full max-w-3xl items-center gap-3 rounded-full border border-app-border bg-white px-4 py-3 shadow-sm sm:px-5">
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar ..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-app-muted"
          />
          <Search size={22} className="text-app-text" />
        </div>
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
          proyectos.map((proyecto) => {
            const tecnologiasParaMostrar =
              proyecto.tecnologias?.length
                ? proyecto.tecnologias.map((tec) => tec.nombre || "Tecnología")
                : [];

            return (
              <div
                key={proyecto.id_proyecto}
                className="overflow-hidden rounded-2xl border border-[#1f7fd1] bg-app-surface shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row">
                  <div className="flex h-40 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-100 text-center text-sm text-gray-400 lg:w-36">
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

                    {tecnologiasParaMostrar.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tecnologiasParaMostrar.map((nombre, index) => (
                          <span
                            key={index}
                            className="rounded bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                          >
                            {nombre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
                    <button
                      onClick={() => handleEditar(proyecto)}
                      className="rounded-full bg-blue-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => solicitarEliminar(proyecto)}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <NuevoProyectoModal
        isOpen={isOpen}
        onClose={cerrarModal}
        onSave={handleSave}
        tecnologiasDisponibles={tecnologiasDisponibles}
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
                tecnologias:
                  proyectoEditando.tecnologias?.map((tec) => tec.id_tecnologia) ?? [],
                imagen: proyectoEditando.imagen_url ?? "",
              }
            : null
        }
      />

      {proyectoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">
              Eliminar proyecto
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              ¿Seguro que deseas eliminar{" "}
              <span className="font-semibold">{proyectoAEliminar.nombre}</span>?{" "}
              Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={cerrarConfirmacionEliminar}
                disabled={eliminando}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MisProyectos;