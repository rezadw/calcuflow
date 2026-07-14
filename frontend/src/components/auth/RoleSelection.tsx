import { GraduationCap, Briefcase } from 'lucide-react';

export type Role = 'mahasiswa' | 'dosen' | null;

interface RoleSelectionProps {
  onSelect: (role: Role) => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pilih Peran Anda</h2>
        <p className="text-slate-500 dark:text-slate-400">Silakan pilih jenis akun untuk melanjutkan pendaftaran.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Card Mahasiswa */}
        <button
          onClick={() => onSelect('mahasiswa')}
          className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="w-20 h-20 mb-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mahasiswa</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Pendaftaran untuk mahasiswa aktif yang ingin menggunakan layanan akademik.
          </p>
        </button>

        {/* Card Dosen */}
        <button
          onClick={() => onSelect('dosen')}
          className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="w-20 h-20 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Briefcase className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Dosen</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Pendaftaran untuk tenaga pengajar dengan akses ke fitur akademik dosen.
          </p>
        </button>
      </div>
    </div>
  );
}
