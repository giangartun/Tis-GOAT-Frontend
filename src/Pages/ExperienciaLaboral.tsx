import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { X, Upload, FileText, CalendarDays, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ExperienciaLaboralModalSubmit {
  empresa: string;
  cargo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin: string | null;
  archivos: File[];
}

interface ExperienciaLaboralModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar?: (data: ExperienciaLaboralModalSubmit) => Promise<void> | void;
}

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function ExperienciaLaboralModal({
  abierto,
  onCerrar,
  onGuardar,
}: ExperienciaLaboralModalProps) {
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement | null>(null);
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

  if (!abierto) return null;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validarArchivo = (file: File) => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return t("workExperience.errors.invalid_file", {
        fileName: file.name,
      });
    }

    if (file.size > maxBytes) {
      return t("workExperience.errors.file_too_large", {
        fileName: file.name,
        size: MAX_FILE_SIZE_MB,
      });
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
      setError(t("workExperience.errors.company_required"));
      return false;
    }

    if (!form.cargo.trim()) {
      setError(t("workExperience.errors.position_required"));
      return false;
    }

    if (!form.descripcion.trim()) {
      setError(t("workExperience.errors.description_required"));
      return false;
    }

    if (form.descripcion.trim().length > 1000) {
      setError(t("workExperience.errors.description_max"));
      return false;
    }

    if (!form.fecha_ini) {
      setError(t("workExperience.errors.start_date_required"));
      return false;
    }

    if (!sigueActivo && !form.fecha_fin) {
      setError(t("workExperience.errors.end_date_required"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
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
      setError(t("workExperience.errors.save_failed"));
    } finally {
      setLoading(false);
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-3 py-3 backdrop-blur-sm">
      <div className="w-full max-w-[820px] overflow-hidden rounded-[18px] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#203A63] px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-3 text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <FileText size={17} />
            </span>

            <h3 className="text-[17px] font-bold sm:text-[18px]">
              {t("workExperience.title")}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label={t("workExperience.actions.close_modal")}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
              {t("workExperience.sections.company")}
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
                {t("workExperience.fields.company")}
              </label>

              <input
                name="empresa"
                value={form.empresa}
                onChange={handleChange}
                placeholder={t("workExperience.placeholders.company")}
                className="h-10 w-full rounded-[12px] border border-slate-300 bg-slate-800 px-3.5 text-[15px] text-white outline-none placeholder:text-white/70 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
                {t("workExperience.fields.position")}
              </label>

              <input
                name="cargo"
                value={form.cargo}
                onChange={handleChange}
                placeholder={t("workExperience.placeholders.position")}
                className="h-10 w-full rounded-[12px] border border-slate-300 bg-slate-800 px-3.5 text-[15px] text-white outline-none placeholder:text-white/70 focus:border-slate-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
              {t("workExperience.fields.description")}
            </label>

            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={2}
              placeholder={t("workExperience.placeholders.description")}
              className="w-full rounded-[12px] border border-slate-300 bg-slate-800 px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-white/70 focus:border-slate-900"
            />
          </div>

          <div className="mt-4 mb-3 flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
              {t("workExperience.sections.period")}
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[12px] font-extrabold uppercase tracking-wide text-slate-600">
                {t("workExperience.fields.start_date")}
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
                {t("workExperience.fields.end_date")}
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

              <p className="mt-1 text-[11px] text-slate-400">
                {t("workExperience.helpers.empty_if_active")}
              </p>
            </div>
          </div>

          <div className="mt-4 mb-3 flex items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
              {t("workExperience.sections.documents")}
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
                {t("workExperience.upload.title")}
              </p>

              <p className="mt-1 text-[11px] text-slate-500">
                {t("workExperience.upload.subtitle", {
                  size: MAX_FILE_SIZE_MB,
                })}
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
                {t("workExperience.actions.browse_files")}
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
                        aria-label={t("workExperience.actions.delete_file", {
                          fileName: file.name,
                        })}
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
              className="rounded-xl border border-slate-200 px-5 py-2 text-[13px] font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
            >
              {t("workExperience.actions.cancel")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203A63] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#182d4b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus size={15} />
              {loading
                ? t("workExperience.actions.saving")
                : t("workExperience.actions.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExperienciaLaboralModal;