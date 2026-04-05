import { useState } from "react";
import { Plus, Search } from "lucide-react";
import NuevoProyectoModal from "../Components/NuevoProyectoModal";

function MisProyectos() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="bg-app-bg px-6 py-6">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-app-text">Mis proyectos</h2>
          <p className="mt-2 text-base text-app-muted">
            Gestiona tus proyectos como mas desees, registra el primero
          </p>

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
        </div>
      </section>

      <NuevoProyectoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default MisProyectos;