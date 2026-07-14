import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import {
  IconHome,
  IconChartBar,
  IconUsers,
  IconBooks,
  IconClock,
  IconCheck,
  // IconX
} from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DosenDashboardPage() {
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  
  const [classes, setClasses] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/dosen/classes');
        setClasses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, c) => sum + c.student_count, 0);

  const chartData = classes.map(c => ({
    name: c.token,
    count: c.student_count
  }));

  const navItems = [
    { label: 'Dashboard', path: '/dashboard-dosen', icon: <IconHome size={22} /> },
    { label: 'Analitik', path: '/dosen', icon: <IconChartBar size={22} /> },
  ];

  return (
    <div className="flex h-screen bg-[#EEEDFE] font-sans text-[#26215C]">
      {/* Sidebar - Fixed Left */}
      <aside className="w-64 bg-white shadow-sm flex flex-col h-full border-r border-gray-100 shrink-0">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-[#7F77DD]">CalcuFlow</h1>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dosen Panel</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard-dosen' && location.pathname === '/dosen-home');
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-full font-medium transition-colors ${
                  isActive
                    ? 'bg-[#7F77DD] text-white shadow-md shadow-[#7F77DD]/20'
                    : 'text-gray-500 hover:bg-[#EEEDFE] hover:text-[#7F77DD]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#26215C] to-[#7F77DD] flex items-center justify-center text-white font-bold shrink-0">
              {user ? user.name.substring(0, 2).toUpperCase() : 'DR'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user ? user.name : 'Dr. Budi'}</p>
              <p className="text-xs text-gray-500 truncate">{user ? user.email : 'Dosen Pengampu'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-10 max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <h2 className="text-3xl font-bold mb-2">Dashboard Dosen 📊</h2>
            <p className="text-gray-500 text-lg">Ringkasan aktivitas dan metrik kelas Anda hari ini.</p>
          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#7F77DD]">
                <IconBooks size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Jumlah Kelas Aktif</p>
                <p className="text-2xl font-bold">{totalClasses} Kelas</p>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#E6FAEF] flex items-center justify-center text-[#5DCAA5]">
                <IconUsers size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Mahasiswa</p>
                <p className="text-2xl font-bold">{totalStudents} Orang</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Kehadiran per Kelas Chart */}
            <div>
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-6">Statistik Jumlah Mahasiswa per Kelas (Token)</h3>
                <div className="flex-1 min-h-[300px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#9ca3af', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#9ca3af', fontSize: 12 }} 
                          allowDecimals={false}
                        />
                        <Tooltip 
                          cursor={{ fill: '#EEEDFE' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" name="Jumlah Mahasiswa" fill="#7F77DD" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Belum ada token kelas yang dibuat. Buat di panel Analitik.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
