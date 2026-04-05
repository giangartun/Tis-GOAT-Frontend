import { X } from "lucide-react";

type NuevoProyectoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function NuevoProyectoModal({ isOpen, onClose }: NuevoProyectoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-sm border border-app-border bg-app-bg shadow-2xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-app-border px-6 py-4">
          <h2 className="text-3xl font-extrabold text-app-text">
            Nuevo Proyecto
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-app-muted transition hover:bg-white/60 hover:text-app-text"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Formulario */}
        <form className="px-8 py-6">
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                Nombre del proyecto:
              </label>
              <input
                type="text"
                placeholder="nombredelproyecto"
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
              />
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                Descripción:
              </label>
              <textarea
                rows={5}
                placeholder=""
                className="w-full rounded-2xl border border-app-border bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                Link del repositorio:
              </label>
              <input
                type="text"
                placeholder="https://github.com/usuario/proyecto"
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
              />
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                URL de la demo:
              </label>
              <input
                type="text"
                placeholder="https://demo.com"
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-base font-medium text-app-text">
                  Fecha inicio:
                </label>
                <input
                  type="text"
                  placeholder="00/00/0000"
                  className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
                />
              </div>

              <div>
                <label className="mb-1 block text-base font-medium text-app-text">
                  Fecha fin:
                </label>
                <input
                  type="text"
                  placeholder="00/00/0000"
                  className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                Tecnologías:
              </label>
              <input
                type="text"
                placeholder="React"
                className="w-full rounded-md border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
              />
            </div>

            <div>
              <label className="mb-1 block text-base font-medium text-app-text">
                Subir imagen:
              </label>
              <input
                type="text"
                placeholder="https://tutorial-como-copiar-direccion-url-de-imagen/"
                className="w-full rounded-full border border-app-border bg-white px-4 py-2 text-sm outline-none placeholder:text-app-muted"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex items-center justify-between">
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevoProyectoModal;