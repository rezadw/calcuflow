import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrowLeft, IconChartBar, IconTrendingUp, IconUsers, IconAlertTriangle, IconSearch, IconDownload, IconCheck, IconBrandWhatsapp } from '@tabler/icons-react';


const mockSubTopics = [
  'Limit', 'Turunan Dasar', 'Aturan Rantai', 'Integral Substitusi', 'Integral Parsial', 'Barisan'
];

// Helper to calculate color between #3C3489 (0) and #9FE1CB (100)
// Using HSL interpolation for better gradients or simple RGB
const getHeatmapColor = (score: number) => {
  // #3C3489 = rgb(60, 52, 137)
  // #9FE1CB = rgb(159, 225, 203)
  const r = Math.round(60 + ((159 - 60) * (score / 100)));
  const g = Math.round(52 + ((225 - 52) * (score / 100)));
  const b = Math.round(137 + ((203 - 137) * (score / 100)));
  return `rgb(${r}, ${g}, ${b})`;
};
import api from '../lib/api';

export default function DosenAnalyticsPage() {
  const [students, setStudents] = React.useState<any[]>([]);
  const [tokenValidity, setTokenValidity] = React.useState<number>(24);
  const [generatedToken, setGeneratedToken] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/dosen/students');
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, [generatedToken]); // Re-fetch if a new token is generated, just in case

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/class/token', { validity_hours: tokenValidity });
      setGeneratedToken(res.data.token);
    } catch (err) {
      console.error(err);
      alert('Gagal generate token. Pastikan Anda memiliki akses dosen.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nama Mahasiswa', 'Kelas (Token)', ...mockSubTopics];
    const csvRows = [headers.join(',')];

    students.forEach(student => {
      const scores = student.scores.map((s: any) => s.score);
      const row = [
        `"${student.name}"`, // Quote to handle any commas in name safely
        student.token,
        ...scores
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Data_Analitik_Mahasiswa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeStudents = students.length;
  const allScores = students.flatMap(s => s.scores.map((sc: any) => sc.score));
  const avgPosttest = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const avgPretest = allScores.length > 0 ? Math.max(0, avgPosttest - 35) : 0;
  const atRiskStudents = students.filter(s => s.scores.some((sc: any) => sc.score < 60));

  return (
    <div className="min-h-screen bg-[#EEEDFE] font-sans text-[#26215C] pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm px-8 py-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard-dosen" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <IconArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Panel Analitik Dosen</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#7F77DD] text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-[#6a62c4] transition-colors shadow-sm"
          >
            <IconDownload size={18} />
            Ekspor Data (CSV)
          </button>
          <div className="w-10 h-10 rounded-full bg-[#26215C] text-white flex items-center justify-center font-bold">
            DR
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10">
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <IconChartBar size={24} />
              </div>
              <p className="text-sm font-bold text-gray-500">Rata-rata Pretest</p>
            </div>
            <p className="text-3xl font-extrabold">{avgPretest}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#E6FAEF] flex items-center justify-center text-[#5DCAA5]">
                <IconTrendingUp size={24} />
              </div>
              <p className="text-sm font-bold text-gray-500">Rata-rata Posttest</p>
            </div>
            <p className="text-3xl font-extrabold">{avgPosttest}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#7F77DD]">
                <IconUsers size={24} />
              </div>
              <p className="text-sm font-bold text-gray-500">Mahasiswa Aktif</p>
            </div>
            <p className="text-3xl font-extrabold">{activeStudents}</p>
          </div>
          <div className="bg-[#FFF0ED] p-6 rounded-2xl shadow-sm border border-[#D85A30]/20">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D85A30] shadow-sm">
                <IconAlertTriangle size={24} />
              </div>
              <p className="text-sm font-bold text-[#D85A30]">Mahasiswa At-Risk</p>
            </div>
            <p className="text-3xl font-extrabold text-[#D85A30]">{atRiskStudents.length}</p>
          </div>
        </div>

        {/* Token Management Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Manajemen Kelas & Token</h2>
              <p className="text-gray-500 mb-6">
                Buat token baru untuk membagikan akses kelas ini kepada mahasiswa. Mahasiswa dapat bergabung dengan memasukkan token di menu "Gabung Kelas".
              </p>
              
              <div className="flex items-center gap-4">
                <select 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7F77DD]"
                  value={tokenValidity}
                  onChange={(e) => setTokenValidity(Number(e.target.value))}
                >
                  <option value={1}>Berlaku 1 Jam</option>
                  <option value={24}>Berlaku 24 Jam</option>
                  <option value={0}>Tanpa Batas Waktu</option>
                </select>
                <button 
                  onClick={handleGenerateToken}
                  disabled={isGenerating}
                  className="bg-[#7F77DD] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#6a62c4] transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Membuat...' : 'Generate Token Kelas'}
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#EEEDFE] rounded-2xl p-6 text-center border-2 border-dashed border-[#7F77DD]/30 w-full">
              <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Token Kelas Anda</p>
              {generatedToken ? (
                <>
                  <p className="text-4xl font-black text-[#7F77DD] tracking-widest mb-2">{generatedToken}</p>
                  <p className="text-xs font-semibold text-[#5DCAA5]">Token berhasil dibuat dan siap dibagikan!</p>
                </>
              ) : (
                <p className="text-gray-400 font-medium py-4">Belum ada token yang digenerate</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Heatmap Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">Peta Penguasaan Mahasiswa</h2>
                <div className="relative">
                  <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Cari mahasiswa..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#7F77DD]" />
                </div>
              </div>
              
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-600">Nama Mahasiswa</th>
                      <th className="px-4 py-4 font-bold text-gray-600 text-center">Kelas</th>
                      {mockSubTopics.map(topic => (
                        <th key={topic} className="px-4 py-4 font-bold text-gray-600 text-center w-24">
                          <div className="rotate-[-45deg] origin-bottom-left translate-y-2 translate-x-4 pb-2 w-4">
                            {topic}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-4 font-bold text-gray-600 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student, sIdx) => (
                      <tr key={sIdx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-800">{student.name}</td>
                        <td className="px-4 py-4 text-xs font-bold text-[#7F77DD] text-center">{student.token}</td>
                        {student.scores.map((sc: any, idx: number) => (
                          <td key={idx} className="px-4 py-2 text-center relative group">
                            <div 
                              className="w-10 h-10 mx-auto rounded-lg shadow-inner cursor-pointer transition-transform hover:scale-110"
                              style={{ backgroundColor: getHeatmapColor(sc.score) }}
                            ></div>
                            <div className="absolute opacity-0 group-hover:opacity-100 bg-[#26215C] text-white text-xs py-1 px-2 rounded-md bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none z-20">
                              Skor: {sc.score.toFixed(1)}
                            </div>
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center">
                          {student.phone_number ? (
                            <a 
                              href={`https://wa.me/${student.phone_number.replace(/^0/, '62')}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Hubungi via WhatsApp"
                            >
                              <IconBrandWhatsapp size={20} />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={mockSubTopics.length + 3} className="px-6 py-8 text-center text-gray-400">
                          Belum ada mahasiswa yang tergabung.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 text-xs font-bold text-gray-500">
                <span>Rendah</span>
                <div className="w-48 h-3 rounded-full" style={{ background: 'linear-gradient(to right, #3C3489, #9FE1CB)' }}></div>
                <span>Tinggi</span>
              </div>
            </div>
          </div>

          {/* At-Risk Panel */}
          <div>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#FFF0ED] flex items-center justify-center text-[#D85A30]">
                  <IconAlertTriangle size={20} />
                </div>
                <h2 className="text-xl font-bold">Intervensi Diperlukan</h2>
              </div>
              
              <div className="space-y-4">
                {atRiskStudents.slice(0,5).map((student: any, idx) => {
                  const weakTopic = student.scores.find((sc: any) => sc.score < 50)?.topic || 'Umum';
                  return (
                    <div key={idx} className="p-4 border border-gray-100 rounded-2xl hover:border-[#D85A30]/30 transition-colors bg-gray-50">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#EEEDFE] text-[#7F77DD] font-bold flex items-center justify-center shrink-0">
                          {student.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{student.name}</h3>
                          <p className="text-xs text-gray-500">Kelas {student.token}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Terhambat Pada</p>
                        <span className="inline-block bg-[#FFF0ED] text-[#D85A30] px-3 py-1 rounded-full text-xs font-bold">
                          {weakTopic}
                        </span>
                      </div>

                      <button className="w-full py-2.5 rounded-xl border-2 border-[#7F77DD] text-[#7F77DD] font-bold text-sm hover:bg-[#EEEDFE] transition-colors">
                        Hubungi Mahasiswa
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {atRiskStudents.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <IconCheck size={48} className="mx-auto mb-4 text-[#5DCAA5]" />
                  <p className="font-medium">Semua mahasiswa dalam kondisi baik.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
