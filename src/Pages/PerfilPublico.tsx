import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ExternalLink,
  Mail,
  MapPin,
  GraduationCap,
  SquareDashedBottom,
  X,
  Copy,
  Check,
} from "lucide-react";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

type TemplateName = "Bento" | "Sidebar" | "Editorial";

interface Usuario {
  id_usuario?: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  profesion?: string;
  email?: string;
  ciudad?: string;
  pais?: string;
  institucion?: string;
  biografia?: string;
  foto?: string | null;
}

interface Habilidad {
  id_habilidad?: string;
  nombre: string;
  tipo?: "tecnica" | "blanda";
  categoria?: string | null;
  nivel?: number;
  visible?: boolean | number | string;
}

interface Proyecto {
  id_proyecto: string;
  nombre: string;
  descripcion: string;
  url_proyecto?: string;
  imagen_url?: string;
  tecnologias?: { id_tecnologia: string; nombre: string }[];
  visible?: boolean | number | string;
}

interface ExperienciaLaboral {
  id_experiencia: string;
  empresa: string;
  cargo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin?: string | null;
  visible?: boolean | number | string;
}

interface ExperienciaAcademica {
  id_experiencia_academica: string;
  institucion: string;
  titulo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin?: string | null;
  visible?: boolean | number | string;
}

interface RedProfesional {
  id_redes_prof: string;
  nombre_red: string;
  url_red: string;
  visible?: boolean | number | string;
}

interface PortafolioData {
  usuario?: Usuario;
  portafolio?: {
    id_portafolio: string;
    id_plantilla?: string | null;
    enlace_pagi_web?: string | null;
    enlace_publico?: string | null;
    url_publica?: string | null;
    slug_publico?: string | null;
    visible?: boolean | null;
    plantilla?: {
      id_plantilla?: string | null;
      nombre?: string | null;
      descripcion?: string | null;
      url_vista?: string | null;
    } | null;
  } | null;
  redes_profesionales?: RedProfesional[];
  habilidades?: Habilidad[];
  experiencias_laborales?: ExperienciaLaboral[];
  experienciasLaborales?: ExperienciaLaboral[];
  experiencias_academicas?: ExperienciaAcademica[];
  experienciasAcademicas?: ExperienciaAcademica[];
  proyectos?: Proyecto[];
}

const PLANTILLA_ID_MAP: Record<string, TemplateName> = {
  "01KQR862E61WHCR4HK8PZVPF91": "Bento",
  "01KQR8685VJ6E9KY278ABW3AZZ": "Sidebar",
  "01KQR869F2CJPHC6446XFVSJAD": "Editorial",
};

const isVisible = (value?: boolean | number | string) => {
  if (value === undefined || value === null) return true;
  return value === true || value === 1 || value === "1" || value === "true";
};

const getFullName = (u?: Usuario | null) =>
  [u?.nombre, u?.apellido_paterno, u?.apellido_materno]
    .filter(Boolean)
    .join(" ") || "Usuario";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPeriod(
  fechaIni: string,
  fechaFin?: string | null,
  currentLabel = "Actual"
) {
  const inicio = formatDate(fechaIni) || fechaIni || "";
  const fin = fechaFin ? formatDate(fechaFin) || fechaFin : currentLabel;
  return `${inicio} — ${fin}`;
}

function normalizeTemplateName(data?: PortafolioData | null): TemplateName {
  const nombre = data?.portafolio?.plantilla?.nombre?.trim()?.toLowerCase();
  if (nombre === "bento") return "Bento";
  if (nombre === "sidebar") return "Sidebar";
  if (nombre === "editorial") return "Editorial";

  const plantillaId =
    data?.portafolio?.id_plantilla ??
    data?.portafolio?.plantilla?.id_plantilla ??
    "";

  if (plantillaId && PLANTILLA_ID_MAP[plantillaId]) {
    return PLANTILLA_ID_MAP[plantillaId];
  }

  if (typeof window !== "undefined") {
    const almacenada = localStorage
      .getItem("portafolio_plantilla")
      ?.trim()
      ?.toLowerCase();

    if (almacenada === "bento") return "Bento";
    if (almacenada === "sidebar") return "Sidebar";
    if (almacenada === "editorial") return "Editorial";

    const almacenadaId = localStorage.getItem("portafolio_plantilla_id") ?? "";
    if (almacenadaId && PLANTILLA_ID_MAP[almacenadaId]) {
      return PLANTILLA_ID_MAP[almacenadaId];
    }
  }

  return "Bento";
}

