import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ExternalLink,
  Mail,
  SquareDashedBottom,
} from "lucide-react";
import { descargarPortafolioPDF } from "./PortafolioPdf";

const API_URL = "http://localhost:8000";

type TemplateName = "Bento" | "Sidebar" | "Editorial";

interface Habilidad {
  id_habilidad: string;
  nombre: string;
  tipo?: string | null;
  categoria?: string | null;
  nivel: number;
  visible?: boolean;
}

interface Proyecto {
  id_proyecto: string;
  nombre: string;
  descripcion: string;
  url_proyecto?: string;
  imagen_url?: string;
  tecnologias?: { id_tecnologia: string; nombre: string }[];
  visible?: boolean;
}

interface ExperienciaLaboral {
  id_experiencia: string;
  empresa: string;
  cargo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin?: string | null;
  visible?: boolean;
}

interface ExperienciaAcademica {
  id_experiencia_academica: string;
  institucion: string;
  titulo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin?: string | null;
  visible?: boolean;
}

interface RedProfesional {
  id_redes_prof: string;
  nombre_red: string;
  url_red: string;
  visible?: boolean;
}

interface PortafolioData {
  usuario: {
    id_usuario: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    email: string;
    biografia?: string | null;
    foto?: string | null;
    fecha?: string | null;
  };
  portafolio: {
    id_portafolio: string;
    id_plantilla?: string | null;
    enlace_pagi_web?: string | null;
    visible?: boolean;
    creado_en?: string | null;
    fecha_act?: string | null;
    plantilla?: {
      id_plantilla: string;
      nombre?: string | null;
      descripcion?: string | null;
      url_vista?: string | null;
    } | null;
  } | null;
  redes_profesionales: RedProfesional[];
  habilidades: Habilidad[];
  experiencias_laborales: ExperienciaLaboral[];
  experiencias_academicas: ExperienciaAcademica[];
  proyectos: Proyecto[];
}

type Theme = {
  page: string;
  shell: string;
  hero: string;
  card: string;
  cardSoft: string;
  title: string;
  titleSmall: string;
  body: string;
  sub: string;
  social: string;
  chip: string;
  linkChip: string;
  projectCard: string;
  projectPreview: string;
  projectTitle: string;
  projectText: string;
  projectTag: string;
  projectLink: string;
  emptyCard: string;
  barBg: string;
  accent: string;
  statCard: string;
  sectionLine: string;
  button: string;
  buttonGhost: string;
  badge: string;
};

const theme: Theme = {
  page: "min-h-screen bg-[#f8fafc] text-slate-900",
  shell: "mx-auto max-w-7xl px-6 py-10",
  hero: "rounded-3xl border border-slate-200 bg-white p-8 shadow-xl",
  card: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
  cardSoft: "rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm",
  title: "text-3xl font-bold text-blue-700",
  titleSmall: "text-2xl font-semibold text-blue-700",
  body: "text-slate-600",
  sub: "text-slate-500",
  social:
    "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50",
  chip: "rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-700",
  linkChip:
    "rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-700 transition hover:border-blue-300 hover:bg-blue-100",
  projectCard:
    "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg",
  projectPreview:
    "flex h-full items-center justify-center bg-slate-100 text-slate-500",
  projectTitle: "text-xl font-bold text-blue-700",
  projectText: "mt-3 text-sm leading-6 text-slate-600",
  projectTag: "rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700",
  projectLink:
    "mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700",
  emptyCard: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
  barBg: "h-3 rounded-full bg-slate-200",
  accent: "text-blue-600",
  statCard: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
  sectionLine: "h-px flex-1 bg-slate-200",
  button:
    "inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-3 font-medium text-white transition hover:bg-blue-600",
  buttonGhost:
    "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed",
  badge:
    "inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700",
};

const PLANTILLA_ID_MAP: Record<string, TemplateName> = {
  "01KQR862E61WHCR4HK8PZVPF91": "Bento",
  "01KQR8685VJ6E9KY278ABW3AZZ": "Sidebar",
  "01KQR869F2CJPHC6446XFVSJAD": "Editorial",
};

