import { api } from './api';

// ── Interfaces ───────────────────────────────────────────────────────────────
export interface ItemSeccion {
  nombre: string;
  visible: boolean;
}

export interface SeccionData {
  TODOS: boolean;
  [id: string]: ItemSeccion | boolean;
}

export interface PrivacidadResponse {
  portafolio: boolean;
  proyectos: SeccionData;
  habilidades: SeccionData;
  experiencia_academica: SeccionData;
  experiencia_laboral: SeccionData;
  redes_profesionales: SeccionData;
}

export interface EstadoFrontend {
  portafolio: boolean;
  proyectos: Record<string, boolean>;
  habilidades: Record<string, boolean>;
  experiencia_academica: Record<string, boolean>;
  experiencia_laboral: Record<string, boolean>;
  redes_profesionales: Record<string, boolean>;
}

export interface NombresItems {
  proyectos: Record<string, string>;
  habilidades: Record<string, string>;
  experiencia_academica: Record<string, string>;
  experiencia_laboral: Record<string, string>;
  redes_profesionales: Record<string, string>;
}

export interface PayloadActualizar {
  portafolio: boolean;
  proyectos?: Record<string, boolean>;
  habilidades?: Record<string, boolean>;
  experiencia_academica?: Record<string, boolean>;
  experiencia_laboral?: Record<string, boolean>;
  redes_profesionales?: Record<string, boolean>;
}

export type ClaveSeccion = keyof Omit<EstadoFrontend, 'portafolio'>;

export const SECCIONES_KEYS: ClaveSeccion[] = [
  'proyectos',
  'habilidades',
  'experiencia_academica',
  'experiencia_laboral',
  'redes_profesionales',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const esItemSeccion = (valor: unknown): valor is ItemSeccion => {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'nombre' in valor &&
    'visible' in valor &&
    typeof (valor as ItemSeccion).nombre === 'string' &&
    typeof (valor as ItemSeccion).visible === 'boolean'
  );
};

const extraerItems = (seccion: SeccionData): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  for (const key of Object.keys(seccion)) {
    if (key === 'TODOS') continue;
    const valor = seccion[key];
    if (esItemSeccion(valor)) {
      result[key] = valor.visible;
    }
  }
  return result;
};

const extraerNombres = (seccion: SeccionData): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const key of Object.keys(seccion)) {
    if (key === 'TODOS') continue;
    const valor = seccion[key];
    if (esItemSeccion(valor)) {
      result[key] = valor.nombre;
    }
  }
  return result;
};

export const transformarRespuesta = (raw: PrivacidadResponse): EstadoFrontend => {
  return {
    portafolio:            raw.portafolio,
    proyectos:             extraerItems(raw.proyectos),
    habilidades:           extraerItems(raw.habilidades),
    experiencia_academica: extraerItems(raw.experiencia_academica),
    experiencia_laboral:   extraerItems(raw.experiencia_laboral),
    redes_profesionales:   extraerItems(raw.redes_profesionales),
  };
};

export const extraerTodosLosNombres = (raw: PrivacidadResponse): NombresItems => {
  return {
    proyectos:             extraerNombres(raw.proyectos),
    habilidades:           extraerNombres(raw.habilidades),
    experiencia_academica: extraerNombres(raw.experiencia_academica),
    experiencia_laboral:   extraerNombres(raw.experiencia_laboral),
    redes_profesionales:   extraerNombres(raw.redes_profesionales),
  };
};

export const calcularTodos = (items: Record<string, boolean>): boolean =>
  Object.keys(items).length > 0 && Object.values(items).some(Boolean);

export const calcularCambios = (
  original: EstadoFrontend,
  actual: EstadoFrontend
): PayloadActualizar => {
  const payload: PayloadActualizar = { portafolio: actual.portafolio };

  for (const seccion of SECCIONES_KEYS) {
    const cambios: Record<string, boolean> = {};
    for (const id of Object.keys(actual[seccion])) {
      if (actual[seccion][id] !== original[seccion][id]) {
        cambios[id] = actual[seccion][id];
      }
    }
    if (Object.keys(cambios).length > 0) {
      payload[seccion] = cambios;
    }
  }

  return payload;
};

// MOCK DATA (para pruebas sin backend) 
const USE_MOCK = false; // Cambiar a false cuando el backend esté listo

const MOCK_DATA: PrivacidadResponse = {
  portafolio: true,
  proyectos: {
    TODOS: true,
    "1": { nombre: "App TIS", visible: true },
    "2": { nombre: "Portafolio Digital", visible: true },
    "3": { nombre: "E-commerce React", visible: false },
    "4": { nombre: "API REST Node.js", visible: true },
  },
  habilidades: {
    TODOS: true,
    "1": { nombre: "React", visible: true },
    "2": { nombre: "TypeScript", visible: true },
    "3": { nombre: "Node.js", visible: false },
    "4": { nombre: "Laravel", visible: true },
    "5": { nombre: "PostgreSQL", visible: true },
  },
  experiencia_academica: {
    TODOS: false,
  },
  experiencia_laboral: {
    TODOS: true,
    "1": { nombre: "Frontend Developer - Empresa ABC", visible: true },
    "2": { nombre: "Full Stack - Empresa XYZ", visible: false },
  },
  redes_profesionales: {
    TODOS: true,
    "1": { nombre: "LinkedIn", visible: true },
    "2": { nombre: "GitHub", visible: true },
    "3": { nombre: "Twitter", visible: false },
  },
};

// ── Servicios ────────────────────────────────────────────────────────────────

export const getPrivacidad = async (): Promise<PrivacidadResponse> => {
  //  Usar mock para pruebas sin backend
  if (USE_MOCK) {
    console.log(' Usando MOCK_DATA (sin backend)');
    return MOCK_DATA;
  }
  
  //  Llamada real al backend (comentada mientras se usa mock)
  const { data } = await api.get('/privacidad');
  return data;
};

export const actualizarPrivacidad = async (
  payload: PayloadActualizar
): Promise<{ message: string }> => {
  //  Simular respuesta exitosa para mock
  if (USE_MOCK) {
    console.log(' Mock: Guardando cambios', payload);
    return { message: 'Configuración guardada correctamente (mock)' };
  }
  
  const { data } = await api.post('/privacidad/actualizar', payload);
  return data;
};

export const restablecerPrivacidad = async (): Promise<{ message: string }> => {
  //  Simular respuesta exitosa para mock
  if (USE_MOCK) {
    console.log(' Mock: Restableciendo todo a público');
    return { message: 'Privacidad restablecida (mock)' };
  }
  
  const { data } = await api.post('/privacidad/restablecer');
  return data;
};