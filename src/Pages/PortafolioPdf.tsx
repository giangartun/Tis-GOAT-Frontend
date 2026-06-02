/**
 * PortafolioPDF.tsx
 *
 * Genera el PDF del portafolio en formato CARTA (216mm × 279mm).
 * Abre una ventana HTML y usa window.print() para guardar como PDF.
 * NO requiere librerías externas.
 */

import i18n from "../locales/i18n";

interface Habilidad {
  id_habilidad: string;
  nombre: string;
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

export interface PortafolioData {
  usuario: {
    id_usuario: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    email: string;
    biografia?: string | null;
    foto?: string | null;
  };
  portafolio: {
    id_portafolio: string;
    enlace_pagi_web?: string | null;
    plantilla?: { nombre?: string | null } | null;
  } | null;
  redes_profesionales: RedProfesional[];
  habilidades: Habilidad[];
  experiencias_laborales: ExperienciaLaboral[];
  experiencias_academicas: ExperienciaAcademica[];
  proyectos: Proyecto[];
}

const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, options);

function formatPeriod(fechaIni: string, fechaFin?: string | null): string {
  return `${fechaIni} — ${fechaFin ?? t("portfolioPdf.current")}`;
}

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getInicial(nombre: string): string {
  return nombre?.trim()?.charAt(0)?.toUpperCase() ?? "P";
}

function obtenerLocaleActual() {
  if (i18n.language?.startsWith("en")) return "en-US";
  if (i18n.language?.startsWith("fr")) return "fr-FR";
  return "es-BO";
}

function htmlSkillBars(habilidades: Habilidad[]): string {
  if (!habilidades.length) {
    return `<p class="empty-text">${t("portfolioPdf.empty.no_skills")}</p>`;
  }

  return habilidades
    .slice(0, 6)
    .map((h) => {
      const pct = Math.max(0, Math.min(100, h.nivel));
      return `
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">${esc(h.nombre)}</span>
            <span class="skill-pct">${Math.round(pct)}%</span>
          </div>
          <div class="skill-bar-bg">
            <div class="skill-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>`;
    })
    .join("");
}

function htmlTags(habilidades: Habilidad[]): string {
  return habilidades
    .slice(0, 5)
    .map((h) => `<span class="tag">${esc(h.nombre)}</span>`)
    .join("");
}

function htmlContactRow(data: PortafolioData): string {
  const items: string[] = [];

  if (data.usuario.email) {
    items.push(`<span class="contact-item">✉ ${esc(data.usuario.email)}</span>`);
  }

  (data.redes_profesionales ?? [])
    .filter((r) => r.visible !== false)
    .slice(0, 2)
    .forEach((r) =>
      items.push(`<span class="contact-item">${esc(r.nombre_red)}</span>`)
    );

  return items.join("");
}

function htmlInfoSidebar(data: PortafolioData): string {
  const rows: string[] = [];

  if (data.usuario.email) {
    rows.push(`
      <div class="info-row">
        <div class="info-label">${t("portfolioPdf.labels.email")}</div>
        <div class="info-value">${esc(data.usuario.email)}</div>
      </div>`);
  }

  (data.redes_profesionales ?? [])
    .filter((r) => r.visible !== false)
    .forEach((r) =>
      rows.push(`
        <div class="info-row">
          <div class="info-label">${esc(r.nombre_red)}</div>
          <div class="info-value">${esc(r.url_red)}</div>
        </div>`)
    );

  if (data.portafolio?.enlace_pagi_web) {
    rows.push(`
      <div class="info-row">
        <div class="info-label">${t("portfolioPdf.labels.web_portfolio")}</div>
        <div class="info-value">${esc(data.portafolio.enlace_pagi_web)}</div>
      </div>`);
  }

  return rows.join("");
}

function htmlExpLaboral(exps: ExperienciaLaboral[]): string {
  if (!exps.length) {
    return `<p class="empty-text">${t("portfolioPdf.empty.no_work_experience")}</p>`;
  }

  return exps
    .map(
      (e) => `
      <div class="exp-item">
        <div class="exp-dot blue-dot"></div>
        <div class="exp-content blue-border">
          <div class="exp-date">${esc(formatPeriod(e.fecha_ini, e.fecha_fin))}</div>
          <div class="exp-title">${esc(e.cargo)}</div>
          <div class="exp-sub blue-sub">${esc(e.empresa)}</div>
          <div class="exp-desc">${esc(e.descripcion)}</div>
        </div>
      </div>`
    )
    .join("");
}

