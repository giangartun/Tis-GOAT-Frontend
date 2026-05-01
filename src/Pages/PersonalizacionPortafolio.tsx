import { useEffect, useState } from "react";
import { Check, Layout, Palette } from "lucide-react";

function PersonalizacionPortafolio() {
  const [tema, setTema] = useState("claro");
  const [plantilla, setPlantilla] = useState("bento");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  useEffect(() => {
    const temaGuardado = localStorage.getItem("portafolio_tema");
    const plantillaGuardada = localStorage.getItem("portafolio_plantilla");

    if (temaGuardado) setTema(temaGuardado);
    if (plantillaGuardada) setPlantilla(plantillaGuardada);
  }, []);

  const aplicarCambios = () => {
    localStorage.setItem("portafolio_tema", tema);
    localStorage.setItem("portafolio_plantilla", plantilla);
    setMostrarMensaje(true);
  };

  const tarjetaBase =
    "rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg";

  return (
    <div className="min-h-screen bg-app-bg p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-app-text">
            Personalización del Portafolio
          </h1>
          <p className="mt-2 text-lg text-app-muted">
            Elige el color y la estructura de tu portafolio que vaya más con tu personalidad.
          </p>
        </div>

        <div className="space-y-10 rounded-3xl bg-white p-8 shadow-xl">
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Palette className="text-blue-600" size={28} />
              <h2 className="text-2xl font-semibold text-app-text">
                Color y estilo de Tipografía
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
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
                    <h3 className="text-4xl font-light text-gray-800 leading-tight">
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
                    <h3 className="text-4xl font-light text-white leading-tight">
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
                Estructura
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={() => setPlantilla("bento")}
                className={`text-left transition ${
                  plantilla === "bento" ? "scale-[1.02]" : ""
                }`}
              >
                <div
                  className={`mx-auto h-[116px] w-[170px] rounded border-4 p-2 shadow-sm ${
                    plantilla === "bento"
                      ? "border-[#1d3557] ring-4 ring-blue-100"
                      : "border-gray-200"
                  } bg-[#203a5c]`}
                >
                  <div className="grid h-full grid-cols-3 grid-rows-3 gap-1">
                    <div className="col-span-1 row-span-1 rounded bg-[#4f81bd]" />
                    <div className="col-span-2 row-span-1 rounded bg-[#2a4b73]" />
                    <div className="col-span-2 row-span-1 rounded bg-[#162a44]" />
                    <div className="col-span-1 row-span-1 rounded bg-[#2a4b73]" />
                    <div className="col-span-1 row-span-2 rounded bg-[#162a44]" />
                    <div className="col-span-1 row-span-2 rounded bg-[#2a4b73]" />
                    <div className="col-span-1 row-span-1 rounded bg-[#4f81bd]" />
                  </div>
                </div>
                <p className="mt-3 text-center text-sm text-app-muted">
                  Plantilla Bento-grid
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPlantilla("sidebar")}
                className={`text-left transition ${
                  plantilla === "sidebar" ? "scale-[1.02]" : ""
                }`}
              >
                <div
                  className={`mx-auto h-[116px] w-[170px] rounded border-4 p-2 shadow-sm ${
                    plantilla === "sidebar"
                      ? "border-[#1d3557] ring-4 ring-blue-100"
                      : "border-gray-200"
                  } bg-[#203a5c]`}
                >
                  <div className="grid h-full grid-cols-3 gap-1">
                    <div className="col-span-1 rounded bg-[#162a44]" />
                    <div className="col-span-2 rounded bg-[#0f2035]" />
                  </div>
                </div>
                <p className="mt-3 text-center text-sm text-app-muted">
                  Plantilla Sidebar-Fijo
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPlantilla("editorial")}
                className={`text-left transition ${
                  plantilla === "editorial" ? "scale-[1.02]" : ""
                }`}
              >
                <div
                  className={`mx-auto h-[116px] w-[170px] rounded border-4 p-2 shadow-sm ${
                    plantilla === "editorial"
                      ? "border-[#1d3557] ring-4 ring-blue-100"
                      : "border-gray-200"
                  } bg-[#203a5c]`}
                >
                  <div className="grid h-full grid-cols-3 grid-rows-3 gap-1">
                    <div className="col-span-3 row-span-1 rounded bg-[#4f81bd]" />
                    <div className="col-span-3 row-span-1 rounded bg-[#162a44]" />
                    <div className="col-span-1 row-span-1 rounded bg-[#2a4b73]" />
                    <div className="col-span-1 row-span-1 rounded bg-[#2a4b73]" />
                    <div className="col-span-1 row-span-1 rounded bg-[#2a4b73]" />
                  </div>
                </div>
                <p className="mt-3 text-center text-sm text-app-muted">
                  Plantilla Editorial/Revista
                </p>
              </button>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              onClick={aplicarCambios}
              className="rounded-full bg-blue-500 px-8 py-3 text-lg font-medium text-white shadow-lg transition hover:bg-blue-600"
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