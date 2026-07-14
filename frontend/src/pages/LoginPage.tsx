import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email atau NIM wajib diisi';
    }
    if (!password || password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData);
      const token = res.data.access_token;
      
      // Fetch user profile
      const userRes = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      
      setAuth(token, userRes.data);
      if (userRes.data.role === 'dosen') {
        navigate('/dashboard-dosen');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setApiError(err.response?.data?.detail || 'Gagal masuk. Periksa kembali email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEEDFE] p-4 font-sans text-gray-800">
      <div className="bg-white rounded-[2rem] shadow-sm w-full max-w-md p-10">
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#26215C' }}>
          Masuk ke CalcuFlow
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Silakan masukkan kredensial Anda
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Email / NIM"
              className={`w-full px-6 py-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#7F77DD] bg-gray-50 ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1 ml-4">{errors.email}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={`w-full px-6 py-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#7F77DD] bg-gray-50 ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1 ml-4">{errors.password}</p>}
          </div>

          {apiError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm border border-red-100 text-center">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 rounded-full text-white font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#7F77DD' }}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>


        </form>

        <p className="text-center mt-8 text-gray-500">
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: '#7F77DD' }} className="font-semibold hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