function htmlExpAcademica(exps: ExperienciaAcademica[]): string {
  if (!exps.length) {
    return `<p class="empty-text">${t("portfolioPdf.empty.no_academic_experience")}</p>`;
  }

  return exps
    .map(
      (e) => `
      <div class="exp-item">
        <div class="exp-dot green-dot"></div>
        <div class="exp-content green-border">
          <div class="exp-date">${esc(formatPeriod(e.fecha_ini, e.fecha_fin))}</div>
          <div class="exp-title">${esc(e.titulo)}</div>
          <div class="exp-sub green-sub">${esc(e.institucion)}</div>
          <div class="exp-desc">${esc(e.descripcion)}</div>
        </div>
      </div>`
    )
    .join("");
}

function htmlProjectCard(p: Proyecto, index: number): string {
  const badge = p.tecnologias?.[0]?.nombre ?? "";

  const tech = (p.tecnologias ?? [])
    .slice(0, 3)
    .map((tec) => tec.nombre)
    .join(" · ");

  const tags = (p.tecnologias ?? [])
    .slice(0, 3)
    .map((tec) => `<span class="proj-tag">${esc(tec.nombre)}</span>`)
    .join("");

  const desc =
    p.descripcion.length > 130
      ? p.descripcion.slice(0, 130) + "…"
      : p.descripcion;

  return `
    <div class="proj-card">
      <div class="proj-thumb">
        <span class="proj-num">${String(index).padStart(2, "0")}</span>
        ${badge ? `<span class="proj-badge">${esc(badge)}</span>` : ""}
      </div>
      <div class="proj-body">
        <div class="proj-name">${esc(p.nombre)}</div>
        ${tech ? `<div class="proj-tech">${esc(tech)}</div>` : ""}
        <div class="proj-desc">${esc(desc)}</div>
        ${tags ? `<div class="proj-tags">${tags}</div>` : ""}
        ${p.url_proyecto ? `<div class="proj-link">${esc(p.url_proyecto)}</div>` : ""}
      </div>
    </div>`;
}

function htmlProjectPage(
  proyectos: Proyecto[],
  startIdx: number,
  nombre: string,
  isFirst: boolean,
  fecha: string,
  email: string,
  pageNum: number
): string {
  return `
    <div class="page">
      <div class="p2-header">
        <span class="p2-header-title">
          ${
            isFirst
              ? t("portfolioPdf.sections.featured_projects")
              : t("portfolioPdf.sections.projects_continuation")
          }
        </span>
        <span class="p2-header-name">${esc(nombre)}</span>
      </div>
      <div class="p2-body">
        <div class="section-label">${t("portfolioPdf.sections.projects")}</div>
        <div class="proj-grid">
          ${proyectos.map((p, i) => htmlProjectCard(p, startIdx + i + 1)).join("")}
        </div>
      </div>
      <div class="pdf-footer">
        <span>${t("portfolioPdf.footer.generated_from")} · ${fecha}</span>
        <span class="footer-email">${esc(email)}</span>
      </div>
      <span class="page-num">${pageNum}</span>
    </div>`;
}

