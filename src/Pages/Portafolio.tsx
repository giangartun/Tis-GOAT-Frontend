import { useEffect, useState } from "react";
import { Briefcase, GraduationCap, FolderOpen, Code2, ExternalLink } from 'lucide-react';

interface Habilidad {
  id_habilidad: string;
  nombre: string;
  categoria: string;
  nivel: number;
}

interface Proyecto {
  id_proyecto: string;
  nombre: string;
  descripcion: string;
  url_proyecto?: string;
  imagen_url?: string;
  tecnologias?: { id_tecnologia: string; nombre: string }[];
}

interface ExperienciaLaboral {
  id_experiencia: string;
  empresa: string;
  cargo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin?: string;
}

interface ExperienciaAcademica {
  id_experiencia_academica: string;
  institucion: string;
  titulo: string;
  descripcion: string;
  fecha_ini: string;
  fecha_fin?: string;
}

interface RedProfesional {
  id_redes_prof: string;
  nombre_red: string;
  url_red: string;
}

interface PortafolioData {
  usuario: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    biografia?: string;
    foto?: string;
  };
  habilidades: Habilidad[];
  proyectos: Proyecto[];
  experiencias_laborales: ExperienciaLaboral[];
  experiencias_academicas: ExperienciaAcademica[];
  redes_profesionales: RedProfesional[];
}

export default function Portafolio() {
  const [data, setData] = useState<PortafolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortafolio = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/portafolio/completo', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) throw new Error('Error al cargar el portafolio');

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortafolio();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071a2f] flex items-center justify-center text-white">
        Cargando portafolio...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#071a2f] flex items-center justify-center text-white">
        No se pudo cargar el portafolio.
      </div>
    );
  }

  const { usuario, habilidades, proyectos, experiencias_laborales, experiencias_academicas, redes_profesionales } = data;

  return (
    <div className="min-h-screen bg-[#071a2f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <header className="mb-12 rounded-3xl border border-white/10 bg-[#0b223f] p-8 shadow-2xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-4xl font-bold">
                {usuario.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-5xl font-bold tracking-tight">
                  {usuario.nombre} {usuario.apellido_paterno}
                </h1>
                <p className="mt-3 max-w-3xl text-lg text-slate-300">
                  {usuario.biografia || 'Profesional apasionado por crear soluciones innovadoras y escalables.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {redes_profesionales.length > 0 ? (
                redes_profesionales.map((red) => (
                  <a
                    key={red.id_redes_prof}
                    href={red.url_red}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-white/20 px-5 py-3 text-sm font-medium transition hover:bg-white/10"
                  >
                    {red.nombre_red}
                  </a>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  No hay redes profesionales visibles.
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Proyectos */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <FolderOpen className="h-7 w-7 text-blue-400" />
            <h2 className="text-3xl font-bold">Proyectos</h2>
          </div>

          {proyectos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {proyectos.map((proyecto) => (
                <article
                  key={proyecto.id_proyecto}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e2747] shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="h-52 bg-[#102b4d]">
                    {proyecto.imagen_url ? (
                      <img
                        src={proyecto.imagen_url}
                        alt={proyecto.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        Vista previa del proyecto
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold">{proyecto.nombre}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {proyecto.descripcion}
                    </p>

                    {proyecto.tecnologias && proyecto.tecnologias.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {proyecto.tecnologias.map((tech) => (
                          <span
                            key={tech.id_tecnologia}
                            className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300"
                          >
                            {tech.nombre}
                          </span>
                        ))}
                      </div>
                    )}

                    {proyecto.url_proyecto && (
                      <a
                        href={proyecto.url_proyecto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
                      >
                        Ver proyecto <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0e2747] p-5 shadow-sm">
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#102b4d] text-slate-400">
                  Sin proyectos aún
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  Aún no hay proyectos visibles
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Los proyectos que publiques desde el panel de gestión se mostrarán aquí con su imagen, descripción y tecnologías.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0e2747] p-5 shadow-sm">
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#102b4d] text-slate-400">
                  Portafolio dinámico
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  Secciones organizadas en tarjetas
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Cuando existan datos reales, cada proyecto quedará separado para que la vista sea más clara y profesional.
                </p>
              </div>
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Experiencia Laboral */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Briefcase className="h-7 w-7 text-blue-400" />
              <h2 className="text-3xl font-bold">Experiencia Laboral</h2>
            </div>

            <div className="space-y-5">
              {(experiencias_laborales ?? []).length > 0 ? (
                 (experiencias_laborales ?? []).map((exp) => (
                  <article
                    key={exp.id_experiencia}
                    className="rounded-2xl border border-white/10 bg-[#0e2747] p-6 shadow-sm"
                  >
                    <p className="text-sm text-blue-400">
                      {exp.fecha_ini} - {exp.fecha_fin || 'Actual'}
                    </p>
                    <h3 className="mt-2 text-xl font-bold">{exp.cargo}</h3>
                    <p className="text-slate-300">{exp.empresa}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {exp.descripcion}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#0e2747] p-5 shadow-sm">
                  <p className="font-semibold text-white">Sin experiencia laboral registrada</p>
                  <p className="mt-2 leading-6 text-slate-300">
                    Cuando agregues experiencia desde el panel de gestión, aparecerá aquí organizada en tarjetas.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Habilidades */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Code2 className="h-7 w-7 text-blue-400" />
              <h2 className="text-3xl font-bold">Habilidades</h2>
            </div>

            <div className="space-y-4">
              {habilidades.length > 0 ? (
                habilidades.map((habilidad) => (
                  <div
                    key={habilidad.id_habilidad}
                    className="rounded-2xl border border-white/10 bg-[#0e2747] p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium">{habilidad.nombre}</span>
                      <span className="text-sm text-slate-400">{habilidad.nivel}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-700">
                      <div
                        className="h-3 rounded-full bg-blue-500"
                        style={{ width: `${habilidad.nivel}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#0e2747] p-5 shadow-sm">
                  <p className="font-semibold text-white">Sin habilidades registradas</p>
                  <p className="mt-2 leading-6 text-slate-300">
                    Aquí se mostrarán tus habilidades con barras de nivel cuando las vayas agregando.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Formación Académica */}
        <section className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-blue-400" />
            <h2 className="text-3xl font-bold">Formación Académica</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {(experiencias_academicas ?? []).length > 0 ? (
               (experiencias_academicas ?? []).map((edu) => (
                <article
                  key={edu.id_experiencia_academica}
                  className="rounded-2xl border border-white/10 bg-[#0e2747] p-6 shadow-sm"
                >
                  <p className="text-sm text-blue-400">
                    {edu.fecha_ini} - {edu.fecha_fin || 'Actual'}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{edu.titulo}</h3>
                  <p className="text-slate-300">{edu.institucion}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {edu.descripcion}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#0e2747] p-5 shadow-sm md:col-span-2">
                <p className="font-semibold text-white">Sin experiencia académica registrada</p>
                <p className="mt-2 leading-6 text-slate-300">
                  Aquí aparecerán tus estudios y certificaciones en tarjetas limpias y ordenadas.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
