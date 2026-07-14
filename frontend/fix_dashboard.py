import sys

with open('src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = """            <>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
                          <p className="text-sm text-gray-500 font-medium mb-1">Total Badge</p>
                          <p className="text-2xl font-bold">{badgeCount}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                          <IconFlame size={28} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium mb-1">Streak Harian</p>
                          <p className="text-2xl font-bold">{streakDays} Hari</p>
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

                          {/* Badges */}
                          <div>
                            <h3 className="text-xl font-bold mb-5">Badge Terbaru</h3>
                            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex gap-4 overflow-x-auto">
                              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                                <div className="w-16 h-16 rounded-full bg-yellow-100 border-4 border-yellow-300 flex items-center justify-center text-yellow-600 shadow-sm">
                                  <IconAward size={32} />
                                </div>
                                <span className="text-xs font-bold text-center">First Blood</span>
                              </div>
                              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                                <div className="w-16 h-16 rounded-full bg-blue-100 border-4 border-blue-300 flex items-center justify-center text-blue-600 shadow-sm">
                                  <IconTrendingUp size={32} />
                                </div>
                                <span className="text-xs font-bold text-center">Fast Learner</span>
                              </div>
                              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                                <div className="w-16 h-16 rounded-full bg-purple-100 border-4 border-purple-300 flex items-center justify-center text-purple-600 shadow-sm">
                                  <IconFlame size={32} />
                                </div>
                                <span className="text-xs font-bold text-center">3-Day Streak</span>
                              </div>
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
"""

index = -1
for i, line in enumerate(lines):
    if ") : (" in line and "joinStatus" not in line and "joinStatus" not in lines[i-1]:
        # we want the one after joinStatus block
        if "}" in lines[i-1] or "</div>" in lines[i-1] or "</div>" in lines[i-2]:
            index = i
            break

print("Found index at", index)
if index != -1:
    with open('src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines[:index+1])
        f.write(new_content)
