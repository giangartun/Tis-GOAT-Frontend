import { useEffect, useMemo, useRef, useState } from "react";
import { X, Upload, FileText, CalendarDays, Plus } from "lucide-react";

export interface ExperienciaLaboralModalSubmit {
  empresa: string;
  cargo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin: string | null;
  archivos: File[];
}

export interface ExperienciaLaboralModalInitialData {
  empresa: string;
  cargo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin: string | null;
}

interface ExperienciaLaboralModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar?: (data: ExperienciaLaboralModalSubmit) => Promise<void> | void;
  initialData?: ExperienciaLaboralModalInitialData | null;
}

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_DESC = 1000;

function ExperienciaLaboralModal({
  abierto,
  onCerrar,
  onGuardar,
  initialData,
}: ExperienciaLaboralModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sigueActivo, setSigueActivo] = useState(false);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [form, setForm] = useState({
    empresa: "",
    cargo: "",
    descripcion: "",
    fecha_ini: "",
    fecha_fin: "",
  });

  const maxBytes = useMemo(() => MAX_FILE_SIZE_MB * 1024 * 1024, []);

  useEffect(() => {
    if (abierto) setError(null);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) {
      setLoading(false);
      setDragActive(false);
      setError(null);
      setSigueActivo(false);
      setArchivos([]);
      setForm({
        empresa: "",
        cargo: "",
        descripcion: "",
        fecha_ini: "",
        fecha_fin: "",
      });
    }
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    setError(null);
    setArchivos([]);
    setForm({
      empresa: initialData?.empresa ?? "",
      cargo: initialData?.cargo ?? "",
      descripcion: initialData?.descripcion ?? "",
      fecha_ini: initialData?.fecha_ini ?? "",
      fecha_fin: initialData?.fecha_fin ?? "",
    });
    setSigueActivo(initialData ? !initialData.fecha_fin : false);
  }, [abierto, initialData]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };

    if (abierto) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validarArchivo = (file: File) => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `El archivo ${file.name} no es válido. Solo PDF, JPG o PNG.`;
    }

    if (file.size > maxBytes) {
      return `El archivo ${file.name} supera el límite de ${MAX_FILE_SIZE_MB} MB.`;
    }

    return null;
  };

  const agregarArchivos = (files: FileList | File[]) => {
    const nuevos: File[] = [];

    Array.from(files).forEach((file) => {
      const errorArchivo = validarArchivo(file);
      if (errorArchivo) {
        setError(errorArchivo);
        return;
      }
      nuevos.push(file);
    });

    if (nuevos.length > 0) {
      setError(null);
      setArchivos((prev) => [...prev, ...nuevos]);
    }
  };

  const validar = () => {
    if (!form.empresa.trim()) {
      setError("La empresa es obligatoria.");
      return false;
    }

    if (!form.cargo.trim()) {
      setError("El cargo es obligatorio.");
      return false;
    }

    if (!form.descripcion.trim()) {
      setError("La descripción es obligatoria.");
      return false;
    }

    if (form.descripcion.trim().length > MAX_DESC) {
      setError(`La descripción no debe superar los ${MAX_DESC} caracteres.`);
      return false;
    }

    if (!form.fecha_ini) {
      setError("La fecha de inicio es obligatoria.");
      return false;
    }

    if (!sigueActivo && !form.fecha_fin) {
      setError("La fecha fin es obligatoria o puedes marcar que sigue activo.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validar()) return;

    try {
      setLoading(true);

      await onGuardar?.({
        empresa: form.empresa.trim(),
        cargo: form.cargo.trim(),
        descripcion: form.descripcion.trim(),
        fecha_ini: form.fecha_ini,
        fecha_fin: sigueActivo ? null : form.fecha_fin,
        archivos,
      });

      onCerrar();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la experiencia laboral.");
    } finally {
      setLoading(false);
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/55 px-3 py-3 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="experiencia-laboral-title"
        className="my-auto w-full max-w-[820px] overflow-hidden rounded-[18px] bg-white shadow-2xl max-h-[calc(100vh-1.5rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#203A63] px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-3 text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <FileText size={17} />
            </span>
            <h3
              id="experiencia-laboral-title"
              className="text-[17px] font-bold sm:text-[18px]"
            >
              Registrar experiencia laboral
            </h3>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-6rem)] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Empresa
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
                Empresa
              </label>
              <input
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                placeholder="Ej. Google, Startup XYZ..."
                className="h-10 w-full rounded-[12px] border border-slate-300 bg-slate-800 px-3.5 text-[15px] text-white outline-none placeholder:text-white/70 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
                Cargo
              </label>
              <input
                name="cargo"
                value={form.cargo}
                onChange={handleChange}
                placeholder="Ej. Desarrolladora Backend"
                className="h-10 w-full rounded-[12px] border border-slate-300 bg-slate-800 px-3.5 text-[15px] text-white outline-none placeholder:text-white/70 focus:border-slate-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={2}
              maxLength={MAX_DESC}
              placeholder="Describe tus responsabilidades, tecnologías usadas o logros..."
              className="w-full rounded-[12px] border border-slate-300 bg-slate-800 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/70 focus:border-slate-900"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">
              {form.descripcion.length}/{MAX_DESC} caracteres
            </p>
          </div>

          <div className="mt-4 mb-3 flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Periodo
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
                Fecha de inicio
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="fecha_ini"
                  value={form.fecha_ini}
                  onChange={handleChange}
                  className="h-10 w-full rounded-[12px] border border-slate-300 bg-slate-800 px-3.5 pr-10 text-[15px] text-white outline-none focus:border-slate-900"
                />
                <CalendarDays
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80"
                  size={15}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
                Fecha de fin
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  onChange={handleChange}
                  disabled={sigueActivo}
                  className="h-10 w-full rounded-[12px] border border-slate-300 bg-slate-800 px-3.5 pr-10 text-[15px] text-white outline-none disabled:opacity-60 focus:border-slate-900"
                />
                <CalendarDays
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80"
                  size={15}
                />
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  id="sigueActivo"
                  type="checkbox"
                  checked={sigueActivo}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSigueActivo(checked);
                    if (checked) {
                      setForm((prev) => ({ ...prev, fecha_fin: "" }));
                    }
                  }}
                  className="h-4 w-4"
                />
                <label htmlFor="sigueActivo" className="text-[13px] text-slate-600">
                  Sigo activo
                </label>
              </div>

              <p className="mt-1 text-[11px] text-slate-400">
                Dejar vacío si sigue activo
              </p>
            </div>
          </div>

          <div className="mt-4 mb-3 flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Documentos
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.length) {
                agregarArchivos(e.dataTransfer.files);
              }
            }}
            className={`rounded-[14px] border-2 border-dashed bg-[#F8FBFF] px-4 py-4 text-center transition ${
              dragActive ? "border-[#203A63] bg-blue-50" : "border-slate-300"
            }`}
          >
            <div className="mx-auto flex max-w-md flex-col items-center">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500">
                <Upload size={17} />
              </div>

              <p className="text-[14px] font-extrabold text-[#1E5AA8]">
                Arrastrá o seleccioná archivos
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                PDF, JPG, PNG - Máx. {MAX_FILE_SIZE_MB} MB por archivo
              </p>

              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) agregarArchivos(e.target.files);
                  e.currentTarget.value = "";
                }}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2.5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
              >
                <Plus size={15} />
                Explorar archivos
              </button>

              {archivos.length > 0 && (
                <div className="mt-3 w-full space-y-2 text-left">
                  {archivos.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-slate-700">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarArchivo(index)}
                        className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Eliminar ${file.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 flex flex-col-reverse gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-xl border border-slate-200 px-5 py-2 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203A63] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#182d4b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus size={15} />
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExperienciaLaboralModal;