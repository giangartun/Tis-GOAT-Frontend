import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { getAnunciosPublicos } from '../Services/anunciosPublicos';
import type { Anuncio } from '../Services/admin';

const Anuncios: React.FC = () => {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarAnuncios = async () => {
      setLoading(true);
      try {
        const res = await getAnunciosPublicos();
        setAnuncios(res.anuncios);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los anuncios');
      } finally {
        setLoading(false);
      }
    };
    cargarAnuncios();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando anuncios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Todos los anuncios</h1>
        <p className="text-gray-500 mb-8">Aquí encontrarás todas las publicaciones y novedades</p>

        {anuncios.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400">No hay anuncios disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anuncios.map((anuncio) => (
              <a
                key={anuncio.id_anuncio}
                href={anuncio.url_redireccion}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {anuncio.foto_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={anuncio.foto_url}
                      alt={anuncio.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition">
                    {anuncio.titulo}
                  </h3>
                  {anuncio.descripcion && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                      {anuncio.descripcion}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {anuncio.creado_en}
                    </span>
                    <span className="text-blue-600 text-sm font-medium group-hover:underline">
                      Leer más →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Anuncios;