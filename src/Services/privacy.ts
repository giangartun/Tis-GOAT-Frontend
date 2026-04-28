import { api } from './api';

export interface PrivacidadEstado {
  portafolio: boolean;
  proyectos: boolean;
  habilidades: boolean;
  experiencia_academica: boolean;
  experiencia_laboral: boolean;
  redes_profesionales: boolean;
}

export interface PrivacidadResponse {
  portafolio: boolean;
  proyectos: boolean | Array<{ id_proyecto: number; nombre: string; visible: boolean }>;
  habilidades: boolean | Array<{ id_habilidad: number; nombre: string; visible: boolean }>;
  experiencia_academica: boolean | Array<{ id_experiencia_academica: number; titulo: string; visible: boolean }>;
  experiencia_laboral: boolean | Array<{ id_experiencia: number; cargo: string; visible: boolean }>;
  redes_profesionales: boolean | Array<{ id_redes_prof: number; nombre_red: string; visible: boolean }>;
}

// GET /api/privacidad
export const getPrivacidad = async (): Promise<PrivacidadResponse> => {
  const { data } = await api.get('/privacidad');
  return data;
};

// POST /api/privacidad/actualizar
export const actualizarPrivacidad = async (estado: PrivacidadEstado): Promise<{ message: string }> => {
  const { data } = await api.post('/privacidad/actualizar', estado);
  return data;
};

// POST /api/privacidad/restablecer
export const restablecerPrivacidad = async (): Promise<{ message: string }> => {
  const { data } = await api.post('/privacidad/restablecer');
  return data;
};

// Normaliza la respuesta del GET a booleanos simples para los toggles
export const normalizeEstado = (raw: PrivacidadResponse): PrivacidadEstado => ({
  portafolio: raw.portafolio,
  proyectos:
    raw.proyectos === true ||
    (Array.isArray(raw.proyectos) && raw.proyectos.every((p) => p.visible)),
  habilidades:
    raw.habilidades === true ||
    (Array.isArray(raw.habilidades) && raw.habilidades.every((h) => h.visible)),
  experiencia_academica:
    raw.experiencia_academica === true ||
    (Array.isArray(raw.experiencia_academica) && raw.experiencia_academica.every((e) => e.visible)),
  experiencia_laboral:
    raw.experiencia_laboral === true ||
    (Array.isArray(raw.experiencia_laboral) && raw.experiencia_laboral.every((e) => e.visible)),
  redes_profesionales:
    raw.redes_profesionales === true ||
    (Array.isArray(raw.redes_profesionales) && raw.redes_profesionales.every((r) => r.visible)),
});