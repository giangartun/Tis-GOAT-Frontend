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
      // 🔥 LIMPIAR TODO ANTES DE LOGIN (CLAVE)
      localStorage.clear();

      const response = await fetch(
        import.meta.env.VITE_API_URL + '/api/usuario/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(credentials)
        }
      );

      const data = await response.json();

      // 🔥 DEBUG IMPORTANTE
      console.log("LOGIN RESPONSE:", data);

      if (response.ok) {
        if (data.token) {

          // Guardar token y usuario
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuario', JSON.stringify(data.usuario));

          // Obtener correctamente id_portafolio
          const idPortafolio =
            data.id_portafolio ?? data.usuario?.id_portafolio ?? null;

          if (idPortafolio) {
            localStorage.setItem("id_portafolio", String(idPortafolio));
          } else {
            // Evita que quede un id viejo
            localStorage.removeItem("id_portafolio");
          }

          if (onLoginSuccess) {
            onLoginSuccess();
          }

          // Redirección limpia
          navigate('/', { replace: true });
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

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={credentials.contrasena}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2"
                  >
                    👁
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md"
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>

            </form>

            <div className="text-center mt-6">
              <button
                onClick={handleSwitchToRegister}
                className="text-sm text-blue-600"
              >
                ¿No tienes cuenta? Regístrate
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};