const CSS = `
* { margin:0; padding:0; box-sizing:border-box; }

@page {
  size: letter portrait;
  margin: 0;
}

html, body {
  width: 100%;
  min-height: 100%;
}

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #fff;
  color: #1a2030;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Página carta ── */
.page {
  width: 216mm;
  min-height: 279mm;
  position: relative;
  background: #fff;
  page-break-after: always;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.page:last-child { page-break-after: auto; }

/* Hero */
.hero {
  background:#0f1e38;
  padding:22px 28px;
  display:flex;
  gap:18px;
  align-items:flex-start;
  flex-shrink:0;
}
.avatar-circle {
  width:64px;
  height:64px;
  min-width:64px;
  border-radius:50%;
  background:#2a4a7f;
  border:2px solid #2e5a9e;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:24px;
  font-weight:bold;
  color:#a8c4f0;
}
.hero-content { flex:1; min-width:0; }
.hero-role {
  font-size:8px;
  color:#5b9bd5;
  letter-spacing:2px;
  text-transform:uppercase;
  margin-bottom:4px;
}
.hero-name {
  font-size:22px;
  font-weight:bold;
  color:#fff;
  margin-bottom:6px;
  line-height:1.2;
}
.hero-bio {
  font-size:9px;
  color:#8fa5c2;
  line-height:1.6;
  margin-bottom:10px;
  max-width:360px;
  word-break: break-word;
}
.tag-row { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px; }
.tag {
  background:#1e3458;
  border:1px solid #2a4a7f;
  border-radius:4px;
  padding:3px 8px;
  font-size:8px;
  font-weight:bold;
  color:#7aaee8;
}
.contact-row { display:flex; gap:14px; flex-wrap:wrap; }
.contact-item { font-size:9px; color:#7a92b0; word-break: break-word; }

/* Body 2col */
.body-2col { display:flex; flex:1; min-height:0; }
.sidebar {
  width:170px;
  min-width:170px;
  background:#f7f8fa;
  border-right:1px solid #e4eaf3;
  padding:18px 16px;
}
.main-col { flex:1; padding:18px 22px; min-width:0; }

.section-title {
  font-size:7.5px;
  font-weight:bold;
  color:#3a7bd5;
  letter-spacing:1.5px;
  text-transform:uppercase;
  border-bottom:1.5px solid #3a7bd5;
  padding-bottom:4px;
  margin-bottom:12px;
}

/* Skills */
.skill-item { margin-bottom:9px; }
.skill-header { display:flex; justify-content:space-between; margin-bottom:3px; gap:8px; }
.skill-name {
  font-size:9px;
  font-weight:bold;
  color:#1a2030;
  word-break: break-word;
}
.skill-pct { font-size:8px; color:#8a9ab0; white-space:nowrap; }
.skill-bar-bg {
  height:4px;
  background:#dde3ec;
  border-radius:2px;
  overflow:hidden;
}
.skill-bar-fill { height:4px; background:#3a7bd5; border-radius:2px; }

/* Info sidebar */
.sidebar-section { margin-bottom:18px; }
.info-row { margin-bottom:7px; }
.info-label { font-size:7.5px; color:#8a9ab0; margin-bottom:1px; }
.info-value {
  font-size:9px;
  color:#4a5568;
  word-break:break-all;
}
.empty-text {
  font-size:9px;
  color:#8a9ab0;
  line-height:1.5;
}

/* Experiencia */
.exp-section { margin-bottom:20px; }
.exp-item {
  display:flex;
  gap:0;
  margin-bottom:14px;
  align-items:flex-start;
}
.exp-dot {
  width:10px;
  min-width:10px;
  height:10px;
  border-radius:50%;
  margin-top:3px;
}
.blue-dot { background:#3a7bd5; box-shadow:0 0 0 1.5px #3a7bd5; }
.green-dot { background:#1d7a5f; box-shadow:0 0 0 1.5px #1d7a5f; }
.exp-content {
  flex:1;
  border-left:2px solid #dde3ec;
  padding-left:10px;
  margin-left:-5px;
  min-width:0;
}
.green-border { border-left-color:#b8ddd4; }
.exp-date { font-size:8px; color:#8a9ab0; margin-bottom:2px; }
.exp-title {
  font-size:10.5px;
  font-weight:bold;
  color:#1a2030;
  margin-bottom:2px;
  word-break: break-word;
}
.exp-sub { font-size:9px; margin-bottom:4px; word-break: break-word; }
.blue-sub { color:#3a7bd5; }
.green-sub { color:#1d7a5f; }
.exp-desc {
  font-size:8.5px;
  color:#4a5568;
  line-height:1.5;
  word-break: break-word;
}

.page-num {
  position:absolute;
  bottom:8px;
  right:18px;
  font-size:8px;
  color:#9aa5b4;
}

/* Página 2 */
.p2-header {
  background:#0f1e38;
  padding:12px 28px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-shrink:0;
}
.p2-header-title {
  font-size:12px;
  font-weight:bold;
  color:#fff;
}
.p2-header-name {
  font-size:9px;
  color:#5b9bd5;
  word-break: break-word;
}
.p2-body {
  padding:20px 28px;
  flex:1;
  min-width:0;
}
.section-label {
  font-size:7.5px;
  font-weight:bold;
  color:#3a7bd5;
  letter-spacing:1.5px;
  text-transform:uppercase;
  border-bottom:1.5px solid #3a7bd5;
  padding-bottom:4px;
  margin-bottom:16px;
}

/* Proyectos */
.proj-grid {
  display:flex;
  flex-wrap:wrap;
  gap:14px;
}
.proj-card {
  width:calc(50% - 7px);
  border:1px solid #e4eaf3;
  border-radius:8px;
  overflow:hidden;
  break-inside:avoid;
  background:#fff;
}
.proj-thumb {
  height:52px;
  background:#0f1e38;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 10px;
  gap:8px;
}
.proj-num {
  font-size:8px;
  color:#2a5a9e;
  font-weight:bold;
}
.proj-badge {
  background:#3a7bd5;
  border-radius:3px;
  padding:2px 7px;
  font-size:7.5px;
  font-weight:bold;
  color:#fff;
  white-space:nowrap;
}
.proj-body { padding:10px 12px 12px; min-width:0; }
.proj-name {
  font-size:10.5px;
  font-weight:bold;
  color:#1a2030;
  margin-bottom:3px;
  word-break: break-word;
}
.proj-tech {
  font-size:8.5px;
  color:#3a7bd5;
  margin-bottom:5px;
  word-break: break-word;
}
.proj-desc {
  font-size:8.5px;
  color:#4a5568;
  line-height:1.5;
  margin-bottom:7px;
  word-break: break-word;
}
.proj-tags {
  display:flex;
  flex-wrap:wrap;
  gap:4px;
  margin-bottom:5px;
}
.proj-tag {
  background:#edf2fc;
  border:1px solid #c8d9f5;
  border-radius:3px;
  padding:2px 6px;
  font-size:7.5px;
  color:#3a7bd5;
}
.proj-link {
  font-size:8px;
  color:#3a7bd5;
  word-break:break-all;
  margin-top:4px;
}

/* Footer */
.pdf-footer {
  border-top:1px solid #e4eaf3;
  padding:8px 28px;
  display:flex;
  justify-content:space-between;
  gap:10px;
  font-size:8px;
  color:#9aa5b4;
  flex-shrink:0;
}
.footer-email { color:#3a7bd5; word-break: break-all; }

/* Print */
@media print {
  body { margin:0; background:#fff; }
  .page { width:216mm; min-height:279mm; page-break-after:always; box-shadow:none !important; border-radius:0 !important; }
  .page:last-child { page-break-after:auto; }
  .no-print { display:none !important; }
}

/* Pantalla */
@media screen {
  body {
    background:#5a6475;
    padding:24px;
  }

  .action-bar {
    position:fixed;
    top:0;
    left:0;
    right:0;
    min-height:52px;
    background:#3d4555;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding:10px 24px;
    z-index:100;
    box-shadow:0 2px 8px rgba(0,0,0,.3);
    flex-wrap:wrap;
  }

  .action-bar-left {
    font-size:13px;
    color:#c8cdd8;
    min-width:0;
  }

  .action-bar-right {
    display:flex;
    gap:10px;
    flex-wrap:wrap;
  }

  .btn-print {
    padding:7px 18px;
    background:#3a7bd5;
    color:#fff;
    border:none;
    border-radius:6px;
    font-size:13px;
    cursor:pointer;
    font-weight:500;
  }

  .btn-print:hover { background:#2f6bc4; }

  .btn-close {
    padding:7px 14px;
    background:#4d5666;
    color:#c8cdd8;
    border:1px solid #6a7385;
    border-radius:6px;
    font-size:13px;
    cursor:pointer;
  }

  .btn-close:hover { background:#3d4555; }

  .pages-wrapper {
    margin-top:78px;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:24px;
    padding-bottom:32px;
  }

  .page {
    box-shadow:0 4px 24px rgba(0,0,0,.4);
    border-radius:4px;
  }
}

/* Responsive preview */
@media screen and (max-width: 900px) {
  body {
    padding:12px;
  }

  .page {
    width: 100%;
    max-width: 216mm;
  }

  .hero {
    padding:18px 18px 16px;
  }

  .hero-name {
    font-size:20px;
  }

  .hero-bio {
    max-width: none;
  }

  .body-2col {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-width: 0;
    border-right:none;
    border-bottom:1px solid #e4eaf3;
  }

  .main-col {
    padding:16px 18px;
  }

  .proj-card {
    width:100%;
  }

  .p2-header,
  .p2-body,
  .pdf-footer {
    padding-left:18px;
    padding-right:18px;
  }

  .proj-grid {
    gap:12px;
  }
}

@media screen and (max-width: 640px) {
  .action-bar {
    padding:10px 12px;
    justify-content:center;
  }

  .action-bar-left {
    width:100%;
    text-align:center;
    font-size:12px;
  }

  .action-bar-right {
    width:100%;
    justify-content:center;
  }

  .btn-print,
  .btn-close {
    flex:1 1 140px;
    text-align:center;
  }

  .hero {
    flex-direction:column;
    align-items:flex-start;
    gap:12px;
  }

  .avatar-circle {
    width:52px;
    height:52px;
    min-width:52px;
    font-size:20px;
  }

  .hero-role {
    font-size:7px;
    letter-spacing:1.5px;
  }

  .hero-name {
    font-size:18px;
  }

  .hero-bio {
    font-size:8.5px;
    line-height:1.5;
  }

  .contact-row {
    gap:8px;
  }

  .contact-item {
    font-size:8px;
  }

  .sidebar {
    padding:14px 12px;
  }

  .main-col {
    padding:14px 12px;
  }

  .section-title,
  .section-label {
    font-size:7px;
  }

  .exp-title {
    font-size:10px;
  }

  .exp-desc,
  .proj-desc {
    font-size:8px;
  }

  .proj-thumb {
    height:46px;
  }

  .proj-body {
    padding:9px 10px 10px;
  }

  .p2-header {
    flex-direction:column;
    align-items:flex-start;
  }

  .p2-header-title {
    font-size:11px;
  }

  .p2-header-name {
    font-size:8px;
  }

  .pdf-footer {
    flex-direction:column;
    align-items:flex-start;
    gap:4px;
  }

  .page-num {
    right:12px;
  }
}
`;

