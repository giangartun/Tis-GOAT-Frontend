import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ResetPassword: React.FC = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + '/api/usuario/contrasena/resetear',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            token,
            email: form.email,
            password: form.password,
            password_confirmation: form.password_confirmation,
            contrasena: form.password,
            contrasena_confirmation: form.password_confirmation
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || t('resetPassword.success.updated'));

        setTimeout(() => {
          navigate('/login', {
            state: {
              message: t('resetPassword.success.login_message')
            }
          });
        }, 1500);
      } else {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];

          setError(
            Array.isArray(firstError)
              ? String(firstError[0])
              : t('resetPassword.errors.failed')
          );
        } else {
          setError(data.message || t('resetPassword.errors.failed'));
        }
      }
    } catch {
      setError(t('resetPassword.errors.connection'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-gray-50">
      <div className="w-full lg:w-1/2 bg-[#2E3A4D] flex flex-col justify-center items-center text-center text-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-sm w-full">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">GOAT</h1>

          <p className="text-lg sm:text-xl mb-4 leading-snug">
            {t('resetPassword.left.title')}
          </p>

          <div className="w-16 h-1 bg-white mx-auto mb-4"></div>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            {t('resetPassword.left.subtitle')}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full max-w-[640px]">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {t('resetPassword.title')}
            </h2>

            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              {t('resetPassword.subtitle')}
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-green-700 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm sm:text-base text-gray-800 mb-2">
                {t('resetPassword.fields.email')}
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('resetPassword.placeholders.email')}
                className="w-full px-4 sm:px-5 py-3 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base text-gray-800 mb-2">
                {t('resetPassword.fields.new_password')}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t('resetPassword.placeholders.new_password')}
                  className="w-full px-4 sm:px-5 py-3 pr-12 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 text-sm"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  👁
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base text-gray-800 mb-2">
                {t('resetPassword.fields.confirm_password')}
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder={t('resetPassword.placeholders.confirm_password')}
                  className="w-full px-4 sm:px-5 py-3 pr-12 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 text-sm"
                  aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                >
                  👁
                </button>
              </div>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 sm:px-5 py-3 sm:py-4 text-blue-700 text-xs sm:text-sm leading-relaxed">
              {t('resetPassword.password_hint')}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-semibold text-sm sm:text-base disabled:opacity-50"
            >
              {loading
                ? t('resetPassword.loading')
                : t('resetPassword.button')}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 transition font-semibold text-sm sm:text-base"
            >
              {t('resetPassword.back_login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};