function getPublicPortafolioUrl(id?: string | null, data?: PortafolioData | null) {
  const fromApi =
    data?.portafolio?.enlace_pagi_web ??
    data?.portafolio?.enlace_publico ??
    data?.portafolio?.url_publica ??
    data?.portafolio?.slug_publico ??
    "";

  if (fromApi) return fromApi;

  if (typeof window !== "undefined" && id) {
    return `${window.location.origin}/perfil-publico/${encodeURIComponent(id)}`;
  }

  return "";
}

function pickVisible<T extends { visible?: boolean | number | string }>(
  items?: T[]
) {
  return (items ?? []).filter((item) => isVisible(item.visible));
}

function topSkillNames(habilidades: Habilidad[], max: number) {
  return habilidades
    .slice()
    .sort((a, b) => (b.nivel ?? 0) - (a.nivel ?? 0))
    .slice(0, max)
    .map((h) => h.nombre)
    .filter(Boolean);
}

function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise<void>((resolve, reject) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (ok) resolve();
      else reject(new Error("No se pudo copiar el enlace."));
    } catch (error) {
      reject(error);
    }
  });
}

function PublicLinksModal({
  open,
  onClose,
  enlaces,
}: {
  open: boolean;
  onClose: () => void;
  enlaces: { label: string; url: string }[];
}) {
  const [copiedUrl, setCopiedUrl] = useState("");

  useEffect(() => {
    if (!open) setCopiedUrl("");
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = async (url: string) => {
    try {
      await copyToClipboard(url);
      setCopiedUrl(url);
      window.setTimeout(() => {
        setCopiedUrl((current) => (current === url ? "" : current));
      }, 1500);
    } catch {
      setCopiedUrl("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[680px] rounded-[28px] bg-white p-6 shadow-2xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-[28px] font-extrabold tracking-tight text-slate-900">
            Enlaces públicos
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {enlaces.length > 0 ? (
            enlaces.map((enlace) => {
              const isCopied = copiedUrl === enlace.url;

              return (
                <div
                  key={`${enlace.label}-${enlace.url}`}
                  className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 md:p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[18px] font-medium text-blue-700">
                        {enlace.label}
                      </p>
                      <p className="mt-2 break-all text-[16px] text-slate-600">
                        {enlace.url}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <a
                        href={enlace.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Abrir <ExternalLink className="h-4 w-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopy(enlace.url)}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        {isCopied ? (
                          <>
                            Copiado <Check className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Copiar enlace <Copy className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-5 text-slate-500">
              No hay enlaces públicos disponibles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-3 w-3 rounded-full bg-blue-500" />
      <h2 className="text-[20px] font-extrabold tracking-tight text-slate-800 uppercase md:text-[24px]">
        {title}
      </h2>
      <div className="h-px flex-1 bg-slate-200" />
      {actionLabel && (
        <span className="text-sm font-medium text-blue-700">{actionLabel} →</span>
      )}
    </div>
  );
}

function EmptyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
        <SquareDashedBottom className="mr-2 h-4 w-4" />
        Vista vacía
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function SkillBars({ habilidades }: { habilidades: Habilidad[] }) {
  const visibles = pickVisible(habilidades);

  if (visibles.length === 0) {
    return (
      <EmptyCard
        title="Sin habilidades registradas"
        description="Aquí se mostrarán tus habilidades con barras de nivel."
      />
    );
  }

  return (
    <div className="space-y-4">
      {visibles.slice(0, 4).map((habilidad) => {
        const pct = Math.max(0, Math.min(100, habilidad.nivel ?? 0));
        return (
          <div key={habilidad.id_habilidad || habilidad.nombre}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-medium text-slate-900">{habilidad.nombre}</span>
              <span className="text-sm text-slate-500">{pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-blue-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExperienceCard({
  exp,
  type,
}: {
  exp: ExperienciaLaboral | ExperienciaAcademica;
  type: "laboral" | "academica";
}) {
  const title =
    type === "laboral"
      ? (exp as ExperienciaLaboral).cargo
      : (exp as ExperienciaAcademica).titulo;
  const subtitle =
    type === "laboral"
      ? (exp as ExperienciaLaboral).empresa
      : (exp as ExperienciaAcademica).institucion;
  const period = formatPeriod(exp.fecha_ini, exp.fecha_fin ?? null);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-semibold text-blue-700">{period}</p>
      <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600">{subtitle}</p>
      {exp.descripcion && (
        <p className="mt-3 text-sm leading-6 text-slate-600">{exp.descripcion}</p>
      )}
    </article>
  );
}

function ExperienceTimeline({
  experiences,
  type,
  emptyTitle,
  emptyDescription,
}: {
  experiences: (ExperienciaLaboral | ExperienciaAcademica)[];
  type: "laboral" | "academica";
  emptyTitle: string;
  emptyDescription: string;
}) {
  const visibles = pickVisible(experiences);

  if (visibles.length === 0) {
    return <EmptyCard title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-4">
      {visibles.slice(0, 2).map((exp) => (
        <article
          key={
            type === "laboral"
              ? (exp as ExperienciaLaboral).id_experiencia
              : (exp as ExperienciaAcademica).id_experiencia_academica
          }
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-semibold text-blue-700">
                {formatPeriod(exp.fecha_ini, exp.fecha_fin ?? null)}
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {type === "laboral"
                  ? (exp as ExperienciaLaboral).cargo
                  : (exp as ExperienciaAcademica).titulo}
              </h3>
              <p className="text-slate-600">
                {type === "laboral"
                  ? (exp as ExperienciaLaboral).empresa
                  : (exp as ExperienciaAcademica).institucion}
              </p>
              {exp.descripcion && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {exp.descripcion}
                </p>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProjectCard({
  proyecto,
  index,
}: {
  proyecto: Proyecto;
  index: number;
}) {
  const tags = (proyecto.tecnologias ?? []).slice(0, 3).map((t) => t.nombre);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-44 border-b border-slate-200">
        {proyecto.imagen_url ? (
          <img
            src={proyecto.imagen_url}
            alt={proyecto.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
            <div className="flex h-16 w-32 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
              Vista previa
            </div>
          </div>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="p-5 md:p-6">
        <h3 className="text-xl font-bold text-blue-700">{proyecto.nombre}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {proyecto.descripcion}
        </p>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {proyecto.url_proyecto && (
          <a
            href={proyecto.url_proyecto}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Ver proyecto <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}

function PortafolioPublico() {
  const { t } = useTranslation();

  const params = useParams<{
    id?: string;
    id_usuario?: string;
    portafolioId?: string;
    slug?: string;
  }>();

  const id = params.id ?? params.id_usuario ?? params.portafolioId ?? params.slug;

  const [data, setData] = useState<PortafolioData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModalEnlaces, setMostrarModalEnlaces] = useState(false);

  useEffect(() => {
    const cargarPortafolio = async () => {
      try {
        setCargando(true);
        setError("");

        if (!id) {
          throw new Error("No se recibió un identificador válido en la ruta.");
        }

        const response = await fetch(
          `${API_BASE}/api/portafolios/${encodeURIComponent(id)}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result?.message || t("profileUser.errors.load_public_profile")
          );
        }

        const payload = result?.data ?? result?.portafolio ?? result?.contenido ?? result;
        setData(payload as PortafolioData);
      } catch (err: any) {
        setError(err?.message || t("profileUser.errors.load_profile"));
        setData(null);
      } finally {
        setCargando(false);
      }
    };

    cargarPortafolio();
  }, [id, t]);

  const usuario = data?.usuario ?? null;
  const portafolio = data?.portafolio ?? null;
  const publicUrl = useMemo(() => getPublicPortafolioUrl(id, data), [id, data]);
  const plantillaNombre = useMemo(() => normalizeTemplateName(data), [data]);
  const nombreCompleto = useMemo(() => getFullName(usuario), [usuario]);

  const inicial = useMemo(() => {
    const nombre = usuario?.nombre?.trim();
    return nombre ? nombre.charAt(0).toUpperCase() : "P";
  }, [usuario]);

  const habilidades = useMemo(() => pickVisible(data?.habilidades ?? []), [
    data?.habilidades,
  ]);

  const habilidadesTecnicas = useMemo(
    () => (habilidades ?? []).filter((h) => h.tipo !== "blanda"),
    [habilidades]
  );

  const habilidadesBlandas = useMemo(
    () => (habilidades ?? []).filter((h) => h.tipo === "blanda"),
    [habilidades]
  );

  const experienciaLaboral = useMemo(
    () => pickVisible(data?.experiencias_laborales ?? data?.experienciasLaborales ?? []),
    [data?.experiencias_laborales, data?.experienciasLaborales]
  );

  const experienciaAcademica = useMemo(
    () => pickVisible(data?.experiencias_academicas ?? data?.experienciasAcademicas ?? []),
    [data?.experiencias_academicas, data?.experienciasAcademicas]
  );

  const proyectos = useMemo(() => pickVisible(data?.proyectos ?? []), [data?.proyectos]);

  const enlacesPublicos = useMemo(() => {
    const enlaces: { label: string; url: string }[] = [];

    if (publicUrl) {
      enlaces.push({
        label: "Enlace público del portafolio",
        url: publicUrl,
      });
    }

    if (portafolio?.enlace_pagi_web && portafolio.enlace_pagi_web !== publicUrl) {
      enlaces.push({
        label: "Enlace guardado del portafolio",
        url: portafolio.enlace_pagi_web,
      });
    }

    if (portafolio?.enlace_publico && portafolio.enlace_publico !== publicUrl) {
      enlaces.push({
        label: "Enlace público alterno",
        url: portafolio.enlace_publico,
      });
    }

    if (portafolio?.url_publica && portafolio.url_publica !== publicUrl) {
      enlaces.push({
        label: "URL pública",
        url: portafolio.url_publica,
      });
    }

    if (portafolio?.plantilla?.url_vista) {
      enlaces.push({
        label: "Vista de plantilla",
        url: portafolio.plantilla.url_vista,
      });
    }

    (data?.redes_profesionales ?? [])
      .filter((red) => isVisible(red.visible))
      .forEach((red) => {
        enlaces.push({
          label: red.nombre_red,
          url: red.url_red,
        });
      });

    return enlaces;
  }, [data?.redes_profesionales, portafolio, publicUrl]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <p className="font-medium text-gray-500">{t("profileUser.loading")}</p>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            {error ? "Error al cargar el perfil" : t("profileUser.errors.profile_not_found")}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error || t("profileUser.errors.load_profile")}
          </p>
        </div>
      </div>
    );
  }

  let layout: ReactNode;

  switch (plantillaNombre) {
    case "Sidebar":
      layout = (
        <PortafolioSidebar
          usuario={usuario}
          nombreCompleto={nombreCompleto}
          inicial={inicial}
          habilidadesTecnicas={habilidadesTecnicas}
          experienciaLaboral={experienciaLaboral}
          experienciaAcademica={experienciaAcademica}
          proyectos={proyectos}
          publicUrl={publicUrl}
          onOpenPublicLinks={() => setMostrarModalEnlaces(true)}
        />
      );
      break;

    case "Editorial":
      layout = (
        <PortafolioEditorial
          usuario={usuario}
          nombreCompleto={nombreCompleto}
          inicial={inicial}
          habilidadesTecnicas={habilidadesTecnicas}
          habilidadesBlandas={habilidadesBlandas}
          experienciaLaboral={experienciaLaboral}
          experienciaAcademica={experienciaAcademica}
          proyectos={proyectos}
          publicUrl={publicUrl}
          onOpenPublicLinks={() => setMostrarModalEnlaces(true)}
        />
      );
      break;

    case "Bento":
    default:
      layout = (
        <PortafolioBento
          usuario={usuario}
          nombreCompleto={nombreCompleto}
          inicial={inicial}
          habilidades={habilidades}
          experienciaLaboral={experienciaLaboral}
          experienciaAcademica={experienciaAcademica}
          proyectos={proyectos}
          publicUrl={publicUrl}
          onOpenPublicLinks={() => setMostrarModalEnlaces(true)}
        />
      );
      break;
  }

  return (
    <>
      {layout}
      <PublicLinksModal
        open={mostrarModalEnlaces}
        onClose={() => setMostrarModalEnlaces(false)}
        enlaces={enlacesPublicos}
      />
    </>
  );
}

function PortafolioBento({
  usuario,
  nombreCompleto,
  inicial,
  habilidades = [],
  experienciaLaboral = [],
  experienciaAcademica = [],
  proyectos = [],
  publicUrl = "",
  onOpenPublicLinks,
}: {
  usuario: Usuario;
  nombreCompleto: string;
  inicial: string;
  habilidades?: Habilidad[];
  experienciaLaboral?: ExperienciaLaboral[];
  experienciaAcademica?: ExperienciaAcademica[];
  proyectos?: Proyecto[];
  publicUrl?: string;
  onOpenPublicLinks?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-4 py-6 font-inter md:px-0 md:py-10">
      <div className="mx-auto flex max-w-[1240px] flex-col overflow-hidden rounded-[16px] shadow-2xl">
        <header className="relative shrink-0 overflow-hidden bg-[#1F4E79] p-6 text-white md:p-12">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-8">
              <div className="mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-white/20 shadow-inner md:mx-0 md:h-32 md:w-32">
                {usuario.foto ? (
                  <img
                    src={usuario.foto}
                    alt={nombreCompleto}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/10 text-4xl font-bold">
                    {inicial}
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-[32px] font-bold tracking-tight md:text-[42px]">
                  {nombreCompleto}
                </h1>
                <p className="mt-2 text-[18px] font-medium italic text-blue-200 opacity-90 md:text-[20px]">
                  {usuario.profesion || t("profileUser.defaults.professional")}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[13px] font-medium md:justify-start">
                  {usuario.email && (
                    <span className="flex items-center gap-2.5 opacity-80">
                      <Mail size={16} />
                      <span className="break-all">{usuario.email}</span>
                    </span>
                  )}

                  {(usuario.ciudad || usuario.pais) && (
                    <span className="flex items-center gap-2.5 opacity-80">
                      <MapPin size={16} />
                      <span>
                        {usuario.ciudad || ""}
                        {usuario.ciudad && usuario.pais ? ", " : ""}
                        {usuario.pais || ""}
                      </span>
                    </span>
                  )}

                  {usuario.institucion && (
                    <span className="flex items-center gap-2.5 opacity-80">
                      <GraduationCap size={18} />
                      {usuario.institucion}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {publicUrl && (
              <div className="flex justify-center lg:justify-end">
                <button
                  type="button"
                  onClick={onOpenPublicLinks}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Enlace público
                </button>
              </div>
            )}
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap gap-2">
            {topSkillNames(habilidades ?? [], 4).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </header>

        <div className="flex flex-col gap-12 border-t border-white/10 bg-white p-6 md:gap-16 md:p-10 lg:p-16">
          <section>
            <SectionHeading title="Sobre mí" />
            <p className="mt-4 max-w-5xl text-[16px] font-medium leading-relaxed text-slate-600 md:text-[18px]">
              {usuario.biografia || t("profileUser.defaults.no_biography")}
            </p>
          </section>

          <section>
            <SectionHeading title="Experiencia laboral" />
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {experienciaLaboral.length > 0 ? (
                experienciaLaboral.map((exp) => (
                  <ExperienceCard
                    key={exp.id_experiencia}
                    exp={exp}
                    type="laboral"
                  />
                ))
              ) : (
                <EmptyCard
                  title={t("profileUser.empty.no_experience")}
                  description={t("profileUser.defaults.no_description")}
                />
              )}
            </div>
          </section>

          <section>
            <SectionHeading title="Proyectos" />
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {proyectos.length > 0 ? (
                proyectos.slice(0, 3).map((proyecto, index) => (
                  <ProjectCard
                    key={proyecto.id_proyecto}
                    proyecto={proyecto}
                    index={index + 1}
                  />
                ))
              ) : (
                <EmptyCard
                  title={t("profileUser.empty.no_projects")}
                  description={t("profileUser.defaults.no_description")}
                />
              )}
            </div>
          </section>

          <section>
            <SectionHeading title="Habilidades" />
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-bold text-slate-900">
                  Habilidades técnicas
                </h3>
                <SkillBars
                  habilidades={(habilidades ?? []).filter((h) => h.tipo !== "blanda")}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-lg font-bold text-slate-900">
                  Habilidades blandas
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(habilidades ?? []).filter((h) => h.tipo === "blanda").length > 0 ? (
                    habilidades
                      .filter((h) => h.tipo === "blanda")
                      .slice(0, 12)
                      .map((habilidad) => (
                        <span
                          key={habilidad.id_habilidad || habilidad.nombre}
                          className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                        >
                          {habilidad.nombre}
                        </span>
                      ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No hay habilidades blandas registradas.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading title="Experiencia académica" />
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {experienciaAcademica.length > 0 ? (
                experienciaAcademica.map((edu) => (
                  <ExperienceCard
                    key={edu.id_experiencia_academica}
                    exp={edu}
                    type="academica"
                  />
                ))
              ) : (
                <EmptyCard
                  title={t("profileUser.empty.no_academic_experience")}
                  description={t("profileUser.defaults.no_description")}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PortafolioSidebar({
  usuario,
  nombreCompleto,
  inicial,
  habilidadesTecnicas = [],
  experienciaLaboral = [],
  experienciaAcademica = [],
  proyectos = [],
  publicUrl = "",
  onOpenPublicLinks,
}: {
  usuario: Usuario;
  nombreCompleto: string;
  inicial: string;
  habilidadesTecnicas?: Habilidad[];
  experienciaLaboral?: ExperienciaLaboral[];
  experienciaAcademica?: ExperienciaAcademica[];
  proyectos?: Proyecto[];
  publicUrl?: string;
  onOpenPublicLinks?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-inter">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-6 md:px-6 lg:grid-cols-[320px_1fr] lg:px-0 lg:py-10">
        <aside className="self-start rounded-[16px] bg-[#1F4E79] p-6 text-white shadow-2xl lg:sticky lg:top-6">
          {publicUrl && (
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={onOpenPublicLinks}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Enlace público
              </button>
            </div>
          )}

          <div className="flex flex-col items-center text-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 shadow-inner">
              {usuario.foto ? (
                <img
                  src={usuario.foto}
                  alt={nombreCompleto}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/10 text-4xl font-bold">
                  {inicial}
                </div>
              )}
            </div>

            <h1 className="mt-5 text-2xl font-bold">{nombreCompleto}</h1>
            <p className="mt-2 text-sm text-blue-100 opacity-80">
              {usuario.profesion || t("profileUser.defaults.professional")}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">
                Email
              </p>
              <p className="mt-2 break-all text-sm text-white/90">
                {usuario.email || "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">
                Ubicación
              </p>
              <p className="mt-2 text-sm text-white/90">
                {[usuario.ciudad, usuario.pais].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-blue-100">
              Habilidades
            </p>
            <SkillBars habilidades={habilidadesTecnicas ?? []} />
          </div>
        </aside>

        <main className="space-y-8">
          <section className="rounded-[16px] bg-white p-6 shadow-xl md:p-8">
            <SectionHeading title="Sobre mí" />
            <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600 md:text-lg">
              {usuario.biografia || t("profileUser.defaults.no_biography")}
            </p>
          </section>

          <section className="rounded-[16px] bg-white p-6 shadow-xl md:p-8">
            <SectionHeading title="Proyectos" />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {proyectos.length > 0 ? (
                proyectos.slice(0, 4).map((proyecto, index) => (
                  <ProjectCard
                    key={proyecto.id_proyecto}
                    proyecto={proyecto}
                    index={index + 1}
                  />
                ))
              ) : (
                <EmptyCard
                  title={t("profileUser.empty.no_projects")}
                  description={t("profileUser.defaults.no_description")}
                />
              )}
            </div>
          </section>

          <section className="rounded-[16px] bg-white p-6 shadow-xl md:p-8">
            <SectionHeading title="Experiencia laboral" />
            <div className="mt-6 space-y-4">
              <ExperienceTimeline
                experiences={experienciaLaboral}
                type="laboral"
                emptyTitle={t("profileUser.empty.no_experience")}
                emptyDescription={t("profileUser.defaults.no_description")}
              />
            </div>
          </section>

          <section className="rounded-[16px] bg-white p-6 shadow-xl md:p-8">
            <SectionHeading title="Experiencia académica" />
            <div className="mt-6 space-y-4">
              <ExperienceTimeline
                experiences={experienciaAcademica}
                type="academica"
                emptyTitle={t("profileUser.empty.no_academic_experience")}
                emptyDescription={t("profileUser.defaults.no_description")}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function PortafolioEditorial({
  usuario,
  nombreCompleto,
  inicial,
  habilidadesTecnicas = [],
  habilidadesBlandas = [],
  experienciaLaboral = [],
  experienciaAcademica = [],
  proyectos = [],
  publicUrl = "",
  onOpenPublicLinks,
}: {
  usuario: Usuario;
  nombreCompleto: string;
  inicial: string;
  habilidadesTecnicas?: Habilidad[];
  habilidadesBlandas?: Habilidad[];
  experienciaLaboral?: ExperienciaLaboral[];
  experienciaAcademica?: ExperienciaAcademica[];
  proyectos?: Proyecto[];
  publicUrl?: string;
  onOpenPublicLinks?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-4 py-6 font-inter md:px-0 md:py-10">
      <div className="mx-auto max-w-[1240px] overflow-hidden rounded-[16px] shadow-2xl">
        <header className="bg-[#1F4E79] p-6 text-white md:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-8">
              <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 shadow-inner md:mx-0 md:h-32 md:w-32">
                {usuario.foto ? (
                  <img
                    src={usuario.foto}
                    alt={nombreCompleto}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/10 text-4xl font-bold">
                    {inicial}
                  </div>
                )}
              </div>

              <div className="text-center md:text-left">
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  Portafolio público
                </span>
                <h1 className="mt-4 text-[34px] font-bold tracking-tight md:text-[48px]">
                  {nombreCompleto}
                </h1>
                <p className="mt-3 max-w-3xl text-[16px] leading-7 text-blue-100 md:text-[18px]">
                  {usuario.biografia || t("profileUser.defaults.no_biography")}
                </p>
              </div>
            </div>

            {publicUrl && (
              <div className="flex justify-center lg:justify-end">
                <button
                  type="button"
                  onClick={onOpenPublicLinks}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Enlace público
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {usuario.email && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <Mail size={14} />
                {usuario.email}
              </span>
            )}

            {(usuario.ciudad || usuario.pais) && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <MapPin size={14} />
                {[usuario.ciudad, usuario.pais].filter(Boolean).join(", ") || "—"}
              </span>
            )}

            {usuario.institucion && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <GraduationCap size={14} />
                {usuario.institucion}
              </span>
            )}
          </div>
        </header>

        <div className="flex flex-col gap-12 bg-white p-6 md:gap-16 md:p-10 lg:p-16">
          <section>
            <SectionHeading title="Sobre mí" />
            <p className="mt-4 max-w-5xl text-[16px] font-medium leading-relaxed text-slate-600 md:text-[18px]">
              {usuario.biografia || t("profileUser.defaults.no_biography")}
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <SectionHeading title="Experiencia laboral" />
              <div className="mt-6 space-y-4">
                <ExperienceTimeline
                  experiences={experienciaLaboral}
                  type="laboral"
                  emptyTitle={t("profileUser.empty.no_experience")}
                  emptyDescription={t("profileUser.defaults.no_description")}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <SectionHeading title="Habilidades" />
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Habilidades técnicas
                  </h3>
                  <SkillBars habilidades={habilidadesTecnicas ?? []} />
                </div>

                <div className="pt-4">
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Habilidades blandas
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(habilidadesBlandas ?? []).length > 0 ? (
                      (habilidadesBlandas ?? []).slice(0, 12).map((habilidad) => (
                        <span
                          key={habilidad.id_habilidad || habilidad.nombre}
                          className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                        >
                          {habilidad.nombre}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No hay habilidades blandas registradas.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading title="Proyectos" />
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {proyectos.length > 0 ? (
                proyectos.slice(0, 4).map((proyecto, index) => (
                  <ProjectCard
                    key={proyecto.id_proyecto}
                    proyecto={proyecto}
                    index={index + 1}
                  />
                ))
              ) : (
                <EmptyCard
                  title={t("profileUser.empty.no_projects")}
                  description={t("profileUser.defaults.no_description")}
                />
              )}
            </div>
          </section>

          <section>
            <SectionHeading title="Experiencia académica" />
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {experienciaAcademica.length > 0 ? (
                experienciaAcademica.map((edu) => (
                  <ExperienceCard
                    key={edu.id_experiencia_academica}
                    exp={edu}
                    type="academica"
                  />
                ))
              ) : (
                <EmptyCard
                  title={t("profileUser.empty.no_academic_experience")}
                  description={t("profileUser.defaults.no_description")}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PortafolioPublico;