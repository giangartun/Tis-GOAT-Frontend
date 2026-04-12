import { api } from "./api";

export type Tecnologia = {
  id_tecnologia: string;
  nombre: string;
  categoria?: string | null;
};

export type ProyectoApiPayload = {
  id_portafolio: string;
  nombre: string;
  descripcion: string | null;
  url_proyecto: string | null;
  imagen_url: string | null;
  fecha_ini: string;
  fecha_fin: string | null;
  tecnologias: string[];
};

export async function listarTecnologias(): Promise<Tecnologia[]> {
  const response = await api.get<Tecnologia[]>(
    "/proyecto/gestion-proyectos/tecnologias/lista"
  );
  return response.data;
}

export async function listarProyectos(idPortafolio: string, buscar: string = "") {
  const response = await api.get(`/proyecto/gestion-proyectos/${idPortafolio}`, {
    params: buscar ? { buscar } : {},
  });
  return response.data;
}

export async function crearProyecto(payload: ProyectoApiPayload) {
  const response = await api.post("/proyecto/gestion-proyectos", payload);
  return response.data;
}

export async function actualizarProyecto(idProyecto: string, payload: ProyectoApiPayload) {
  const response = await api.put(`/proyecto/gestion-proyectos/${idProyecto}`, payload);
  return response.data;
}

export async function eliminarProyecto(idProyecto: string) {
  const response = await api.delete(`/proyecto/gestion-proyectos/${idProyecto}`);
  return response.data;
}