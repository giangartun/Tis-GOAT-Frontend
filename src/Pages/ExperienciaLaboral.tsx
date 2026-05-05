import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

export interface ExperienciaLaboralPayload {
  id_portafolio: string;
  empresa: string;
  cargo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin: string | null;
  visible: boolean;
}

interface ExperienciaLaboralSectionProps {
  /**
   * Usa este callback para enviar los datos al backend desde el componente padre.
   * Si luego me pasas tu controller/route, lo conectamos directo aquí.
   */
  onGuardar?: (data: ExperienciaLaboralPayload) => Promise<void> | void;
}

const STORAGE_KEY = "id_portafolio";

function ExperienciaLaboralSection({ onGuardar }: ExperienciaLaboralSectionProps) {
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sigueTrabajando, setSigueTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    empresa: "",
    cargo: "",
    descripcion: "",
    fecha_ini: "",
    fecha_fin: "",
  });

  const idPortafolio = useMemo(() => localStorage.getItem(STORAGE_KEY) || "", []);

  useEffect(() => {
    if (abierto) {
      setError(null);
    }
  }, [abierto]);

  const resetForm = () => {
    setForm({
      empresa: "",
      cargo: "",
      descripcion: "",
      fecha_ini: "",
      fecha_fin: "",
    });
    setSigueTrabajando(false);
    setError(null);
  };

  const cerrarModal = () => {
    if (loading) return;
    setAbierto(false);
    resetForm();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!idPortafolio) {
      setError("No se encontró el portafolio del usuario.");
      return false;
    }

    if (!form.empresa.trim()) return setError("La empresa es obligatoria."), false;
    if (!form.cargo.trim()) return setError("El cargo es obligatorio."), false;
    if (!form.fecha_ini) return setError("La fecha de inicio es obligatoria."), false;

    if (!sigueTrabajando && !form.fecha_fin) {
      setError("La fecha fin es obligatoria o marca que sigue trabajando.");
      return false;
    }

    if (form.descripcion.trim().length > 1000) {
      setError("La descripción no debe superar los 1000 caracteres.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validar()) return;

    const payload: ExperienciaLaboralPayload = {
      id_portafolio: idPortafolio,
      empresa: form.empresa.trim(),
      cargo: form.cargo.trim(),
      descripcion: form.descripcion.trim(),
      fecha_ini: form.fecha_ini,
      fecha_fin: sigueTrabajando ? null : form.fecha_fin,
      visible: true,
    };

    try {
      setLoading(true);
      await onGuardar?.(payload);
      cerrarModal();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la experiencia laboral.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Experiencia laboral</h2>
          <p className="mt-1 text-sm text-slate-500">
            Agrega tu historial laboral con empresa, cargo y fechas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Añadir experiencia laboral
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Aquí se listarán las experiencias laborales registradas.
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Nueva experiencia laboral</h3>
                <p className="text-sm text-slate-500">Completa los datos para guardar tu experiencia.</p>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Empresa *</label>
                  <input
                    name="empresa"
                    value={form.empresa}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Cargo *</label>
                  <input
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                    placeholder="Tu cargo"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Describe brevemente tus funciones, logros y responsabilidades"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Fecha inicio *</label>
                  <input
                    type="date"
                    name="fecha_ini"
                    value={form.fecha_ini}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Fecha fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={form.fecha_fin}
                    onChange={handleChange}
                    disabled={sigueTrabajando}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition disabled:bg-slate-100 focus:border-slate-900"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={sigueTrabajando}
                  onChange={(e) => {
                    setSigueTrabajando(e.target.checked);
                    if (e.target.checked) {
                      setForm((prev) => ({ ...prev, fecha_fin: "" }));
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Sigo trabajando actualmente en esta empresa
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Guardando..." : "Guardar experiencia laboral"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExperienciaLaboralSection;
