import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">HOME</h1>
              <p className="text-sm text-gray-600">Sistema de Portafolios Digitales</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Panel Principal</h2>
            <p className="text-gray-600">
              ¡Bienvenido a GOAT! Aquí podrás comenzar a construir tu portafolio digital.
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Profesión:</strong> {user?.profession}
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Email:</strong> {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};