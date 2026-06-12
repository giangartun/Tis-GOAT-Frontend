import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface VerificarEmailProps {}

export const VerificarEmail: React.FC<VerificarEmailProps> = () => {
  const { t } = useTranslation();

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verificarEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t('verifyEmail.errors.invalid_token'));
        return;
      }

      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + '/api/usuario/verificar-email/' + token,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json'
            }
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || t('verifyEmail.success.message'));
        } else {
          setStatus('error');
          setMessage(data.message || t('verifyEmail.errors.verify_failed'));
        }
      } catch {
        setStatus('error');
        setMessage(t('verifyEmail.errors.connection'));
      }
    };

    verificarEmail();
  }, [token, t]);

  const handleGoToLogin = () => {
    navigate('/login', {
      state: {
        message:
          status === 'success'
            ? t('verifyEmail.success.login_message')
            : t('verifyEmail.errors.register_again')
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#2E3A4D]">GOAT</h1>

            <p className="text-gray-500 text-sm mt-1">
              {t('verifyEmail.system_name')}
            </p>
          </div>

          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>

              <p className="text-gray-600">
                {t('verifyEmail.loading.title')}
              </p>

              <p className="text-gray-400 text-sm mt-2">
                {t('verifyEmail.loading.subtitle')}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-green-600 mb-2">
                {t('verifyEmail.success.title')}
              </h2>

              <p className="text-gray-600 mb-4">{message}</p>

              <button
                onClick={handleGoToLogin}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
              >
                {t('verifyEmail.success.button')}
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-red-600 mb-2">
                {t('verifyEmail.error.title')}
              </h2>

              <p className="text-gray-600 mb-4">{message}</p>

              <button
                onClick={handleGoToLogin}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition cursor-pointer"
              >
                {t('verifyEmail.error.button')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};