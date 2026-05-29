import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LoginProps {
  onSwitchToRegister?: () => void;
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onSwitchToRegister,
  onLoginSuccess
}) => {
  const { t } = useTranslation();

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
    if (!infoMessage) return;

    const timer = setTimeout(() => setInfoMessage(''), 5000);
    return () => clearTimeout(timer);
  }, [infoMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }

    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('id_portafolio');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuario/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(credentials),
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
        }

        onLoginSuccess?.();

        const tipoUsuario = data.tipo_usuario ?? data.usuario?.tipo_usuario ?? null;
        if (tipoUsuario === 'admin') {
          navigate('/admin/usuarios', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }

      if (response.status === 403) {
        setError(
          data.message ||
          'Tu cuenta ha sido suspendida. Contacta al administrador.'
        );
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setError(data.message || t('login.errors.invalid'));
      }
    } catch {
      setError(t('login.errors.connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
      return;
    }

    navigate('/register');
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setRecoveryError('');
    setRecoveryMessage('');
    setRecoveryLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuario/contrasena/olvido`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ email: recoveryEmail })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setRecoveryMessage(data.message || t('login.recovery.success'));
      } else {
        setRecoveryError(data.message || t('login.recovery.error'));
      }
    } catch {
      setRecoveryError(t('login.errors.connection'));
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panel izquierdo - ocupa toda la pantalla en móvil, 1/2 en desktop */}
      <div className="w-full md:w-1/2 bg-[#2E3A4D] flex flex-col justify-center items-center text-center text-white p-6 sm:p-8">
        <div className="max-w-sm">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">GOAT</h1>

          <p className="text-lg sm:text-xl mb-3 sm:mb-4">{t('login.left.title')}</p>

          <div className="w-16 h-1 bg-white mx-auto mb-3 sm:mb-4" />

          <p className="text-sm sm:text-base text-blue-100">{t('login.left.subtitle')}</p>
        </div>
      </div>

      {/* Panel derecho - ocupa toda la pantalla en móvil, 1/2 en desktop */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-4 sm:p-8 bg-gray-50">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {t('login.title')}
            </h2>

            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {t('login.subtitle')}
            </p>
          </div>

          {infoMessage && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-xs sm:text-sm">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                {t('login.email')}
              </label>

              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder={t('login.placeholders.email')}
                className="w-full px-3 sm:px-4 py-2 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />

              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                {t('login.password')}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="contrasena"
                  value={credentials.contrasena}
                  onChange={handleChange}
                  placeholder={t('login.placeholders.password')}
                  className="w-full px-3 sm:px-4 py-2 pr-8 sm:pr-10 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 sm:right-3 top-2.5 text-gray-500"
                >
                  👁
                </button>
              </div>

              {errors.contrasena && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.contrasena}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowRecovery((prev) => !prev)}
                className="text-xs sm:text-sm text-blue-600 hover:underline"
              >
                {t('login.forgot_password')}
              </button>
            </div>

            {showRecovery && (
              <div className="border border-gray-300 rounded-md p-3 sm:p-4 bg-white space-y-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700">
                  {t('login.recovery.title')}
                </h3>

                <p className="text-xs text-gray-500">
                  {t('login.recovery.description')}
                </p>

                {recoveryMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs sm:text-sm">
                    {recoveryMessage}
                  </div>
                )}

                {recoveryError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs sm:text-sm">
                    {recoveryError}
                  </div>
                )}

                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder={t('login.recovery.placeholder')}
                  className="w-full px-3 sm:px-4 py-2 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleRecoverySubmit}
                    disabled={recoveryLoading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 text-sm"
                  >
                    {recoveryLoading
                      ? t('login.recovery.sending')
                      : t('login.recovery.send')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition font-medium text-sm"
                  >
                    {t('login.recovery.cancel')}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? t('login.loading') : t('login.button')}
            </button>
          </form>

          <div className="text-center mt-4 sm:mt-6">
            <button
              onClick={handleSwitchToRegister}
              className="text-xs sm:text-sm text-blue-600 hover:underline"
            >
              {t('login.register_link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};