function Portafolio() {
  const [data, setData] = useState<PortafolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModalEnlaces, setMostrarModalEnlaces] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    const fetchPortafolio = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("access_token");

        if (!token) {
          throw new Error("No hay token guardado. Inicia sesión nuevamente.");
        }

        const response = await fetch(`${API_URL}/api/portafolio/completo`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("access_token");
          throw new Error(
            "Tu sesión expiró o el token no es válido. Inicia sesión nuevamente."
          );
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error ${response.status}`);
        }

        const result = (await response.json()) as PortafolioData;
        setData(result);
      } catch (err) {
        console.error("Error al cargar el portafolio:", err);
        setData(null);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchPortafolio();
  }, []);

  const usuario = data?.usuario;
  const portafolio = data?.portafolio;

  const plantillaNombre = useMemo(() => {
    const nombre = portafolio?.plantilla?.nombre?.trim();
    const plantillaId =
      portafolio?.id_plantilla ??
      portafolio?.plantilla?.id_plantilla ??
      localStorage.getItem("portafolio_plantilla") ??
      "";

    const normalized = nombre?.toLowerCase();
    if (normalized === "bento") return "Bento";
    if (normalized === "sidebar") return "Sidebar";
    if (normalized === "editorial") return "Editorial";

    return PLANTILLA_ID_MAP[plantillaId] ?? "Bento";
  }, [portafolio]);

  const nombreCompleto = useMemo(() => {
    if (!usuario) return "Mi portafolio";
    return `${usuario.nombre || ""} ${usuario.apellido_paterno || ""}`.trim();
  }, [usuario]);

  const inicial = useMemo(() => {
    const nombre = usuario?.nombre?.trim();
    return nombre ? nombre.charAt(0).toUpperCase() : "P";
  }, [usuario]);

  const experienciaVisible = useMemo(
    () =>
      (data?.experiencias_laborales ?? []).filter(
        (exp) => exp.visible !== false
      ),
    [data?.experiencias_laborales]
  );

  const academicaVisible = useMemo(
    () =>
      (data?.experiencias_academicas ?? []).filter(
        (edu) => edu.visible !== false
      ),
    [data?.experiencias_academicas]
  );

  const habilidadesVisibles = useMemo(
    () => (data?.habilidades ?? []).filter((h) => h.visible !== false),
    [data?.habilidades]
  );

  const proyectosVisibles = useMemo(
    () => (data?.proyectos ?? []).filter((p) => p.visible !== false),
    [data?.proyectos]
  );

  const enlacesPublicos = useMemo(() => {
    const enlaces: { label: string; url: string }[] = [];

    if (data?.portafolio?.enlace_pagi_web) {
      enlaces.push({
        label: "Enlace público del portafolio",
        url: data.portafolio.enlace_pagi_web,
      });
    }

    (data?.redes_profesionales ?? [])
      .filter((red) => red.visible !== false)
      .forEach((red) => {
        enlaces.push({
          label: red.nombre_red,
          url: red.url_red,
        });
      });

    return enlaces;
  }, [data]);

  const abrirModalEnlaces = () => setMostrarModalEnlaces(true);
  const cerrarModalEnlaces = () => setMostrarModalEnlaces(false);

  const handleDescargarPDF = () => {
    if (!data) return;
    try {
      setGenerandoPDF(true);
      descargarPortafolioPDF(data, nombreCompleto);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] text-slate-700">
        Cargando portafolio...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 text-slate-700">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            No se pudo cargar el portafolio.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {error ?? "Error desconocido"}
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
          data={data}
          theme={theme}
          nombreCompleto={nombreCompleto}
          inicial={inicial}
          proyectosVisibles={proyectosVisibles}
          experienciaVisible={experienciaVisible}
          habilidadesVisibles={habilidadesVisibles}
          onOpenEnlaces={abrirModalEnlaces}
          onDescargarPDF={handleDescargarPDF}
          generandoPDF={generandoPDF}
        />
      );
      break;
    case "Editorial":
      layout = (
        <PortafolioEditorial
          data={data}
          theme={theme}
          nombreCompleto={nombreCompleto}
          inicial={inicial}
          proyectosVisibles={proyectosVisibles}
          experienciaVisible={experienciaVisible}
          habilidadesVisibles={habilidadesVisibles}
          academicaVisible={academicaVisible}
          onOpenEnlaces={abrirModalEnlaces}
          onDescargarPDF={handleDescargarPDF}
          generandoPDF={generandoPDF}
        />
      );
      break;
    case "Bento":
    default:
      layout = (
        <PortafolioBento
          data={data}
          theme={theme}
          nombreCompleto={nombreCompleto}
          inicial={inicial}
          proyectosVisibles={proyectosVisibles}
          experienciaVisible={experienciaVisible}
          habilidadesVisibles={habilidadesVisibles}
          onOpenEnlaces={abrirModalEnlaces}
          onDescargarPDF={handleDescargarPDF}
          generandoPDF={generandoPDF}
        />
      );
      break;
  }

  return (
    <>
      {layout}

      {mostrarModalEnlaces && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-slate-900">
                Enlaces públicos
              </h3>
              <button
                type="button"
                onClick={cerrarModalEnlaces}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {enlacesPublicos.length > 0 ? (
                enlacesPublicos.map((enlace) => (
                  <a
                    key={`${enlace.label}-${enlace.url}`}
                    href={enlace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition hover:bg-slate-100"
                  >
                    <p className="font-medium text-blue-700">{enlace.label}</p>
                    <p className="mt-1 break-all text-sm text-slate-600">
                      {enlace.url}
                    </p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No hay enlaces públicos registrados.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PortafolioBento({
  data,
  theme,
  nombreCompleto,
  inicial,
  proyectosVisibles,
  experienciaVisible,
  habilidadesVisibles,
  onOpenEnlaces,
  onDescargarPDF,
  generandoPDF,
}: {
  data: PortafolioData;
  theme: Theme;
  nombreCompleto: string;
  inicial: string;
  proyectosVisibles: Proyecto[];
  experienciaVisible: ExperienciaLaboral[];
  habilidadesVisibles: Habilidad[];
  onOpenEnlaces: () => void;
  onDescargarPDF: () => void;
  generandoPDF: boolean;
}) {
  return (
    <div className={theme.page}>
      <div className={theme.shell}>
        <BentoHero
          data={data}
          theme={theme}
          nombreCompleto={nombreCompleto}
          inicial={inicial}
          habilidadesVisibles={habilidadesVisibles}
          onOpenEnlaces={onOpenEnlaces}
        />

        <section className="mt-8">
          <SectionHeading
            title="Proyectos destacados"
            actionLabel="Destacados"
            theme={theme}
          />
          <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {proyectosVisibles.slice(0, 3).map((proyecto, index) => (
              <BentoProjectCard
                key={proyecto.id_proyecto}
                proyecto={proyecto}
                index={index + 1}
                theme={theme}
              />
            ))}
            {proyectosVisibles.length === 0 && (
              <EmptyCard theme={theme} title="Sin proyectos aún" />
            )}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="Experiencia" theme={theme} />
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {experienceCards(experienciaVisible, theme)}
            {experienciaVisible.length === 0 && (
              <EmptyCard theme={theme} title="Sin experiencia registrada" />
            )}
          </div>
        </section>

        <FooterCTA
          theme={theme}
          title="Contáctame"
          subtitle="Estoy disponible para proyectos y colaboraciones."
          secondaryLabel="CV"
          onDescargarPDF={onDescargarPDF}
          generandoPDF={generandoPDF}
        />
      </div>
    </div>
  );
}

function PortafolioSidebar({
  data,
  theme,
  nombreCompleto,
  inicial,
  proyectosVisibles,
  experienciaVisible,
  habilidadesVisibles,
  onOpenEnlaces,
  onDescargarPDF,
  generandoPDF,
}: {
  data: PortafolioData;
  theme: Theme;
  nombreCompleto: string;
  inicial: string;
  proyectosVisibles: Proyecto[];
  experienciaVisible: ExperienciaLaboral[];
  habilidadesVisibles: Habilidad[];
  onOpenEnlaces: () => void;
  onDescargarPDF: () => void;
  generandoPDF: boolean;
}) {
  const stats = [
    { label: "Proyectos", value: proyectosVisibles.length },
    { label: "Habilidades", value: habilidadesVisibles.length },
    { label: "Exp.", value: experienciaVisible.length },
  ];

  return (
    <div className={theme.page}>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:grid lg:grid-cols-[320px_1fr] lg:gap-8">
        <aside className={`self-start ${theme.hero} lg:sticky lg:top-6`}>
          <div className="flex items-center gap-5">
            {data.usuario.foto ? (
              <img
                src={data.usuario.foto}
                alt={nombreCompleto}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-100"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold text-white ring-4 ring-blue-100">
                {inicial}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-blue-700">{nombreCompleto}</h1>
              <p className={`mt-2 text-sm ${theme.body}`}>
                {data.usuario.biografia ||
                  "Profesional apasionado por crear soluciones innovadoras y escalables."}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <SidebarSectionTitle title="Habilidades" theme={theme} />
            <SkillBars habilidades={habilidadesVisibles.slice(0, 4)} theme={theme} />
          </div>

          <div className="mt-6 space-y-4">
            <SidebarSectionTitle title="Stack" theme={theme} />
            <ChipCloud items={topSkillNames(habilidadesVisibles, 8)} theme={theme} />
          </div>

          <div className="mt-6 space-y-4">
            <SidebarSectionTitle title="En números" theme={theme} />
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className={theme.statCard}>
                  <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                  <p className={`mt-1 text-xs uppercase tracking-[0.18em] ${theme.sub}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {data.usuario.email && (
              <a href={`mailto:${data.usuario.email}`} className={theme.cardSoft}>
                <p className={`text-xs uppercase tracking-[0.18em] ${theme.sub}`}>Email</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{data.usuario.email}</p>
              </a>
            )}

            <button
              type="button"
              onClick={onOpenEnlaces}
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            >
              Enlaces públicos
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <SocialLinks redes={data.redes_profesionales} theme={theme} />
          </div>
        </aside>

        <main className="mt-8 space-y-8 lg:mt-0">
          <section>
            <SectionHeading title="Proyectos" theme={theme} />
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {proyectosVisibles.slice(0, 4).map((proyecto, index) => (
                <SidebarProjectCard key={proyecto.id_proyecto} proyecto={proyecto} index={index + 1} theme={theme} />
              ))}
              {proyectosVisibles.length === 0 && (
                <EmptyCard theme={theme} title="Sin proyectos visibles" />
              )}
            </div>
          </section>

          <section>
            <SectionHeading title="Experiencia" theme={theme} />
            <div className="mt-4 space-y-4">
              {experienceTimeline(experienciaVisible, theme)}
            </div>
          </section>

          <FooterCTA
            theme={theme}
            title="Contáctame"
            subtitle="Estoy disponible para proyectos y colaboraciones."
            secondaryLabel="CV"
            onDescargarPDF={onDescargarPDF}
            generandoPDF={generandoPDF}
          />
        </main>
      </div>
    </div>
  );
}