function generarHTML(data: PortafolioData, nombreCompleto: string): string {
  const ini = getInicial(data.usuario.nombre);

  const fecha = new Date().toLocaleDateString(obtenerLocaleActual(), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const expLaboral = (data.experiencias_laborales ?? []).filter(
    (e) => e.visible !== false
  );
  const expAcad = (data.experiencias_academicas ?? []).filter(
    (e) => e.visible !== false
  );
  const habilidades = (data.habilidades ?? []).filter((h) => h.visible !== false);
  const proyectos = (data.proyectos ?? []).filter((p) => p.visible !== false);
  const email = data.usuario.email ?? "";

  const chunks: Proyecto[][] = [];

  for (let i = 0; i < proyectos.length; i += 4) {
    chunks.push(proyectos.slice(i, i + 4));
  }

  const projectPages = chunks
    .map((chunk, ci) =>
      htmlProjectPage(chunk, ci * 4, nombreCompleto, ci === 0, fecha, email, ci + 2)
    )
    .join("");

  const totalPages = 1 + chunks.length;
  const archivo = `portafolio_${nombreCompleto.replace(/\s+/g, "_").toLowerCase()}.pdf`;

  const paginasTexto =
    totalPages !== 1
      ? t("portfolioPdf.actions.pages")
      : t("portfolioPdf.actions.page");

  return `<!DOCTYPE html>
<html lang="${i18n.language || "es"}">
<head>
  <meta charset="UTF-8"/>
  <title>${t("portfolioPdf.title")} — ${esc(nombreCompleto)}</title>
  <style>${CSS}</style>
</head>
<body>

  <div class="action-bar no-print">
    <div class="action-bar-left">📄 ${esc(archivo)} &nbsp;·&nbsp; ${totalPages} ${paginasTexto}</div>
    <div class="action-bar-right">
      <button class="btn-close" onclick="window.close()">✕ ${t("portfolioPdf.actions.close")}</button>
      <button class="btn-print" onclick="window.print()">⬇ ${t("portfolioPdf.actions.save_pdf")}</button>
    </div>
  </div>

  <div class="pages-wrapper">

    <div class="page">
      <div class="hero">
        <div class="avatar-circle">${esc(ini)}</div>
        <div class="hero-content">
          <div class="hero-role">${t("portfolioPdf.labels.role")}</div>
          <div class="hero-name">${esc(nombreCompleto)}</div>
          ${data.usuario.biografia ? `<div class="hero-bio">${esc(data.usuario.biografia)}</div>` : ""}
          <div class="tag-row">${htmlTags(habilidades)}</div>
          <div class="contact-row">${htmlContactRow(data)}</div>
        </div>
      </div>

      <div class="body-2col">
        <div class="sidebar">
          <div class="sidebar-section">
            <div class="section-title">${t("portfolioPdf.sections.skills")}</div>
            ${htmlSkillBars(habilidades)}
          </div>
          <div class="sidebar-section">
            <div class="section-title">${t("portfolioPdf.sections.information")}</div>
            ${htmlInfoSidebar(data)}
          </div>
        </div>
        <div class="main-col">
          <div class="exp-section">
            <div class="section-title">${t("portfolioPdf.sections.work_experience")}</div>
            ${htmlExpLaboral(expLaboral)}
          </div>
          <div class="exp-section">
            <div class="section-title">${t("portfolioPdf.sections.academic_experience")}</div>
            ${htmlExpAcademica(expAcad)}
          </div>
        </div>
      </div>

      <span class="page-num">1</span>
    </div>

    ${chunks.length > 0 ? projectPages : ""}

  </div>
</body>
</html>`;
}

export function descargarPortafolioPDF(
  data: PortafolioData,
  nombreCompleto: string
): void {
  const html = generarHTML(data, nombreCompleto);
  const ventana = window.open("", "_blank", "width=960,height=820,scrollbars=yes");

  if (!ventana) {
    alert(t("portfolioPdf.errors.popup_blocked"));
    return;
  }

  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
}