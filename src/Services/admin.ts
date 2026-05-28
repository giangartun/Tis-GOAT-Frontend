import { api } from './api';

// ── Interfaces — Usuarios ─────────────────────────────────────────────────────
export interface UsuarioAdmin {
  id_usuario: string;
  nombre: string;
  email: string;
  foto: string | null;
  rol: string;
  estado: 'activo' | 'suspendido';
  fecha_registro: string;
  fecha_ult_acceso: string;
}

export interface ListaUsuariosResponse {
  total_usuarios: number;
  total_activos: number;
  total_suspendidos: number;
  current_page: number;
  last_page: number;
  total: number;
  data_usuarios: UsuarioAdmin[];
}

// 🔥 INTERFAZ BITACORA ACTUALIZADA - agrega el campo "contexto"
export interface BitacoraItem {
  id_registro: string;
  id_usuario: string;
  nombre: string;
  email: string;
  foto: string | null;
  rol: string;
  estado_actual: string;
  tipo_accion: string;
  contexto: Record<string, any> | null;  // ← NUEVO CAMPO
  fecha_accion: string;
}

export interface ListaBitacoraResponse {
  total: number;
  current_page: number;
  last_page: number;
  data: BitacoraItem[];
}

export type TipoBitacora =
  | 'todos'
  | 'suspender'
  | 'reactivar'
  | 'modificaciones'
  | 'creacion'
  | 'login'
  | 'logout';

export interface FiltrosUsuarios {
  search?: string;
  estado?: 'activo' | 'suspendido' | 'todos';
  page?: number;
  per_page?: number;
}

export interface FiltrosBitacora {
  tipo?: TipoBitacora;
  fecha_desde?: string;
  fecha_hasta?: string;
  id_usuario?: string;
  page?: number;
}

// ── Interfaces — Tecnologías ──────────────────────────────────────────────────
export interface Tecnologia {
  id_tecnologia: string;
  nombre: string;
  categoria: string;
}

export interface ListaTecnologiasResponse {
  total: number;
  tecnologias: Tecnologia[];
}

// ── Interfaces — Grados ───────────────────────────────────────────────────────
export interface Grado {
  id_grado: string;
  nombre_grado: string;
}

export interface ListaGradosResponse {
  total: number;
  grados: Grado[];
}

// ── Interfaces — Anuncios ─────────────────────────────────────────────────────
export interface Anuncio {
  id_anuncio: string;
  titulo: string;
  descripcion: string | null;
  foto_url: string | null;
  url_redireccion: string;
  creado_en: string;
}

export interface ListaAnunciosResponse {
  total: number;
  anuncios: Anuncio[];
}

// ── Servicios — Usuarios ──────────────────────────────────────────────────────
export const getUsuarios = async (
  filtros: FiltrosUsuarios = {}
): Promise<ListaUsuariosResponse> => {
  const params = new URLSearchParams();
  if (filtros.search)                               params.append('search', filtros.search);
  if (filtros.estado && filtros.estado !== 'todos') params.append('estado', filtros.estado);
  if (filtros.page)                                 params.append('page', String(filtros.page));
  if (filtros.per_page)                             params.append('per_page', String(filtros.per_page));
  const { data } = await api.get(`/admin/usuarios?${params.toString()}`);
  return data;
};

export const suspenderUsuario = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.post(`/admin/usuarios/${id}/suspender`);
  return data;
};

export const reactivarUsuario = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.post(`/admin/usuarios/${id}/reactivar`);
  return data;
};

// ── Servicios — Bitácora ──────────────────────────────────────────────────────
export const getBitacora = async (
  filtros: FiltrosBitacora = {}
): Promise<ListaBitacoraResponse> => {
  const params = new URLSearchParams();
  if (filtros.tipo && filtros.tipo !== 'todos') params.append('tipo', filtros.tipo);
  if (filtros.fecha_desde)                      params.append('fecha_desde', filtros.fecha_desde);
  if (filtros.fecha_hasta)                      params.append('fecha_hasta', filtros.fecha_hasta);
  if (filtros.id_usuario)                       params.append('id_usuario', filtros.id_usuario);
  if (filtros.page)                             params.append('page', String(filtros.page));
  const { data } = await api.get(`/admin/bitacora?${params.toString()}`);
  return data;
};

// ── Servicios — Backup ────────────────────────────────────────────────────────
export const descargarBackup = async (): Promise<void> => {
  const response = await api.get('/admin/backup', { responseType: 'blob' });
  const url  = window.URL.createObjectURL(new Blob([response.data], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const importarBackup = async (
  archivo: File
): Promise<{ message: string; importado_en: string }> => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const { data } = await api.post('/admin/backup/importar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ── Servicios — Tecnologías ───────────────────────────────────────────────────
export const getTecnologias = async (): Promise<ListaTecnologiasResponse> => {
  const { data } = await api.get('/admin/tecnologias');
  return data;
};

export const crearTecnologia = async (
  payload: { nombre: string; categoria: string }
): Promise<{ message: string; tecnologia: Tecnologia }> => {
  const { data } = await api.post('/admin/tecnologias', payload);
  return data;
};

export const modificarTecnologia = async (
  id: string,
  payload: { nombre?: string; categoria?: string }
): Promise<{ message: string; tecnologia: Tecnologia }> => {
  const { data } = await api.put(`/admin/tecnologias/${id}`, payload);
  return data;
};

export const eliminarTecnologia = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/admin/tecnologias/${id}`);
  return data;
};

// ── Servicios — Grados ────────────────────────────────────────────────────────
export const getGrados = async (): Promise<ListaGradosResponse> => {
  const { data } = await api.get('/admin/grados');
  return data;
};

export const crearGrado = async (
  payload: { nombre_grado: string }
): Promise<{ message: string; grado: Grado }> => {
  const { data } = await api.post('/admin/grados', payload);
  return data;
};

export const modificarGrado = async (
  id: string,
  payload: { nombre_grado: string }
): Promise<{ message: string; grado: Grado }> => {
  const { data } = await api.put(`/admin/grados/${id}`, payload);
  return data;
};

export const eliminarGrado = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/admin/grados/${id}`);
  return data;
};

// ── Servicios — Anuncios ──────────────────────────────────────────────────────
export const getAnuncios = async (): Promise<ListaAnunciosResponse> => {
  const { data } = await api.get('/admin/anuncios');
  return data;
};

export const crearAnuncio = async (
  formData: FormData
): Promise<{ message: string; anuncio: Anuncio }> => {
  const { data } = await api.post('/admin/anuncios', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const modificarAnuncio = async (
  id: string,
  formData: FormData
): Promise<{ message: string; anuncio: Anuncio }> => {
  const { data } = await api.post(`/admin/anuncios/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const eliminarAnuncio = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/admin/anuncios/${id}`);
  return data;
};