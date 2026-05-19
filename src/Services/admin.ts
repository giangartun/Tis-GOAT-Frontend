import { api } from './api';

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  apellido_paterno: string;
  email: string;
  estado: 'activo' | 'suspendido';
  rol: 'usuario' | 'administrador';
  created_at: string;
  ultimo_acceso: string | null;
}

export interface ListaUsuariosResponse {
  data: UsuarioAdmin[];
  total: number;
  activos: number;
  suspendidos: number;
  current_page: number;
  last_page: number;
}

export interface BitacoraItem {
  id: string;
  admin: { nombre: string; email: string };
  usuario_afectado: { nombre: string; email: string };
  tipo_accion: 'suspender' | 'reactivar';
  motivo: string | null;
  created_at: string;
}

export interface ListaBitacoraResponse {
  data: BitacoraItem[];
  total: number;
  current_page: number;
  last_page: number;
}

export interface FiltrosUsuarios {
  search?: string;
  estado?: 'activo' | 'suspendido' | 'todos';
  page?: number;
  per_page?: number;
}

export interface FiltrosBitacora {
  fecha_desde?: string;
  fecha_hasta?: string;
  id_usuario?: string;
  tipo?: 'suspender' | 'reactivar' | 'todos';
  page?: number;
}

// ════════════════════════════════════════════════════════════
//  MOCK DATA - ELIMINAR CUANDO EL BACKEND ESTÉ LISTO 
// Cambiar USE_MOCK a false cuando el backend esté funcionando

const USE_MOCK = true; // ← Cambiar a false cuando el backend esté listo

const MOCK_USUARIOS_DATA: UsuarioAdmin[] = [
  { id: "1", nombre: "Carlos", apellido_paterno: "Lopez", email: "carlos@test.com", estado: "activo", rol: "administrador", created_at: "2025-01-15T10:00:00Z", ultimo_acceso: "2025-05-18T09:30:00Z" },
  { id: "2", nombre: "Maria", apellido_paterno: "Garcia", email: "maria@test.com", estado: "activo", rol: "usuario", created_at: "2025-02-20T10:00:00Z", ultimo_acceso: "2025-05-17T15:20:00Z" },
  { id: "3", nombre: "Juan", apellido_paterno: "Perez", email: "juan@test.com", estado: "suspendido", rol: "usuario", created_at: "2025-03-10T10:00:00Z", ultimo_acceso: null },
  { id: "4", nombre: "Ana", apellido_paterno: "Rodriguez", email: "ana@test.com", estado: "activo", rol: "usuario", created_at: "2025-04-05T10:00:00Z", ultimo_acceso: "2025-05-16T11:45:00Z" },
  { id: "5", nombre: "Luis", apellido_paterno: "Fernandez", email: "luis@test.com", estado: "activo", rol: "usuario", created_at: "2025-04-20T10:00:00Z", ultimo_acceso: "2025-05-15T14:00:00Z" },
  { id: "6", nombre: "Elena", apellido_paterno: "Martinez", email: "elena@test.com", estado: "suspendido", rol: "usuario", created_at: "2025-05-01T10:00:00Z", ultimo_acceso: "2025-05-10T08:00:00Z" },
];

const MOCK_BITACORA_DATA: BitacoraItem[] = [
  { id: "1", admin: { nombre: "Carlos Lopez", email: "carlos@test.com" }, usuario_afectado: { nombre: "Juan Perez", email: "juan@test.com" }, tipo_accion: "suspender", motivo: "Comportamiento inapropiado", created_at: "2025-05-10T14:30:00Z" },
  { id: "2", admin: { nombre: "Carlos Lopez", email: "carlos@test.com" }, usuario_afectado: { nombre: "Juan Perez", email: "juan@test.com" }, tipo_accion: "reactivar", motivo: null, created_at: "2025-05-12T09:15:00Z" },
  { id: "3", admin: { nombre: "Carlos Lopez", email: "carlos@test.com" }, usuario_afectado: { nombre: "Elena Martinez", email: "elena@test.com" }, tipo_accion: "suspender", motivo: "Publicaciones inadecuadas", created_at: "2025-05-14T11:00:00Z" },
];

// ════════════════════════════════════════════════════════════
// FIN DEL MOCK - ELIMINAR HASTA AQUÍ CUANDO BACKEND ESTÉ LISTO
// ============================================================

// ── Usuarios ──────────────────────────────────────────
export const getUsuarios = async (
  filtros: FiltrosUsuarios = {}
): Promise<ListaUsuariosResponse> => {
  // 🔥 MOCK - ELIMINAR ESTE BLOQUE CUANDO EL BACKEND ESTÉ LISTO
  if (USE_MOCK) {
    console.log('📦 Mock: getUsuarios', filtros);
    let data = [...MOCK_USUARIOS_DATA];
    if (filtros.search) {
      const search = filtros.search.toLowerCase();
      data = data.filter(u => u.nombre.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    }
    if (filtros.estado && filtros.estado !== 'todos') {
      data = data.filter(u => u.estado === filtros.estado);
    }
    const activos = data.filter(u => u.estado === 'activo').length;
    const suspendidos = data.filter(u => u.estado === 'suspendido').length;
    return {
      data,
      total: data.length,
      activos,
      suspendidos,
      current_page: 1,
      last_page: 1,
    };
  }
  // 🔥 FIN DEL MOCK - MANTENER EL CÓDIGO REAL DEBAJO
  
  const params = new URLSearchParams();
  if (filtros.search)   params.append('search', filtros.search);
  if (filtros.estado)   params.append('estado', filtros.estado);
  if (filtros.page)     params.append('page', String(filtros.page));
  if (filtros.per_page) params.append('per_page', String(filtros.per_page));
  const { data } = await api.get(`/admin/usuarios?${params.toString()}`);
  return data;
};

export const suspenderUsuario = async (
  id: string,
  motivo?: string
): Promise<{ message: string; estado: string }> => {
  // 🔥 MOCK - ELIMINAR ESTE BLOQUE CUANDO EL BACKEND ESTÉ LISTO
  if (USE_MOCK) {
    console.log('📦 Mock: suspenderUsuario', { id, motivo });
    return { message: "Cuenta suspendida correctamente (mock)", estado: "suspendido" };
  }
  // 🔥 FIN DEL MOCK
  
  const { data } = await api.post(`/admin/usuarios/${id}/suspender`, { motivo });
  return data;
};

export const reactivarUsuario = async (
  id: string
): Promise<{ message: string; estado: string }> => {
  // 🔥 MOCK - ELIMINAR ESTE BLOQUE CUANDO EL BACKEND ESTÉ LISTO
  if (USE_MOCK) {
    console.log('📦 Mock: reactivarUsuario', { id });
    return { message: "Cuenta reactivada correctamente (mock)", estado: "activo" };
  }
  // 🔥 FIN DEL MOCK
  
  const { data } = await api.post(`/admin/usuarios/${id}/reactivar`);
  return data;
};

// ── Bitácora ──────────────────────────────────────────
export const getBitacora = async (
  filtros: FiltrosBitacora = {}
): Promise<ListaBitacoraResponse> => {
  // 🔥 MOCK - ELIMINAR ESTE BLOQUE CUANDO EL BACKEND ESTÉ LISTO
  if (USE_MOCK) {
    console.log('📦 Mock: getBitacora', filtros);
    let data = [...MOCK_BITACORA_DATA];
    if (filtros.fecha_desde) {
      const desde = new Date(filtros.fecha_desde);
      data = data.filter(b => new Date(b.created_at) >= desde);
    }
    if (filtros.fecha_hasta) {
      const hasta = new Date(filtros.fecha_hasta);
      hasta.setHours(23, 59, 59);
      data = data.filter(b => new Date(b.created_at) <= hasta);
    }
    if (filtros.tipo && filtros.tipo !== 'todos') {
      data = data.filter(b => b.tipo_accion === filtros.tipo);
    }
    return {
      data,
      total: data.length,
      current_page: 1,
      last_page: 1,
    };
  }
  // 🔥 FIN DEL MOCK
  
  const params = new URLSearchParams();
  if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
  if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
  if (filtros.id_usuario)  params.append('id_usuario', filtros.id_usuario);
  if (filtros.tipo)        params.append('tipo', filtros.tipo);
  if (filtros.page)        params.append('page', String(filtros.page));
  const { data } = await api.get(`/admin/bitacora?${params.toString()}`);
  return data;
};

// ── Backup ────────────────────────────────────────────
export const descargarBackup = async (): Promise<void> => {
  // 🔥 MOCK - ELIMINAR ESTE BLOQUE CUANDO EL BACKEND ESTÉ LISTO
  if (USE_MOCK) {
    console.log('📦 Mock: descargarBackup');
    const blob = new Blob([JSON.stringify({ mock: true, data: "Backup simulado", timestamp: new Date().toISOString() })], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup-mock-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return;
  }
  // 🔥 FIN DEL MOCK
  
  const response = await api.get('/admin/backup', { responseType: 'blob' });
  const url  = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', `backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const importarBackup = async (
  archivo: File
): Promise<{ message: string }> => {
  // 🔥 MOCK - ELIMINAR ESTE BLOQUE CUANDO EL BACKEND ESTÉ LISTO
  if (USE_MOCK) {
    console.log('📦 Mock: importarBackup', archivo.name);
    return { message: "Backup importado correctamente (mock)" };
  }
  // 🔥 FIN DEL MOCK
  
  const formData = new FormData();
  formData.append('archivo', archivo);
  const { data } = await api.post('/admin/backup/importar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};