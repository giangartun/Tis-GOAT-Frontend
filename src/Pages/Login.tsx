import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 🔥 IMPORTANTE

interface LoginProps {
  onSwitchToRegister?: () => void;
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onSwitchToRegister,
  onLoginSuccess
}) => {
  const { t } = useTranslation(); // 🔥 HOOK DE TRADUCCIÓN

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

  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

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

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        const idPortafolio =
          data.id_portafolio ?? data.usuario?.id_portafolio ?? null;

        if (idPortafolio) {
          localStorage.setItem('id_portafolio', String(idPortafolio));
        } else {
          localStorage.removeItem('id_portafolio');
        }

        onLoginSuccess?.();
        navigate('/', { replace: true });
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setError(data.message || t('login.errors.invalid'));
        }
      }
    } catch (err) {
      setError(t('login.errors.connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    onSwitchToRegister ? onSwitchToRegister() : navigate('/register');
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setRecoveryError('');
    setRecoveryMessage('');
    setRecoveryLoading(true);

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/api/usuario/contrasena/olvido',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: recoveryEmail })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRecoveryMessage(
          data.message || 'Se envió el enlace de recuperación a tu correo.'
        );
      } else {
        setRecoveryError(data.message || 'No se pudo enviar el enlace.');
      }
    } catch (err) {
      setRecoveryError('Error de conexión con el servidor.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      {/* PANEL IZQUIERDO */}
      <div className="w-1/2 bg-[#2E3A4D] flex flex-col justify-center items-center text-center text-white p-8">
        <div className="max-w-sm">
          <h1 className="text-4xl font-bold mb-4">GOAT</h1>
          <p className="text-xl mb-4">
            {t("login.left.title")}
          </p>
          <div className="w-16 h-1 bg-white mx-auto mb-4"></div>
          <p className="text-blue-100">
            {t("login.left.subtitle")}
          </p>
        </div>
      </div>

      {/* DERECHA */}
      <div className="w-1/2 flex flex-col justify-center p-8 bg-gray-50">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {t("login.title")}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {t("login.subtitle")}
            </p>
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
                {t("login.email")}
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="Ingresa tu correo electrónico"
                className="w-full px-4 py-2 rounded-md border border-gray-300 
                           bg-[#E5E5E5] text-gray-700 placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                {t("login.password")}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="contrasena"
                  value={credentials.contrasena}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 
                             bg-[#E5E5E5] text-gray-700 placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5"
                >
                  👁
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowRecovery(!showRecovery)}
                className="text-sm text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {showRecovery && (
              <div className="border border-gray-300 rounded-md p-4 bg-white space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Recuperar contraseña
                </h3>

                <p className="text-xs text-gray-500">
                  Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                {recoveryMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-sm">
                    {recoveryMessage}
                  </div>
                )}

                {recoveryError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                    {recoveryError}
                  </div>
                )}

                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="Ingresa tu correo"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleRecoverySubmit}
                    disabled={recoveryLoading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50"
                  >
                    {recoveryLoading ? 'Enviando...' : 'Enviar enlace'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md 
                         hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {loading ? t("login.loading") : t("login.button")}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={handleSwitchToRegister}
              className="text-sm text-blue-600 hover:underline"
            >
              {t("login.register_link")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};