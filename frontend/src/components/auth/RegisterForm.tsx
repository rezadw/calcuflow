import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Role } from './RoleSelection';
import api from '../../lib/api';

// Validation Schemas
const baseSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  phoneNumber: z.string().min(10, { message: "Nomor HP wajib diisi (minimal 10 angka)" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  confirmPassword: z.string()
});

const mahasiswaSchema = baseSchema.extend({
  nim: z.string().min(5, { message: "NIM wajib diisi" }),
  programStudi: z.string().min(1, { message: "Program studi wajib diisi" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

const dosenSchema = baseSchema.extend({
  nidn: z.string().min(5, { message: "NIDN wajib diisi" }),
  fakultas: z.string().min(1, { message: "Fakultas wajib diisi" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

// type DosenFormData = z.infer<typeof dosenSchema>;

interface RegisterFormProps {
  role: Role;
  onBack: () => void;
}

export function RegisterForm({ role, onBack }: RegisterFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const isMahasiswa = role === 'mahasiswa';
  const schema = isMahasiswa ? mahasiswaSchema : dosenSchema;
  
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        email: data.email,
        name: data.fullName,
        role: role,
        phone_number: data.phoneNumber,
        password: data.password
      };
      await api.post('/auth/register', payload);
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Gagal mendaftar. Email mungkin sudah digunakan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in slide-in-from-right-4 fade-in duration-300 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Daftar sebagai {isMahasiswa ? 'Mahasiswa' : 'Dosen'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Lengkapi data diri Anda di bawah ini untuk membuat akun.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Umum */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
          <input 
            {...register('fullName')} 
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Misal: Budi Santoso"
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{(errors.fullName as any).message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <input 
            type="email"
            {...register('email')} 
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="budi@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{(errors.email as any).message}</p>}
        </div>

        {/* Khusus Mahasiswa */}
        {isMahasiswa && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">NIM</label>
              <input 
                {...register('nim')} 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="21000..."
              />
              {errors.nim && <p className="text-red-500 text-xs mt-1">{(errors.nim as any).message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program Studi</label>
              <input 
                {...register('programStudi')} 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Teknik Informatika"
              />
              {errors.programStudi && <p className="text-red-500 text-xs mt-1">{(errors.programStudi as any).message}</p>}
            </div>
          </div>
        )}

        {/* Khusus Dosen */}
        {!isMahasiswa && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">NIDN</label>
                <input 
                  {...register('nidn')} 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="001122..."
                />
                {errors.nidn && <p className="text-red-500 text-xs mt-1">{(errors.nidn as any).message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fakultas</label>
                <input 
                  {...register('fakultas')} 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Fasilkom"
                />
                {errors.fakultas && <p className="text-red-500 text-xs mt-1">{(errors.fakultas as any).message}</p>}
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor HP / WhatsApp</label>
          <input 
            {...register('phoneNumber')} 
            type="tel"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="081234567890"
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{(errors.phoneNumber as any).message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input 
              type="password"
              {...register('password')} 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{(errors.password as any).message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Konfirmasi</label>
            <input 
              type="password"
              {...register('confirmPassword')} 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{(errors.confirmPassword as any).message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full mt-6 py-3 rounded-lg text-white font-medium flex items-center justify-center transition-all ${
            isMahasiswa 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' 
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
          } shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buat Akun'}
        </button>
      </form>
    </div>
  );
}
