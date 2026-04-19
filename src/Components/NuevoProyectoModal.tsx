import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

type Tecnologia = {
  id_tecnologia: string;
  nombre: string;
  categoria?: string | null;
};

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

type NuevoProyectoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: ProyectoLocal) => Promise<void> | void;
  proyectoInicial?: ProyectoLocal | null;
  tecnologiasDisponibles: Tecnologia[];
};

function NuevoProyectoModal({
  isOpen,
  onClose,
  onSave,
  proyectoInicial,
  tecnologiasDisponibles,
}: NuevoProyectoModalProps) {
  const [form, setForm] = useState<ProyectoLocal>({
    nombre: "",
    descripcion: "",
    github: "",
    demo: "",
    fechaInicio: "",
    fechaFin: "",
    tecnologias: [],
    imagen: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (proyectoInicial) {
      setForm(proyectoInicial);
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        github: "",
        demo: "",
        fechaInicio: "",
        fechaFin: "",
        tecnologias: [],
        imagen: "",
      });
    }
    setFormError("");
  }, [proyectoInicial, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) setFormError("");
  };

  const toggleTecnologia = (idTecnologia: string) => {
    setForm((prev) => ({
      ...prev,
      tecnologias: prev.tecnologias.includes(idTecnologia)
        ? prev.tecnologias.filter((id) => id !== idTecnologia)
        : [...prev.tecnologias, idTecnologia],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/.+/i;
    const githubLimpio = form.github.trim();

    if (!githubRegex.test(githubLimpio)) {
      setFormError("El enlace de GitHub debe comenzar con https://github.com/");
      return;
    }

    await onSave({
      ...form,
      github: githubLimpio,
      demo: form.demo.trim(),
      imagen: form.imagen.trim(),
    });

    onClose();
  };

  const categoriasOrdenadas = [
    "Lenguajes de programación",
    "Frameworks y Librerías",
    "Base de Datos",
    "Herramientas y Tecnologías",
    "Otros",
  ];

  const tecnologiasAgrupadas = tecnologiasDisponibles.reduce((acc, tec) => {
    const categoria = tec.categoria?.trim() || "Otros";

    if (!acc[categoria]) {
      acc[categoria] = [];
    }

    acc[categoria].push(tec);
    return acc;
  }, {} as Record<string, Tecnologia[]>);

  const categoriasExistentes = [
    ...categoriasOrdenadas.filter((categoria) => tecnologiasAgrupadas[categoria]),
    ...Object.keys(tecnologiasAgrupadas).filter(
      (categoria) => !categoriasOrdenadas.includes(categoria)
    ),
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-sm border border-app-border bg-app-bg shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-app-border px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-2xl font-extrabold text-app-text sm:text-3xl">
            {proyectoInicial ? "Editar Proyecto" : "Nuevo Proyecto"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-app-muted transition hover:bg-white/10 hover:text-app-text"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          <div>
            <label className="mb-1 block text-base font-medium text-app-text">
              Nombre del proyecto:
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              type="text"
              placeholder="nombredelproyecto"
              required
              className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm text-app-text outline-none placeholder:text-app-muted"
            />
          </div>

          <div>
            <label className="mb-1 block text-base font-medium text-app-text">
              Descripción:
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={5}
              maxLength={200}
              required
              placeholder="Máximo 200 caracteres"
              className="w-full rounded-2xl border border-app-border bg-white px-4 py-3 text-sm text-app-text outline-none placeholder:text-app-muted"
            />
            <p className="mt-1 text-xs text-app-muted">
              {form.descripcion.length}/200 caracteres
            </p>
          </div>

          <div>
            <label className="mb-1 block text-base font-medium text-app-text">
              Link GitHub:
            </label>
            <input
              name="github"
              value={form.github}
              onChange={handleChange}
              type="url"
              placeholder="https://github.com/usuario/proyecto"
              required
              pattern="^https?:\/\/(www\.)?github\.com\/.+"
              title="Ingresa un enlace válido de GitHub, por ejemplo: https://github.com/usuario/proyecto"
              className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm text-app-text outline-none placeholder:text-app-muted"
            />
            <p className="mt-1 text-xs text-app-muted">
              Debe ser un enlace de GitHub.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-base font-medium text-app-text">
              URL de la demo:
            </label>
            <input
              name="demo"
              value={form.demo}
              onChange={handleChange}
              type="url"
              placeholder="https://demo.com"
              className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm text-app-text outline-none placeholder:text-app-muted"
            />
            <p className="mt-1 text-xs text-app-muted">
              Campo opcional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                Fecha inicio:
              </label>
              <input
                name="fechaInicio"
                value={form.fechaInicio}
                onChange={handleChange}
                type="date"
                required
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm text-app-text outline-none [color-scheme:light]"
                style={{ colorScheme: "light" }}
              />
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                Fecha fin:
              </label>
              <input
                name="fechaFin"
                value={form.fechaFin}
                onChange={handleChange}
                type="date"
                required
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm text-app-text outline-none [color-scheme:light]"
                style={{ colorScheme: "light" }}
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-base font-medium text-app-text">
              Tecnologías:
            </label>

            <div className="space-y-5">
              {categoriasExistentes.map((categoria) => {
                const tecnologiasDeCategoria = tecnologiasAgrupadas[categoria];

                if (!tecnologiasDeCategoria || tecnologiasDeCategoria.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={categoria}
                    className="rounded-2xl border border-app-border bg-app-bg p-4 shadow-sm"
                  >
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-app-text">
                      {categoria}
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {tecnologiasDeCategoria.map((tec) => {
                        const checked = form.tecnologias.includes(tec.id_tecnologia);

                        return (
                          <label
                            key={tec.id_tecnologia}
                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-app-border bg-app-bg px-3 py-3 text-sm text-app-text transition hover:border-blue-400"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTecnologia(tec.id_tecnologia)}
                              className="peer sr-only"
                            />

                            <span
                              className={[
                                "mt-1 flex h-4 w-4 items-center justify-center rounded border transition",
                                checked
                                  ? "border-blue-500 bg-white"
                                  : "border-gray-300 bg-white",
                              ].join(" ")}
                            >
                              {checked && (
                                <Check size={12} className="text-blue-600" />
                              )}
                            </span>

                            <div className="min-w-0">
                              <span className="block font-medium">{tec.nombre}</span>
                              {tec.categoria && (
                                <span className="block text-xs text-app-muted">
                                  {tec.categoria}
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-base font-medium text-app-text">
              URL de imagen:
            </label>
            <input
              name="imagen"
              value={form.imagen}
              onChange={handleChange}
              type="text"
              placeholder="https://..."
              className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm text-app-text outline-none placeholder:text-app-muted"
            />
          </div>

          {formError && (
            <div className="rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-app-border px-4 py-4 sm:flex-row sm:justify-between sm:px-8 sm:py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="rounded-full bg-app-topbar px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {proyectoInicial ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoProyectoModal;