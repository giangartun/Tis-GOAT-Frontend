import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginProps {
  onSwitchToRegister?: () => void;
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ 
  onSwitchToRegister, 
  onLoginSuccess 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');
  
  const [credentials, setCredentials] = useState({
    email: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // 👇 NUEVO: estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => setInfoMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/usuario/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));
<<<<<<< HEAD
          localStorage.setItem('portafolio', data.id_portafolio);
=======
>>>>>>> 2082272 (Estructura terminada de perfil conectado con home)
          
          if (onLoginSuccess) {
            onLoginSuccess();
          }
          navigate('/');
        }
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setError(data.message || 'Credenciales incorrectas o email no verificado');
        }
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full h-screen flex">
        <div className="w-1/2 bg-[#2E3A4D] p-8 flex flex-col justify-center items-center text-center text-white">
          <div className="max-w-sm">
            <h1 className="text-4xl font-bold mb-4">GOAT</h1>
            <p className="text-xl mb-4">Sistema Generador de Portafolios Digitales</p>
            <div className="w-16 h-1 bg-white mx-auto mb-4"></div>
            <p className="text-blue-100">
              Accede a tu cuenta y gestiona tu portafolio profesional.
              Conecta con oportunidades laborales.
            </p>
          </div>
        </div>

        <div className="w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
              <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta</p>
            </div>

            {infoMessage && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
                {infoMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="Ingresa tu correo electrónico"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ backgroundColor: '#D9D9D9', color: '#837B7B' }}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={credentials.contrasena}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ backgroundColor: '#D9D9D9', color: '#837B7B' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.contrasena && (
                  <p className="text-red-500 text-xs mt-1">{errors.contrasena}</p>
                )}
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={handleSwitchToRegister}
                className="text-sm text-blue-600 hover:underline"
              >
                ¿No tienes una cuenta? Regístrate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};