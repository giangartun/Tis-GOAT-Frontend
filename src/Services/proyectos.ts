import { api } from "./api";

export type Tecnologia = {
  id_tecnologia: string;
  nombre: string;
  categoria?: string | null;
};

export type EvidenciaProyecto = {
  id_evidencia: string;
  tipo: string;
  url_evidencia: string;
  nombre_archivo: string;
  foto_url?: string | null;
  tamano_bytes?: number | null;
  fecha_subida?: string | null;
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

type ProyectosResponse = unknown;

// Tecnologías - ahora usa el mismo endpoint que el admin
export async function listarTecnologias(): Promise<Tecnologia[]> {
  const response = await api.get("/admin/tecnologias");
  return response.data.tecnologias || [];
}

export async function listarProyectos(
  idPortafolio: string,
  buscar: string = ""
): Promise<ProyectosResponse> {
  const response = await api.get(`/proyecto/gestion-proyectos/${idPortafolio}`, {
    params: buscar ? { buscar } : {},
  });
  return response.data;
}

export async function crearProyecto(payload: ProyectoApiPayload) {
  return await api.post("/proyecto/gestion-proyectos", payload);
}

export async function actualizarProyecto(
  idProyecto: string,
  payload: ProyectoApiPayload
) {
  return await api.put(`/proyecto/gestion-proyectos/${idProyecto}`, payload);
}

export async function eliminarProyecto(idProyecto: string) {
  const response = await api.delete(`/proyecto/gestion-proyectos/${idProyecto}`);
  return response.data;
}

export async function subirEvidencia(idProyecto: string, archivo: File) {
  const formData = new FormData();
  formData.append("id_proyecto", idProyecto);
  formData.append("archivo", archivo);

  return await api.post("/proyecto/evidencias/subir", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}