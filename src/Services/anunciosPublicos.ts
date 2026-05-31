import { api } from './api';
import type { Anuncio } from './admin';

export interface ListaAnunciosPublicosResponse {
  total: number;
  anuncios: Anuncio[];
}

// Endpoint público - NO requiere token de admin (creado por Adri)
export const getAnunciosPublicos = async (): Promise<ListaAnunciosPublicosResponse> => {
  const { data } = await api.get('/anuncios/home');
  return data;
};