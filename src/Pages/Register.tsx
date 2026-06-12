import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface RegisterProps {
  onSwitchToLogin?: () => void;
  onRegisterSuccess?: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onSwitchToLogin,
  onRegisterSuccess
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email: '',
    contrasena: '',
    contrasena_confirmation: ''
  });

  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const soloLetras = (texto: string): boolean => {
    const regex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]*$/;
    return regex.test(texto);
  };

  const limpiarNumeros = (texto: string): string => {
    return texto.replace(/[0-9]/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let nuevoValor = value;

    if (
      name === 'nombre' ||
      name === 'apellido_paterno' ||
      name === 'apellido_materno'
    ) {
      nuevoValor = limpiarNumeros(value);
    }

    setFormData({
      ...formData,
      [name]: nuevoValor
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    if (error) setError('');
    if (message) setMessage('');
  };

  const validateForm = (): boolean => {
    if (
      !formData.nombre ||
      !formData.apellido_paterno ||
      !formData.apellido_materno ||
      !formData.email ||
      !formData.contrasena ||
      !formData.contrasena_confirmation
    ) {
      setError(t('register.errors.required'));
      return false;
    }

    if (!soloLetras(formData.nombre)) {
      setError(t('register.errors.name_letters'));
      return false;
    }

    if (!soloLetras(formData.apellido_paterno)) {
      setError(t('register.errors.last_name_letters'));
      return false;
    }

    if (!soloLetras(formData.apellido_materno)) {
      setError(t('register.errors.second_last_name_letters'));
      return false;
    }

    if (formData.contrasena !== formData.contrasena_confirmation) {
      setError(t('register.errors.password_match'));
      return false;
    }

    if (formData.contrasena.length < 6) {
      setError(t('register.errors.password_length'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError(t('register.errors.email_invalid'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/api/usuario/pre-registro',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || t('register.success.check_email'));

        setFormData({
          nombre: '',
          apellido_paterno: '',
          apellido_materno: '',
          email: '',
          contrasena: '',
          contrasena_confirmation: ''
        });

        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess();
          } else {
            navigate('/login', {
              state: {
                message: t('register.success.login_message')
              }
            });
          }
        }, 7000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setError(data.message || t('register.errors.register_failed'));
        }
      }
    } catch {
      setError(t('register.errors.connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panel izquierdo - ocupa toda la pantalla en móvil, 1/2 en desktop */}
      <div className="w-full md:w-1/2 bg-[#2E3A4D] p-6 sm:p-8 flex flex-col justify-center items-center text-center text-white">
        <div className="max-w-sm">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">GOAT</h1>

          <p className="text-lg sm:text-xl mb-3 sm:mb-4">{t('register.left.title')}</p>

          <div className="w-16 h-1 bg-white mx-auto mb-3 sm:mb-4"></div>

          <p className="text-sm sm:text-base text-blue-100">{t('register.left.subtitle')}</p>
        </div>
      </div>

      {/* Panel derecho - ocupa toda la pantalla en móvil, 1/2 en desktop */}
      <div className="w-full md:w-1/2 flex flex-col justify-center overflow-y-auto py-4 sm:py-6">
        <div className="max-w-md mx-auto w-full px-4 sm:px-6">
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {t('register.title')}
            </h2>

            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {t('register.subtitle')}
            </p>
          </div>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-xs sm:text-sm">
              {message}

              <div className="text-xs mt-1 text-green-600">
                {t('register.redirecting')}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="text-left">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('register.fields.name')} *
              </label>

              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder={t('register.placeholders.name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style={{ backgroundColor: '#D9D9D9', color: '#837B7B' }}
                required
              />

              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            <div className="text-left">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('register.fields.last_name')} *
              </label>

              <input
                type="text"
                name="apellido_paterno"
                value={formData.apellido_paterno}
                onChange={handleChange}
                placeholder={t('register.placeholders.last_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style={{ backgroundColor: '#D9D9D9', color: '#837B7B' }}
                required
              />

              {errors.apellido_paterno && (
                <p className="text-red-500 text-xs mt-1">{errors.apellido_paterno}</p>
              )}
            </div>

            <div className="text-left">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('register.fields.second_last_name')} *
              </label>

              <input
                type="text"
                name="apellido_materno"
                value={formData.apellido_materno}
                onChange={handleChange}
                placeholder={t('register.placeholders.second_last_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style={{ backgroundColor: '#D9D9D9', color: '#837B7B' }}
                required
              />

              {errors.apellido_materno && (
                <p className="text-red-500 text-xs mt-1">{errors.apellido_materno}</p>
              )}
            </div>

            <div className="text-left">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('register.fields.email')} *
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('register.placeholders.email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style={{ backgroundColor: '#D9D9D9', color: '#837B7B' }}
                required
              />

              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="text-left">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('register.fields.password')} *
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder={t('register.placeholders.password')}
                  className="w-full px-3 py-2 pr-8 sm:pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: '#D9D9D9', color: '#837B7B' }}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-2.5 text-gray-500"
                >
                  👁
                </button>
              </div>

              {errors.contrasena && (
                <p className="text-red-500 text-xs mt-1">{errors.contrasena}</p>
              )}
            </div>

            <div className="text-left">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t('register.fields.confirm_password')} *
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="contrasena_confirmation"
                  value={formData.contrasena_confirmation}
                  onChange={handleChange}
                  placeholder={t('register.placeholders.confirm_password')}
                  className="w-full px-3 py-2 pr-8 sm:pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: '#D9D9D9', color: '#837B7B' }}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 sm:right-3 top-2.5 text-gray-500"
                >
                  👁
                </button>
              </div>

              {errors.contrasena_confirmation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contrasena_confirmation}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? t('register.loading') : t('register.button')}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={handleSwitchToLogin}
              className="text-xs sm:text-sm text-blue-600 hover:underline"
            >
              {t('register.login_link')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};