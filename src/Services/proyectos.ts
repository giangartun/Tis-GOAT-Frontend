import { api } from "./api";

export async function listarProyectos(idPortafolio: number) {
  const response = await api.get(`/proyecto/gestion-proyectos/${idPortafolio}`);
  return response.data;
}

export async function crearProyecto(payload: any) {
  const response = await api.post("/proyecto/gestion-proyectos", payload);
  return response.data;
}