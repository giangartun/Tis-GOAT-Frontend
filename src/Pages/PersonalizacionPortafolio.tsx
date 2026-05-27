import { useEffect, useState } from "react";
import { Check, Layout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const API_URL = "http://localhost:8000";

interface Plantilla {
  id_plantilla: string;
  nombre: string;
  descripcion: string;
  url_vista: string;
}

function PersonalizacionPortafolio() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<string>("");
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
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
      const response = await axios.get(`${API_URL}/api/plantillas/catalogo`);

      const plantillasFiltradas = (response.data.data || []).filter(
        (p: Plantilla) =>
          p.nombre === "Bento" ||
          p.nombre === "Sidebar" ||
          p.nombre === "Editorial"
      );

      setPlantillas(plantillasFiltradas);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
    }
  };

  const cargarPlantillaActual = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/portafolio/completo`,
        getAuthHeaders()
      );

      const portafolio = response.data.portafolio;

      if (portafolio?.id_plantilla) {
        setPlantillaSeleccionada(portafolio.id_plantilla);
        localStorage.setItem("portafolio_plantilla", portafolio.id_plantilla);
      }
    } catch (error) {
      console.error("Error al cargar plantilla actual:", error);
    } finally {
      setCargando(false);
    }
  };

  const aplicarCambios = async () => {
    try {
      await axios.patch(
        `${API_URL}/api/portafolio/actualizar-plantilla`,
        {
          id_plantilla: plantillaSeleccionada,
        },
        getAuthHeaders()
      );

      localStorage.setItem("portafolio_plantilla", plantillaSeleccionada);
      setMostrarMensaje(true);
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
      alert(t("portfolioCustomization.errors.save"));
    }
  };

  const obtenerVistaPrevia = (nombre: string) => {
    switch (nombre) {
      case "Bento":
        return (
          <div className="grid h-full grid-cols-3 grid-rows-3 gap-1">
            <div className="rounded bg-blue-500" />
            <div className="col-span-2 rounded bg-blue-700" />
            <div className="col-span-2 rounded bg-blue-900" />
            <div className="rounded bg-blue-700" />
            <div className="row-span-2 rounded bg-blue-900" />
            <div className="row-span-2 rounded bg-blue-700" />
            <div className="rounded bg-blue-500" />
          </div>
        );

      case "Sidebar":
        return (
          <div className="grid h-full grid-cols-3 gap-1">
            <div className="col-span-1 rounded bg-blue-900" />
            <div className="col-span-2 rounded bg-blue-950" />
          </div>
        );

      case "Editorial":
        return (
          <div className="grid h-full grid-cols-3 grid-rows-3 gap-1">
            <div className="col-span-3 rounded bg-blue-500" />
            <div className="col-span-3 rounded bg-blue-900" />
            <div className="rounded bg-blue-700" />
            <div className="rounded bg-blue-700" />
            <div className="rounded bg-blue-700" />
          </div>
        );

      default:
        return (
          <div className="grid h-full grid-cols-3 grid-rows-3 gap-1">
            <div className="rounded bg-blue-500" />
            <div className="col-span-2 rounded bg-blue-700" />
            <div className="col-span-3 rounded bg-blue-900" />
            <div className="col-span-3 rounded bg-blue-700" />
          </div>
        );
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <p className="text-lg text-slate-700">
          {t("portfolioCustomization.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700">
            {t("portfolioCustomization.title")}
          </h1>

          <p className="mt-2 text-lg text-slate-600">
            {t("portfolioCustomization.subtitle")}
          </p>
        </div>

        <div className="space-y-10 rounded-3xl bg-white p-8 shadow-xl">
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Layout className="text-blue-600" size={28} />

              <h2 className="text-2xl font-semibold text-slate-900">
                {t("portfolioCustomization.available_templates")}
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
                        ? "border-blue-500 ring-4 ring-blue-100"
                        : "border-gray-200"
                    } bg-[#203a5c]`}
                  >
                    {obtenerVistaPrevia(plantilla.nombre)}
                  </div>

                  <p className="mt-3 text-center font-medium text-slate-900">
                    {plantilla.nombre}
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
              {t("portfolioCustomization.apply_changes")}
            </button>
          </div>
        </div>
      </div>

      {mostrarMensaje && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-600">
                <Check size={28} />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  {t("portfolioCustomization.success.title")}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  {t("portfolioCustomization.success.description")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setMostrarMensaje(false)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {t("portfolioCustomization.actions.stay")}
              </button>

              <button
                onClick={() => {
                  setMostrarMensaje(false);
                  navigate("/portafolio", { replace: true });
                }}
                className="rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
              >
                {t("portfolioCustomization.actions.view_portfolio")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalizacionPortafolio;