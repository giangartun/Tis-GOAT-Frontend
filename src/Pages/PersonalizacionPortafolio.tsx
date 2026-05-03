import { useEffect, useState } from "react";
import { Check, Layout, Palette } from "lucide-react";
import axios from "axios";

interface Plantilla {
  id_plantilla: string;
  nombre: string;
  descripcion: string;
  url_vista: string;
}

function PersonalizacionPortafolio() {
  const [tema, setTema] = useState("claro");
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<string>("");
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const temaGuardado = localStorage.getItem("portafolio_tema");
    if (temaGuardado) setTema(temaGuardado);

    cargarPlantillas();
    cargarPlantillaActual();
  }, []);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const cargarPlantillas = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/plantillas",
        getAuthHeaders()
      );
      setPlantillas(response.data);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    }
  };

  const cargarPlantillaActual = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/portafolio/completo",
        getAuthHeaders()
      );

      const portafolio = response.data.portafolio;
      if (portafolio?.id_plantilla) {
        setPlantillaSeleccionada(portafolio.id_plantilla);
      }
    } catch (error) {
      console.error("Error al cargar plantilla actual:", error);
    } finally {
      setCargando(false);
    }
  };

  const aplicarCambios = async () => {
    try {
      await axios.put(
        "http://localhost:8000/api/portafolio/plantilla",
        {
          id_plantilla: plantillaSeleccionada,
        },
        getAuthHeaders()
      );

      localStorage.setItem("portafolio_tema", tema);
      setMostrarMensaje(true);
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
      alert("No se pudo guardar la configuración del portafolio.");
    }
  };

  const obtenerVistaPrevia = (urlVista: string) => {
    switch (urlVista) {
      case "bento":
      case "v1_modern":
        return (
          <div className="grid h-full grid-cols-3 grid-rows-3 gap-1">
            <div className="rounded bg-[#4f81bd]" />
            <div className="col-span-2 rounded bg-[#2a4b73]" />
            <div className="col-span-2 rounded bg-[#162a44]" />
            <div className="rounded bg-[#2a4b73]" />
            <div className="row-span-2 rounded bg-[#162a44]" />
            <div className="row-span-2 rounded bg-[#2a4b73]" />
            <div className="rounded bg-[#4f81bd]" />
          </div>
        );

      case "sidebar":
        return (
          <div className="grid h-full grid-cols-3 gap-1">
            <div className="rounded bg-[#162a44]" />
            <div className="col-span-2 rounded bg-[#0f2035]" />
          </div>
        );

      case "editorial":
        return (
          <div className="grid h-full grid-cols-3 grid-rows-3 gap-1">
            <div className="col-span-3 rounded bg-[#4f81bd]" />
            <div className="col-span-3 rounded bg-[#162a44]" />
            <div className="rounded bg-[#2a4b73]" />
            <div className="rounded bg-[#2a4b73]" />
            <div className="rounded bg-[#2a4b73]" />
          </div>
        );

      default:
        return (
          <div className="grid h-full grid-cols-3 grid-rows-3 gap-1">
            <div className="rounded bg-[#4f81bd]" />
            <div className="col-span-2 rounded bg-[#2a4b73]" />
            <div className="col-span-3 rounded bg-[#162a44]" />
            <div className="col-span-3 rounded bg-[#2a4b73]" />
          </div>
        );
    }
  };

  const tarjetaBase =
    "rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg";

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <p className="text-lg text-app-text">Cargando personalización...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-app-text">
            Personalización del Portafolio
          </h1>
          <p className="mt-2 text-lg text-app-muted">
            Elige el color y la estructura de tu portafolio.
          </p>
        </div>

        <div className="space-y-10 rounded-3xl bg-white p-8 shadow-xl">
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Palette className="text-blue-600" size={28} />
              <h2 className="text-2xl font-semibold text-app-text">
                Color y estilo de tipografía
              </h2>
            </div>

            <div className="grid max-w-2xl gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setTema("claro")}
                className={`${tarjetaBase} ${
                  tema === "claro"
                    ? "border-blue-500 ring-4 ring-blue-100"
                    : "border-gray-200"
                }`}
              >
                <div className="overflow-hidden rounded-xl border">
                  <div className="bg-white px-6 py-8 text-left">
                    <h3 className="text-4xl font-light leading-tight text-gray-800">
                      Portafolio
                      <br />
                      Estilo
                    </h3>
                  </div>
                  <div className="bg-gray-300 px-6 py-4">
                    <span className="text-4xl font-light text-blue-600">Aa</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTema("oscuro")}
                className={`${tarjetaBase} ${
                  tema === "oscuro"
                    ? "border-blue-500 ring-4 ring-blue-100"
                    : "border-gray-200"
                }`}
              >
                <div className="overflow-hidden rounded-xl border">
                  <div className="bg-slate-700 px-6 py-8 text-left">
                    <h3 className="text-4xl font-light leading-tight text-white">
                      Portafolio
                      <br />
                      Estilo
                    </h3>
                  </div>
                  <div className="bg-blue-800 px-6 py-4">
                    <span className="text-4xl font-light text-sky-400">Aa</span>
                  </div>
                </div>
              </button>
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-center gap-3">
              <Layout className="text-blue-600" size={28} />
              <h2 className="text-2xl font-semibold text-app-text">
                Plantillas disponibles
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {plantillas.map((plantilla) => (
                <button
                  key={plantilla.id_plantilla}
                  type="button"
                  onClick={() => setPlantillaSeleccionada(plantilla.id_plantilla)}
                  className={`text-left transition ${
                    plantillaSeleccionada === plantilla.id_plantilla
                      ? "scale-[1.02]"
                      : ""
                  }`}
                >
                  <div
                    className={`mx-auto h-[116px] w-[170px] rounded border-4 p-2 shadow-sm ${
                      plantillaSeleccionada === plantilla.id_plantilla
                        ? "border-[#1d3557] ring-4 ring-blue-100"
                        : "border-gray-200"
                    } bg-[#203a5c]`}
                  >
                    {obtenerVistaPrevia(plantilla.url_vista)}
                  </div>

                  <p className="mt-3 text-center font-medium text-app-text">
                    {plantilla.nombre}
                  </p>
                  <p className="mt-1 text-center text-sm text-app-muted">
                    {plantilla.descripcion}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              onClick={aplicarCambios}
              disabled={!plantillaSeleccionada}
              className="rounded-full bg-blue-500 px-8 py-3 text-lg font-medium text-white shadow-lg transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Aplicar cambios
            </button>
          </div>
        </div>
      </div>

      {mostrarMensaje && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1f2937] p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <Check size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">
                  Cambios aplicados correctamente
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  La personalización del portafolio se guardó correctamente.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setMostrarMensaje(false)}
                className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalizacionPortafolio;
