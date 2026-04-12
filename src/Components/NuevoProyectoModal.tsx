import { useEffect, useState } from "react";

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
  }, [proyectoInicial, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    await onSave(form);
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-sm border border-app-border bg-app-bg shadow-2xl"
      >
        {/* Encabezado con botón X */}
        <div className="shrink-0 flex items-center justify-between border-b border-app-border px-6 py-4">
          <h2 className="text-3xl font-extrabold text-app-text">
            {proyectoInicial ? "Editar Proyecto" : "Nuevo Proyecto"}
          </h2>
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-app-muted transition hover:bg-white/60 hover:text-app-text"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-5">
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
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
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
                className="w-full rounded-2xl border border-app-border bg-white px-4 py-3 text-sm outline-none"
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
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
              />
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
                required
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
              />
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
                  className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none"
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
                  className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-medium text-app-text">
                Tecnologías:
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {tecnologiasDisponibles.map((tec) => (
                  <label
                    key={tec.id_tecnologia}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-app-border bg-white px-3 py-3 text-sm text-app-text"
                  >
                    <input
                      type="checkbox"
                      checked={form.tecnologias.includes(tec.id_tecnologia)}
                      onChange={() => toggleTecnologia(tec.id_tecnologia)}
                      className="mt-1 h-4 w-4"
                    />
                    <div className="min-w-0">
                      <span className="block font-medium">{tec.nombre}</span>
                      {tec.categoria && (
                        <span className="block text-xs text-app-muted">
                          {tec.categoria}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                Subir imagen:
              </label>
              <input
                name="imagen"
                value={form.imagen}
                onChange={handleChange}
                type="text"
                placeholder="https://tutorial-como-copiar-direccion-url-de-imagen/"
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
              />
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="shrink-0 border-t border-app-border px-8 py-5">
          <div className="flex items-center justify-between">
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
        </div>
      </form>
    </div>
  );
}

export default NuevoProyectoModal;