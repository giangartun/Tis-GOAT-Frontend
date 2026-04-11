import { api } from "./api";

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

export async function listarProyectos(idPortafolio: string) {
  const response = await api.get(`/proyecto/gestion-proyectos/${idPortafolio}`);
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