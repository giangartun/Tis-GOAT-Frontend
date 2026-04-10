import { api } from "./api";

export type ProyectoApiPayload = {
  id_portafolio: number;
  nombre: string;
  descripcion: string | null;
  url_proyecto: string | null;
  imagen_url: string | null;
  fecha_ini: string;
  fecha_fin: string | null;
  tecnologias: number[];
};

export async function listarProyectos(idPortafolio: number) {
  const response = await api.get(`/proyecto/gestion-proyectos/${idPortafolio}`);
  return response.data;
}

export async function crearProyecto(payload: ProyectoApiPayload) {
  const response = await api.post("/proyecto/gestion-proyectos", payload);
  return response.data;
}