function PortafolioEditorial({
  data,
  theme,
  nombreCompleto,
  inicial,
  proyectosVisibles,
  experienciaVisible,
  habilidadesVisibles,
  academicaVisible,
  onOpenEnlaces,
  onDescargarPDF,
  generandoPDF,
}: {
  data: PortafolioData;
  theme: Theme;
  nombreCompleto: string;
  inicial: string;
  proyectosVisibles: Proyecto[];
  experienciaVisible: ExperienciaLaboral[];
  habilidadesVisibles: Habilidad[];
  academicaVisible: ExperienciaAcademica[];
  onOpenEnlaces: () => void;
  onDescargarPDF: () => void;
  generandoPDF: boolean;
}) {
  return (
    <div className={theme.page}>
      <div className={theme.shell}>
        <header className={theme.hero}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              {data.usuario.foto ? (
                <img
                  src={data.usuario.foto}
                  alt={nombreCompleto}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-100"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold text-white ring-4 ring-blue-100">
                  {inicial}
                </div>
              )}

              <div>
                <span className={theme.badge}>Full Stack Developer</span>
                <h1 className="mt-3 text-5xl font-bold tracking-tight text-blue-700">
                  {nombreCompleto}
                </h1>
                <p className={`mt-3 max-w-3xl text-lg ${theme.body}`}>
                  {data.usuario.biografia ||
                    "Backend, APIs y microservicios. Soluciones web modernas y escalables."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <SocialLinks redes={data.redes_profesionales} theme={theme} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            {data.usuario.email && (
              <span className={theme.chip}>
                <span className="inline-flex items-center gap-2">
                  <Mail size={14} />
                  {data.usuario.email}
                </span>
              </span>
            )}

            <button
              type="button"
              onClick={onOpenEnlaces}
              className={theme.linkChip}
            >
              Enlaces públicos
            </button>
          </div>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <SectionHeading title="Sobre mí" theme={theme} />
          <div className="mt-4 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold text-white ring-4 ring-blue-100">
              {inicial}
            </div>
            <p className={`max-w-4xl text-lg leading-8 ${theme.body}`}>
              {data.usuario.biografia ||
                "Desarrollador enfocado en backend y arquitecturas escalables con experiencia en APIs y microservicios. Me apasiona construir sistemas robustos, eficientes y bien documentados."}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="Experiencia & stack" theme={theme} />
          <div className="mt-4 grid gap-8 lg:grid-cols-2">
            <div className={theme.card}>
              <div className="space-y-4">{experienceTimeline(experienciaVisible, theme)}</div>
            </div>

            <div className={theme.card}>
              <div className="space-y-3">{skillsEditorial(habilidadesVisibles, theme)}</div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="Proyectos" theme={theme} />
          <div className="mt-4 space-y-4">
            {proyectosVisibles.slice(0, 4).map((proyecto, index) => (
              <EditorialProjectRow key={proyecto.id_proyecto} proyecto={proyecto} index={index + 1} theme={theme} />
            ))}
            {proyectosVisibles.length === 0 && (
              <div className={theme.card}>
                <p className="font-semibold text-slate-900">Sin proyectos aún</p>
                <p className={`mt-2 ${theme.body}`}>
                  Los proyectos publicados aparecerán aquí en una vista lineal.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="Formación" theme={theme} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {academicaVisible.map((edu) => (
              <article key={edu.id_experiencia_academica} className={theme.card}>
                <p className={`text-sm ${theme.accent}`}>{formatPeriod(edu.fecha_ini, edu.fecha_fin)}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{edu.titulo}</h3>
                <p className="text-slate-600">{edu.institucion}</p>
                <p className={`mt-3 text-sm leading-6 ${theme.body}`}>{edu.descripcion}</p>
              </article>
            ))}
            {academicaVisible.length === 0 && (
              <div className={`${theme.emptyCard} md:col-span-2`}>
                <p className="font-semibold text-slate-900">Sin experiencia académica registrada</p>
                <p className={`mt-2 leading-6 ${theme.body}`}>
                  Aquí aparecerán tus estudios y certificaciones.
                </p>
              </div>
            )}
          </div>
        </section>

        <FooterCTA
          theme={theme}
          title="Contáctame"
          subtitle="Estoy disponible para proyectos y colaboraciones."
          secondaryLabel="CV"
          onDescargarPDF={onDescargarPDF}
          generandoPDF={generandoPDF}
        />
      </div>
    </div>
  );
}

function BentoHero({
  data,
  theme,
  nombreCompleto,
  inicial,
  habilidadesVisibles,
  onOpenEnlaces,
}: {
  data: PortafolioData;
  theme: Theme;
  nombreCompleto: string;
  inicial: string;
  habilidadesVisibles: Habilidad[];
  onOpenEnlaces: () => void;
}) {
  const topChips = topSkillNames(habilidadesVisibles, 4);

  return (
    <header className={theme.hero}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          {data.usuario.foto ? (
            <img
              src={data.usuario.foto}
              alt={nombreCompleto}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-100"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-4xl font-bold text-white ring-4 ring-blue-100">
              {inicial}
            </div>
          )}

          <div>
            <span className={theme.badge}>Full Stack Developer</span>
            <h1 className="mt-3 text-5xl font-bold tracking-tight text-blue-700">
              {nombreCompleto}
            </h1>
            <p className={`mt-3 max-w-3xl text-lg ${theme.body}`}>
              {data.usuario.biografia ||
                "Desarrollo soluciones web modernas y escalables. Enfocado en backend, APIs y microservicios con arquitecturas robustas."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <SocialLinks redes={data.redes_profesionales} theme={theme} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        {data.usuario.email && (
          <span className={theme.chip}>
            <span className="inline-flex items-center gap-2">
              <Mail size={14} />
              {data.usuario.email}
            </span>
          </span>
        )}

        <button type="button" onClick={onOpenEnlaces} className={theme.linkChip}>
          Enlaces públicos
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {topChips.map((chip) => (
          <span key={chip} className={theme.chip}>
            {chip}
          </span>
        ))}
      </div>
    </header>
  );
}

function SocialLinks({
  redes,
  theme,
}: {
  redes: RedProfesional[];
  theme: Theme;
}) {
  if (!redes || redes.length === 0) return null;

  return redes.map((red) => (
    <a
      key={red.id_redes_prof}
      href={red.url_red}
      target="_blank"
      rel="noopener noreferrer"
      className={theme.social}
    >
      {red.nombre_red}
    </a>
  ));
}

function SectionHeading({
  title,
  theme,
  actionLabel,
}: {
  title: string;
  theme: Theme;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-3 w-3 rounded-full bg-blue-500" />
      <h2 className={theme.titleSmall}>{title}</h2>
      <div className={theme.sectionLine} />
      {actionLabel && (
        <span className={`text-sm font-medium ${theme.accent}`}>{actionLabel} →</span>
      )}
    </div>
  );
}

function SidebarSectionTitle({
  title,
  theme,
}: {
  title: string;
  theme: Theme;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={theme.sectionLine} />
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme.accent}`}>
        {title}
      </p>
      <span className={theme.sectionLine} />
    </div>
  );
}

function BentoProjectCard({
  proyecto,
  index,
  theme,
}: {
  proyecto: Proyecto;
  index: number;
  theme: Theme;
}) {
  const tags = (proyecto.tecnologias ?? []).slice(0, 3).map((t) => t.nombre);

  return (
    <article className={theme.projectCard}>
      <div className="relative h-48 border-b border-slate-200">
        {proyecto.imagen_url ? (
          <img
            src={proyecto.imagen_url}
            alt={proyecto.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={theme.projectPreview}>
            <div className="flex h-16 w-32 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
              Vista previa
            </div>
          </div>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="p-6">
        <h3 className={theme.projectTitle}>{proyecto.nombre}</h3>
        <p className={theme.projectText}>{proyecto.descripcion}</p>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className={theme.projectTag}>
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
            className={theme.projectLink}
          >
            Ver proyecto <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  );
}

function SidebarProjectCard({
  proyecto,
  index,
  theme,
}: {
  proyecto: Proyecto;
  index: number;
  theme: Theme;
}) {
  const tags = (proyecto.tecnologias ?? []).slice(0, 2).map((t) => t.nombre);

  return (
    <article className={theme.card}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
          {String(index).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900">
            {proyecto.nombre}
          </h3>
          <p className="mt-1 text-sm text-slate-600 line-clamp-3">
            {proyecto.descripcion}
          </p>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
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
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ver proyecto <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function EditorialProjectRow({
  proyecto,
  index,
  theme,
}: {
  proyecto: Proyecto;
  index: number;
  theme: Theme;
}) {
  const tags = (proyecto.tecnologias ?? []).slice(0, 3).map((t) => t.nombre);

  return (
    <article className={`${theme.card} overflow-hidden`}>
      <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="text-sm font-semibold text-blue-600">
          {String(index).padStart(2, "0")}
        </div>

        <div className="flex items-center gap-4">
          <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
            {proyecto.imagen_url ? (
              <img
                src={proyecto.imagen_url}
                alt={proyecto.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                Preview
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {proyecto.nombre}
            </h3>
            <p className={`mt-1 text-sm leading-6 ${theme.body}`}>
              {proyecto.descripcion}
            </p>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
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
          </div>
        </div>

        {proyecto.url_proyecto ? (
          <a
            href={proyecto.url_proyecto}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ver <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        ) : (
          <div className="text-sm text-slate-500">—</div>
        )}
      </div>
    </article>
  );
}

function experienceCards(experiencias: ExperienciaLaboral[], theme: Theme) {
  return experiencias.slice(0, 2).map((exp) => (
    <article key={exp.id_experiencia} className={theme.card}>
      <p className={`text-sm ${theme.accent}`}>
        {formatPeriod(exp.fecha_ini, exp.fecha_fin)}
      </p>
      <h3 className="mt-2 text-xl font-bold text-slate-900">{exp.cargo}</h3>
      <p className="text-slate-600">{exp.empresa}</p>
      <p className={`mt-3 text-sm leading-6 ${theme.body}`}>{exp.descripcion}</p>
    </article>
  ));
}

function experienceTimeline(experiencias: ExperienciaLaboral[], theme: Theme) {
  if (experiencias.length === 0) {
    return (
      <div className={theme.emptyCard}>
        <p className="font-semibold text-slate-900">
          Sin experiencia laboral registrada
        </p>
        <p className={`mt-2 leading-6 ${theme.body}`}>
          Cuando agregues experiencia desde el panel de gestión, aparecerá aquí.
        </p>
      </div>
    );
  }

  return experiencias.slice(0, 2).map((exp) => (
    <article
      key={exp.id_experiencia}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
        <div>
          <p className={`text-sm ${theme.accent}`}>
            {formatPeriod(exp.fecha_ini, exp.fecha_fin)}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{exp.cargo}</h3>
          <p className="text-slate-600">{exp.empresa}</p>
          <p className={`mt-2 text-sm leading-6 ${theme.body}`}>
            {exp.descripcion}
          </p>
        </div>
      </div>
    </article>
  ));
}

function SkillBars({
  habilidades,
  theme,
}: {
  habilidades: Habilidad[];
  theme: Theme;
}) {
  if (habilidades.length === 0) {
    return (
      <div className={theme.emptyCard}>
        <p className="font-semibold text-slate-900">
          Sin habilidades registradas
        </p>
        <p className={`mt-2 leading-6 ${theme.body}`}>
          Aquí se mostrarán tus habilidades con barras de nivel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habilidades.slice(0, 4).map((habilidad) => (
        <div key={habilidad.id_habilidad}>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-slate-900">{habilidad.nombre}</span>
            <span className={`text-sm ${theme.sub}`}>{habilidad.nivel}%</span>
          </div>
          <div className={theme.barBg}>
            <div
              className="h-3 rounded-full bg-blue-500"
              style={{ width: `${Math.max(0, Math.min(100, habilidad.nivel))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function skillsEditorial(habilidades: Habilidad[], theme: Theme) {
  if (habilidades.length === 0) {
    return (
      <div className={theme.emptyCard}>
        <p className="font-semibold text-slate-900">
          Sin habilidades registradas
        </p>
        <p className={`mt-2 leading-6 ${theme.body}`}>
          Aquí se mostrarán tus habilidades con barras de nivel.
        </p>
      </div>
    );
  }

  return habilidades.slice(0, 5).map((habilidad) => (
    <div key={habilidad.id_habilidad}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-slate-900">{habilidad.nombre}</span>
        <span className={`text-sm ${theme.sub}`}>{habilidad.nivel}%</span>
      </div>
      <div className={theme.barBg}>
        <div
          className="h-3 rounded-full bg-blue-500"
          style={{ width: `${Math.max(0, Math.min(100, habilidad.nivel))}%` }}
        />
      </div>
    </div>
  ));
}

function ChipCloud({ items }: { items: string[]; theme: Theme }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function EmptyCard({ theme, title }: { theme: Theme; title: string }) {
  return (
    <div className={theme.emptyCard}>
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
        <SquareDashedBottom className="mr-2 h-4 w-4" />
        Vista vacía
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${theme.body}`}>
        Cuando existan datos reales, se mostrarán aquí con una composición más profesional.
      </p>
    </div>
  );
}

function FooterCTA({
  theme,
  title,
  subtitle,
  secondaryLabel,
  onDescargarPDF,
  generandoPDF,
}: {
  theme: Theme;
  title: string;
  subtitle: string;
  secondaryLabel: string;
  onDescargarPDF?: () => void;
  generandoPDF?: boolean;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            {subtitle}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{title}</h3>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onDescargarPDF}
            disabled={generandoPDF}
            className={theme.buttonGhost}
          >
            {generandoPDF ? "Generando PDF..." : secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function topSkillNames(habilidades: Habilidad[], max: number) {
  return habilidades
    .slice()
    .sort((a, b) => b.nivel - a.nivel)
    .slice(0, max)
    .map((h) => h.nombre);
}

function formatPeriod(fechaIni: string, fechaFin?: string | null) {
  return `${fechaIni} — ${fechaFin || "Actual"}`;
}

export default Portafolio;
