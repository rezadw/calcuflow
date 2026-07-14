import { useState } from 'react';
import { RoleSelection } from '../components/auth/RoleSelection';
import type { Role } from '../components/auth/RoleSelection';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Register() {
  const [role, setRole] = useState<Role>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 flex flex-col items-center mb-8">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-slate-900 dark:text-white group">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <span>CalcuFlow</span>
        </Link>
      </div>

      <div className="relative z-10 w-full px-4">
        {!role ? (
          <RoleSelection onSelect={setRole} />
        ) : (
          <RegisterForm role={role} onBack={() => setRole(null)} />
        )}
      </div>

      <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
