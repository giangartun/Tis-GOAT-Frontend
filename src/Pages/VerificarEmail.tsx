import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface VerificarEmailProps {}

export const VerificarEmail: React.FC<VerificarEmailProps> = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verificarEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no válido');
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/usuario/verificar-email/${token}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || '✅ ¡Email verificado exitosamente!');
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: '✅ Cuenta verificada exitosamente. Ya puedes iniciar sesión.' 
              }
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || '❌ Error al verificar el email. El enlace pudo haber expirado.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Error de conexión con el servidor. Asegúrate de que el backend esté corriendo.');
      }
    };

    verificarEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#2E3A4D]">GOAT</h1>
            <p className="text-gray-500 text-sm mt-1">Sistema Generador de Portafolios Digitales</p>
          </div>

          {/* Estado de verificación */}
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando tu correo electrónico...</p>
              <p className="text-gray-400 text-sm mt-2">Por favor espera un momento</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-600 mb-2">¡Verificación exitosa!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-gray-400 text-sm">Redirigiendo al login...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error de verificación</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Volver al login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};