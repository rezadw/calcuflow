import React, { useEffect, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import {
  IconHome,
  IconBook,
  IconMathFunction,
  IconTrophy,
  IconChartBar,
  IconFlame,
  IconAward,
  IconTrendingUp,
  IconArrowRight,
  IconPlayerPlayFilled,
  IconMessageCircle2,
  IconUsers,
  IconAlertTriangle
} from '@tabler/icons-react';

export default function DashboardPage() {
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const isEnrolled = useAuthStore(state => state.isEnrolled);
  const setEnrolled = useAuthStore(state => state.setEnrolled);
  const hasCompletedPretest = useAuthStore(state => state.hasCompletedPretest);
  const setHasCompletedPretest = useAuthStore(state => state.setHasCompletedPretest);
  const [progress, setProgress] = useState<any[]>([]);
  const [statusLoading, setStatusLoading] = useState(true);

  const [joinToken, setJoinToken] = useState('');
  const [joinStatus, setJoinStatus] = useState<{loading: boolean, error: string | null, success: string | null}>({loading: false, error: null, success: null});

  useEffect(() => {
    const fetchStatusAndProgress = async () => {
      try {
        const statusRes = await api.get('/user/status');
        setEnrolled(statusRes.data.is_enrolled);
        if (statusRes.data.is_enrolled) {
          const res = await api.get('/user/progress');
          setProgress(res.data);
          if (res.data.length > 0) {
            setHasCompletedPretest(true);
          } else {
            setHasCompletedPretest(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatusAndProgress();
  }, [setEnrolled]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinToken) return;
    setJoinStatus({ loading: true, error: null, success: null });
    try {
      const res = await api.post('/class/join', { token: joinToken });
      setJoinStatus({ loading: false, error: null, success: res.data.message });
      setJoinToken('');
      setEnrolled(true); // Unlock features!
    } catch (err: any) {
      setJoinStatus({ loading: false, error: err.response?.data?.detail || 'Terjadi kesalahan', success: null });
    }
  };

  const navItems = [
    { label: 'Beranda', path: '/dashboard', icon: <IconHome size={22} />, roles: ['mahasiswa', 'dosen'] },
    { label: 'CalcuLearn', path: '/modul', icon: <IconBook size={22} />, roles: ['mahasiswa'] },
    { label: 'CalcuMind', path: '/calcumind', icon: <IconMessageCircle2 size={22} />, roles: ['mahasiswa'] },
    { label: 'CalcuSim', path: '/simulasi', icon: <IconMathFunction size={22} />, roles: ['mahasiswa'] },
    { label: 'CalcuQuest', path: '/quest', icon: <IconTrophy size={22} />, roles: ['mahasiswa'] },
    { label: 'Panel Dosen', path: '/dashboard-dosen', icon: <IconChartBar size={22} />, roles: ['dosen'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles.includes(user?.role || 'mahasiswa')) return false;
    // Lock sidebar if not enrolled or hasn't completed pretest
    if (user?.role === 'mahasiswa' && (!isEnrolled || !hasCompletedPretest) && item.path !== '/dashboard') return false;
    return true;
  });

  if (user?.role === 'dosen') {
    return <Navigate to="/dashboard-dosen" replace />;
  }

  return (
    <div className="flex h-screen bg-[#EEEDFE] font-sans text-[#26215C]">
      {/* Sidebar - Fixed Left */}
      <aside className="w-64 bg-white shadow-sm flex flex-col h-full border-r border-gray-100 shrink-0">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-[#7F77DD]">CalcuFlow</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7F77DD] to-[#5DCAA5] flex items-center justify-center text-white font-bold shrink-0">
              {user ? user.name.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user ? user.name : 'Pengguna'}</p>
              <p className="text-xs text-gray-500 truncate">{user ? user.role : 'Role'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-10 max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <h2 className="text-3xl font-bold mb-2">Halo, {user?.name.split(' ')[0] || 'Kamu'}! 👋</h2>
            <p className="text-gray-500 text-lg">
              {user?.role === 'dosen' ? 'Siap mengelola kelas kalkulusmu hari ini?' : 'Siap untuk melanjutkan petualangan kalkulusmu hari ini?'}
            </p>
          </header>

          {statusLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 font-medium">Memeriksa status akun...</p>
            </div>
          ) : !isEnrolled && user?.role === 'mahasiswa' ? (
            <div className="max-w-2xl mx-auto text-center mt-10">
              <div className="w-24 h-24 bg-[#EEEDFE] rounded-full flex items-center justify-center text-[#7F77DD] mx-auto mb-6">
                <IconUsers size={48} />
              </div>
              <h2 className="text-3xl font-extrabold mb-4">Gabung Kelas Dulu Yuk! 🚀</h2>
              <p className="text-gray-500 text-lg mb-8">
                Kamu perlu bergabung ke kelas dosenmu untuk membuka semua fitur pembelajaran seperti Modul, Simulasi, dan Quest.
              </p>
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 max-w-md mx-auto relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6FAEF] rounded-full -translate-y-1/2 translate-x-1/4 opacity-50 z-0"></div>
                
                <form onSubmit={handleJoinClass} className="relative z-10 flex flex-col gap-4">
                  <input 
                    type="text" 
                    placeholder="Contoh Token: CALCU-XY92" 
                    value={joinToken}
                    onChange={(e) => setJoinToken(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50 border border-gray-200 rounded-full px-6 py-4 text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7F77DD] uppercase"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={joinStatus.loading}
                    className="w-full bg-[#7F77DD] text-white px-6 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                  >
                    {joinStatus.loading ? 'Memproses...' : 'Gabung Kelas Sekarang'}
                  </button>
                </form>
                {joinStatus.error && <p className="text-red-500 text-sm mt-4 font-semibold relative z-10">{joinStatus.error}</p>}
                {joinStatus.success && <p className="text-[#5DCAA5] text-sm mt-4 font-semibold relative z-10">{joinStatus.success}</p>}
              </div>
            </div>
          ) : (
            <>
              {/* Calculate dynamic metrics */}
              {(() => {
                const totalMastery = progress.reduce((acc, curr) => acc + curr.mastery_level, 0);
                const avgMastery = progress.length > 0 ? Math.round(totalMastery / progress.length) : 0;
                
                // Find next topic to learn (lowest mastery)
                const nextTopic = progress.length > 0 
                  ? progress.reduce((prev, curr) => prev.mastery_level < curr.mastery_level ? prev : curr)
                  : { topic_name: 'Turunan Fungsi Aljabar', completed_items: 0, total_items: 10, mastery_level: 0 };
                  
                const badgeCount = Math.max(0, Math.floor(avgMastery / 20));
                const streakDays = progress.length > 0 ? 1 : 0; // Realistic for new user
                const progressPercentage = nextTopic.total_items > 0 ? Math.round((nextTopic.completed_items / nextTopic.total_items) * 100) : 0;

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#7F77DD]">
                          <IconTrendingUp size={28} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium mb-1">Progress Rata-rata</p>
                          <p className="text-2xl font-bold">{avgMastery}%</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-[#E6FAEF] flex items-center justify-center text-[#5DCAA5]">
                          <IconAward size={28} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium mb-1">Topik Diselesaikan</p>
                          <p className="text-2xl font-bold">{progress.filter(p => p.mastery_level >= 80).length}</p>
                        </div>
                      </div>
                    </div>

                    {!hasCompletedPretest && user?.role === 'mahasiswa' ? (
                      <div className="bg-gradient-to-br from-[#7F77DD] to-[#5DCAA5] rounded-[2rem] p-10 shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-x-1/4 -translate-y-1/4"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-2xl opacity-10 -translate-x-1/4 translate-y-1/4"></div>
                        
                        <div className="relative z-10 max-w-2xl">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm mb-6">
                            <IconAlertTriangle size={32} className="text-white" />
                          </div>
                          <h3 className="text-3xl font-extrabold mb-4">Uji Kemampuan Awalmu! 🎯</h3>
                          <p className="text-lg text-white/90 mb-8 leading-relaxed">
                            Kami melihat kamu adalah pengguna baru di kelas ini. Untuk memberikan kurikulum dan rekomendasi latihan yang **100% dipersonalisasi** sesuai dengan kemampuanmu, silakan ikuti Diagnostic Pre-Test singkat ini.
                          </p>
                          <Link to="/pretest" className="inline-flex items-center justify-center gap-2 bg-white text-[#7F77DD] hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-md">
                            <IconPlayerPlayFilled size={20} />
                            Mulai Pre-Test Sekarang
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Continue Learning Card */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-bold">Lanjutkan Belajar</h3>
                            <Link to="/modul" className="text-[#7F77DD] text-sm font-medium hover:underline flex items-center gap-1">
                              Lihat Semua <IconArrowRight size={16} />
                            </Link>
                          </div>
                          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEEDFE] rounded-full -translate-y-1/2 translate-x-1/4 opacity-50 z-0"></div>
                            
                            <div className="relative z-10">
                              <div className="inline-block px-3 py-1 bg-[#EEEDFE] text-[#7F77DD] text-xs font-bold rounded-full mb-4">
                                Materi Selanjutnya
                              </div>
                              <h4 className="text-2xl font-bold mb-2">{nextTopic.topic_name}</h4>
                              <p className="text-gray-500 mb-8 max-w-md">
                                Lanjutkan pembelajaranmu untuk menguasai materi ini berdasarkan hasil diagnosa terakhirmu.
                              </p>
                              
                              <div className="mb-6">
                                <div className="flex justify-between text-sm font-medium mb-2">
                                  <span className="text-[#7F77DD]">Progress {nextTopic.completed_items}/{nextTopic.total_items}</span>
                                  <span className="text-gray-500">{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                  <div className="bg-[#7F77DD] h-3 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                              </div>

                              <Link to="/modul" className="inline-block bg-[#7F77DD] hover:bg-opacity-90 text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 w-fit">
                                <IconPlayerPlayFilled size={18} />
                                Lanjutkan Materi
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Today's Recommendation & Badges */}
                        <div className="space-y-8">
                          {/* Recommendation */}
                          <div>
                            <h3 className="text-xl font-bold mb-5">Rekomendasi Hari Ini</h3>
                            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                              <div className="w-12 h-12 bg-[#E6FAEF] rounded-2xl flex items-center justify-center text-[#5DCAA5] mb-4">
                                <IconMathFunction size={24} />
                              </div>
                              <h4 className="font-bold text-lg mb-2">Latihan Limit Fungsi</h4>
                              <p className="text-gray-500 text-sm mb-5">
                                Kuasi kembali materi limit dengan 5 soal latihan yang disesuaikan untukmu.
                              </p>
                              <Link to="/quest" className="block text-center w-full bg-white border-2 border-[#5DCAA5] text-[#5DCAA5] hover:bg-[#E6FAEF] py-2.5 rounded-full font-semibold transition-colors">
                                Mulai Latihan
                              </Link>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
