import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, GraduationCap } from "lucide-react";

interface Usuario {
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
  nivel?: number;
  categoria?: string | null;
  visible?: boolean | number | string;
}

interface PortafolioResponse {
  usuario?: Usuario;
  habilidades?: Habilidad[];
  experiencias_laborales?: any[];
  experienciasLaborales?: any[];
  proyectos?: any[];
}

const API_BASE = "http://127.0.0.1:8000";

const getFullName = (usuario: Usuario) =>
  [usuario.nombre, usuario.apellido_paterno, usuario.apellido_materno]
    .filter(Boolean)
    .join(" ") || "Usuario";

const isVisible = (value?: boolean | number | string) => {
  if (value === undefined || value === null) return true;
  return value === true || value === 1 || value === "1" || value === "true";
};

function PerfilPublico() {
  const { t } = useTranslation();
  const { id } = useParams();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargando(true);
        setError("");

        const response = await fetch(`${API_BASE}/api/portafolios/${id}`, {
          headers: {
            Accept: "application/json",
          },
        });

        const data: PortafolioResponse = await response.json();

        if (!response.ok) {
          throw new Error(t("profileUser.errors.load_public_profile"));
        }

        setUsuario(data.usuario || null);
        setHabilidades(Array.isArray(data.habilidades) ? data.habilidades : []);
        setExperiencias(
          Array.isArray(data.experiencias_laborales)
            ? data.experiencias_laborales
            : Array.isArray(data.experienciasLaborales)
            ? data.experienciasLaborales
            : []
        );
        setProyectos(Array.isArray(data.proyectos) ? data.proyectos : []);
      } catch (err: any) {
        setError(err.message || t("profileUser.errors.load_profile"));
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [id, t]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <p className="text-gray-500 font-medium">
          {t("profileUser.loading")}
        </p>
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <p className="text-red-500 font-bold">
          {error || t("profileUser.errors.profile_not_found")}
        </p>
      </div>
    );
  }

  const habilidadesTecnicas = habilidades.filter(
    (h) => isVisible(h.visible) && h.tipo !== "blanda"
  );

  const habilidadesBlandas = habilidades.filter(
    (h) => isVisible(h.visible) && h.tipo === "blanda"
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-inter">
      <main className="flex-1 overflow-y-auto pt-6 md:pt-12 pb-20 px-4 md:px-0">
        <div className="max-w-[1240px] mx-auto flex flex-col shadow-2xl rounded-[16px] overflow-hidden">
          <div className="bg-[#1F4E79] text-white p-6 md:p-12 relative overflow-hidden shrink-0">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start relative z-10 gap-6 md:gap-0">
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-10">
                <div className="w-32 h-32 rounded-full mx-auto md:mx-0 border-2 border-white/20 shadow-inner shrink-0 overflow-hidden">
                  {usuario.foto ? (
                    <img
                      src={usuario.foto}
                      alt={getFullName(usuario)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-4xl font-bold">
                      {usuario.nombre?.charAt(0) || "?"}
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <h2 className="text-[32px] md:text-[42px] font-bold mb-1 tracking-tight">
                    {getFullName(usuario)}
                  </h2>

                  <p className="text-blue-200 text-[18px] md:text-[20px] font-medium opacity-90 mb-6 italic">
                    {usuario.profesion || t("profileUser.defaults.professional")}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-x-6 md:gap-x-12 gap-y-4 text-[13px] font-medium">
                    {usuario.email && (
                      <span className="flex items-center gap-2.5 opacity-80">
                        <Mail size={16} />
                        <span className="break-all">{usuario.email}</span>
                      </span>
                    )}

                    {(usuario.ciudad || usuario.pais) && (
                      <span className="flex items-center gap-2.5 opacity-80">
                        <MapPin size={16} />
                        {usuario.ciudad || ""}
                        {usuario.ciudad && usuario.pais ? ", " : ""}
                        {usuario.pais || ""}
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
            </div>
          </div>

          <div className="bg-white p-6 md:p-16 flex flex-col gap-12 md:gap-16 border-t border-white/10">
            <section>
              <h3 className="text-[22px] font-extrabold text-gray-800 mb-4">
                {t("profileUser.sections.about_me")}
              </h3>

              <p className="text-gray-500 text-[18px] leading-relaxed max-w-5xl font-medium">
                {usuario.biografia || t("profileUser.defaults.no_biography")}
              </p>
            </section>

            <section>
              <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight mb-8">
                {t("profileUser.sections.experience")}
              </h3>

              {experiencias.length > 0 ? (
                <div className="flex flex-wrap gap-8">
                  {experiencias.map((exp, index) => (
                    <div
                      key={index}
                      className="w-full sm:w-[340px] rounded-[14px] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-extrabold text-gray-800 text-[17px]">
                        {exp.cargo ||
                          exp.titulo ||
                          t("profileUser.defaults.unspecified_position")}
                      </h4>

                      <p className="text-[13px] font-bold text-gray-400 mt-1">
                        {exp.fecha_ini || ""}{" "}
                        {exp.fecha_fin ? `- ${exp.fecha_fin}` : ""}
                      </p>

                      <p className="mt-4 text-[14px] text-gray-500 leading-snug font-medium">
                        {exp.descripcion || t("profileUser.defaults.no_description")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-medium">
                  {t("profileUser.empty.no_experience")}
                </p>
              )}
            </section>

            <section>
              <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight mb-10">
                {t("profileUser.sections.skills")}
              </h3>

              {habilidadesTecnicas.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                  {habilidadesTecnicas.map((habilidad) => (
                    <div
                      key={habilidad.id_habilidad || habilidad.nombre}
                      className="rounded-[18px] border border-gray-100 p-8"
                    >
                      <div className="flex justify-between text-[13px] font-bold text-gray-600 mb-1.5">
                        <span>{habilidad.nombre}</span>
                        <span className="opacity-60">
                          {habilidad.nivel || 0}%
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-blue-50/50 rounded-full overflow-hidden border border-gray-100">
                        <div
                          className="h-full bg-orange-200 rounded-full shadow-inner"
                          style={{ width: `${habilidad.nivel || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-medium">
                  {t("profileUser.empty.no_technical_skills")}
                </p>
              )}
            </section>

            <section>
              <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight mb-8">
                {t("profileUser.sections.soft_skills")}
              </h3>

              <div className="flex flex-wrap gap-4">
                {habilidadesBlandas.length > 0 ? (
                  habilidadesBlandas.map((habilidad) => (
                    <span
                      key={habilidad.id_habilidad || habilidad.nombre}
                      className="px-7 py-3 bg-[#F8FAFC] text-[#1F4E79] rounded-[14px] text-[14px] font-extrabold border border-gray-100 shadow-sm"
                    >
                      {habilidad.nombre}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 font-medium">
                    {t("profileUser.empty.no_soft_skills")}
                  </p>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-[22px] font-extrabold text-gray-800 uppercase tracking-tight mb-10">
                {t("profileUser.sections.projects")}
              </h3>

              {proyectos.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {proyectos.map((proyecto, index) => (
                    <article
                      key={proyecto.id_proyecto || index}
                      className="rounded-[24px] overflow-hidden border border-gray-100 bg-gray-50/30 shadow-sm flex flex-col group hover:shadow-md transition-shadow"
                    >
                      <div className="h-64 bg-gray-200 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/5" />
                      </div>

                      <div className="p-8 pb-12 flex flex-col flex-1 bg-white">
                        <h4 className="text-[22px] font-extrabold text-gray-800 mb-2">
                          {proyecto.nombre ||
                            proyecto.nombre_proyecto ||
                            t("profileUser.defaults.project")}
                        </h4>

                        <p className="text-gray-400 text-[15px] mb-8 font-semibold">
                          {proyecto.descripcion ||
                            t("profileUser.defaults.no_description")}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-medium">
                  {t("profileUser.empty.no_projects")}
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PerfilPublico;