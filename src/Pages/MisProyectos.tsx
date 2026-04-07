import { useState } from "react";
import { Plus, Search } from "lucide-react";
import NuevoProyectoModal from "../Components/NuevoProyectoModal";

type Proyecto = {
  nombre: string;
  descripcion: string;
  github: string;
  demo: string;
  fechaInicio: string;
  fechaFin: string;
  tecnologias: string;
  imagen: string;
};

function MisProyectos() {
  const [isOpen, setIsOpen] = useState(false);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  const handleSave = (nuevoProyecto: Proyecto) => {
    setProyectos((prev) => [...prev, nuevoProyecto]);
    setIsOpen(false);
  };

  return (
    <>
      <section className="bg-app-bg px-6 py-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-app-text">Mis proyectos</h2>
              <p className="mt-2 text-base text-app-muted">
               Gestiona tus proyectos como mas desees, registra el primero
              </p>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 rounded-full bg-app-topbar px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Nuevo Proyecto
            </button>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex w-full max-w-3xl items-center gap-3 rounded-full border border-app-border bg-white px-5 py-3 shadow-sm">
              <input
                type="text"
                placeholder="Buscar ..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-app-muted"
              />
              <Search size={22} className="text-app-text" />
            </div>
          </div>

        {proyectos.length === 0 ? (
          <div className="mt-28 flex flex-col items-center text-center">
            <p className="max-w-2xl text-lg text-app-text">
              Empieza registrando tus proyectos de software para guardarlo en tu portafolio
            </p>

            <button
              onClick={() => setIsOpen(true)}
              className="mt-8 flex items-center gap-2 rounded-full bg-app-topbar px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Nuevo Proyecto
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
              {proyectos.map((p, index) => (
                <article
                  key={index}
                  className="rounded-2xl border-2 border-[#1f7fd1] bg-app-surface p-5"
                >
                  <div className="flex gap-5">
                    <div className="flex h-36 w-36 items-center justify-center rounded-xl border border-dashed border-app-border bg-app-card text-center text-sm text-app-muted">
                      Captura o portada del proyecto
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-app-text">{p.nombre}</h3>
                      <p className="mt-1 text-sm text-app-muted">{p.descripcion}</p>

                      <div className="mt-3 space-y-1 text-sm">
                        <a href={p.github} className="block text-blue-600 hover:underline">
                          Link GitHub
                        </a>
                        <a href={p.demo} className="block text-blue-600 hover:underline">
                          Link Demo
                        </a>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-8 text-xs text-app-muted">
                        <span>Fecha de inicio: {p.fechaInicio}</span>
                        <span>Fecha de fin: {p.fechaFin}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {p.tecnologias.split(",").map((tec) => (
                          <span
                            key={tec.trim()}
                            className="rounded bg-app-card px-3 py-1 text-xs text-app-text"
                          >
                            {tec.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="self-end rounded-full bg-app-topbar px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                      Editar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <NuevoProyectoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}

export default MisProyectos;