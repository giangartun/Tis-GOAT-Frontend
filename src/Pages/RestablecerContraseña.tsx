import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const ResetPassword: React.FC = () => {
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
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            token,
            email: form.email,
            // enviamos ambos nombres para evitar mismatch con el backend
            password: form.password,
            password_confirmation: form.password_confirmation,
            contrasena: form.password,
            contrasena_confirmation: form.password_confirmation
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Contraseña actualizada correctamente.');

        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
            }
          });
        }, 1500);
      } else {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : 'No se pudo restablecer la contraseña.');
        } else {
          setError(data.message || 'No se pudo restablecer la contraseña.');
        }
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div className="w-1/2 bg-[#2E3A4D] flex flex-col justify-center items-center text-center text-white px-8">
        <div className="max-w-sm">
          <h1 className="text-4xl font-bold mb-4">GOAT</h1>
          <p className="text-xl mb-4 leading-snug">
            Sistema Generador de Portafolios Digitales
          </p>
          <div className="w-16 h-1 bg-white mx-auto mb-4"></div>
          <p className="text-blue-100 text-base leading-relaxed">
            Accede a tu cuenta y gestiona tu portafolio profesional.
          </p>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-gray-50 px-6 py-8">
        <div className="w-full max-w-[640px]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Restablecer Contraseña
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Ingresa tu nueva contraseña
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base text-gray-800 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ingresa tu correo electrónico"
                className="w-full px-5 py-3 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-base text-gray-800 mb-2">
                Nueva Contraseña
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu nueva contraseña"
                  className="w-full px-5 py-3 pr-12 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  👁
                </button>
              </div>
            </div>

            <div>
              <label className="block text-base text-gray-800 mb-2">
                Confirmar Contraseña
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirma tu nueva contraseña"
                  className="w-full px-5 py-3 pr-12 rounded-md border border-gray-300 bg-[#E5E5E5] text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  👁
                </button>
              </div>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700 text-sm leading-relaxed">
              Tu contraseña debe tener al menos 8 caracteres e incluir letras y números.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-semibold text-base disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 transition font-semibold text-base"
            >
              Volver al inicio de sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};