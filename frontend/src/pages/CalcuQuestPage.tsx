import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { IconArrowLeft, IconCheck, IconLock, IconStar, IconFlame, IconTrophy, IconBolt, IconAward, IconX, IconChevronRight } from '@tabler/icons-react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const initialMockChapters = [
  { id: 1, title: 'Limit', status: 'completed', score: 95, date: '12 Okt 2023' },
  { id: 2, title: 'Turunan', status: 'completed', score: 88, date: '15 Okt 2023' },
  { id: 3, title: 'Integral', status: 'completed', score: 92, date: '20 Okt 2023' },
  { id: 4, title: 'Barisan Deret', status: 'active', score: null, date: null },
  { id: 5, title: 'Fungsi Multivariabel', status: 'locked', score: null, date: null },
];

const mockBadges = [
  { id: 1, title: 'Master of Limits', icon: IconStar, earned: true, criteria: 'Lulus kuis Limit dengan skor 100' },
  { id: 2, title: 'Fast Learner', icon: IconBolt, earned: true, criteria: 'Menyelesaikan 3 CalcuLearn dalam 1 hari' },
  { id: 3, title: '3-Day Streak', icon: IconFlame, earned: true, criteria: 'Belajar 3 hari berturut-turut' },
  { id: 4, title: 'Integral Genius', icon: IconAward, earned: false, criteria: 'Lulus kuis Integral dengan skor 100' },
  { id: 5, title: 'Flawless Victory', icon: IconTrophy, earned: false, criteria: 'Lulus Pretest tanpa salah' },
  { id: 6, title: '7-Day Streak', icon: IconFlame, earned: false, criteria: 'Belajar 7 hari berturut-turut' },
  { id: 7, title: 'Curious Mind', icon: IconStar, earned: false, criteria: 'Bertanya pada CalcuMind 10 kali' },
  { id: 8, title: 'Calculus God', icon: IconTrophy, earned: false, criteria: 'Menyelesaikan seluruh CalcuQuest' },
];

const mockDrillQuestions = [
  {
    id: 1,
    question: "Tentukan turunan pertama dari fungsi $f(x) = 4x^3 - 2x^2 + x - 5$",
    options: [
      { id: 'a', text: "$12x^2 - 4x + 1$" },
      { id: 'b', text: "$12x^2 - 4x$" },
      { id: 'c', text: "$4x^2 - 2x + 1$" },
      { id: 'd', text: "$12x^3 - 4x^2 + x$" }
    ],
    correctOption: 'a'
  },
  {
    id: 2,
    question: "Jika $f(x) = \\sin(2x)$, maka $f'(x) = ...$",
    options: [
      { id: 'a', text: "$\\cos(2x)$" },
      { id: 'b', text: "$2\\cos(2x)$" },
      { id: 'c', text: "$-\\cos(2x)$" },
      { id: 'd', text: "$-2\\cos(2x)$" }
    ],
    correctOption: 'b'
  },
  {
    id: 3,
    question: "Tentukan hasil dari $\\int 2x dx$",
    options: [
      { id: 'a', text: "$x^2 + C$" },
      { id: 'b', text: "$2x^2 + C$" },
      { id: 'c', text: "$\\frac{1}{2}x^2 + C$" },
      { id: 'd', text: "$x + C$" }
    ],
    correctOption: 'a'
  }
];

const renderKaTeX = (text: string) => {
  if (typeof text !== 'string') return text;
  const parts = text.split('$');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      try {
        return <InlineMath key={index} math={part} errorColor={'#cc0000'} />;
      } catch (e) {
        return <span key={index} className="text-red-500">{part}</span>;
      }
    }
    return <span key={index}>{part}</span>;
  });
};

export default function CalcuQuestPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  // const isEnrolled = useAuthStore(state => state.isEnrolled);
  const setEnrolled = useAuthStore(state => state.setEnrolled);
  const hasCompletedPretest = useAuthStore(state => state.hasCompletedPretest);

  const [chapters, setChapters] = useState(initialMockChapters);
  const [badges, setBadges] = useState(mockBadges);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLevel, setUserLevel] = useState("Level 1: Novice");

  const fetchProgress = async () => {
    try {
      const res = await api.get('/user/progress');
      const progData = res.data;
      
      const topics = ['Limit', 'Turunan', 'Integral', 'Aljabar', 'Trigonometri', 'Fungsi'];
      let foundActive = false;
      const newChapters = topics.map((topic, idx) => {
        const p = progData.find((d: any) => d.topic_name === topic);
        let status = 'locked';
        let score = null;
        let date = null;
        
        if (p && p.mastery_level >= 50) { // Set threshold to 50 for completion
          status = 'completed';
          score = p.mastery_level;
          date = p.last_updated ? new Date(p.last_updated).toLocaleDateString('id-ID') : 'Hari ini';
        } else if (!foundActive) {
          status = 'active';
          foundActive = true;
          if (p) score = p.mastery_level;
        }
        
        return { id: idx + 1, title: topic, status, score, date };
      });
      setChapters(newChapters);

      const computedTotalScore = Math.round(newChapters.reduce((sum, ch) => sum + (ch.score || 0), 0) * 10);
      setTotalPoints(computedTotalScore);
      
      let levelText = "Level 1: Novice";
      if (computedTotalScore > 2000) levelText = "Level 5: Scholar";
      else if (computedTotalScore > 1000) levelText = "Level 4: Explorer";
      else if (computedTotalScore > 500) levelText = "Level 3: Apprentice";
      else if (computedTotalScore > 100) levelText = "Level 2: Beginner";
      
      setUserLevel(levelText);

      const limitScore = progData.find((d: any) => d.topic_name === 'Limit')?.mastery_level || 0;
      const integralScore = progData.find((d: any) => d.topic_name === 'Integral')?.mastery_level || 0;
      
      setBadges(prev => prev.map(b => {
        if (b.title === 'Master of Limits' && limitScore >= 100) return { ...b, earned: true };
        if (b.title === 'Integral Genius' && integralScore >= 100) return { ...b, earned: true };
        return b;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!hasCompletedPretest && user?.role === 'mahasiswa') {
      navigate('/dashboard');
      return;
    }
    
    const checkStatus = async () => {
      try {
        const res = await api.get('/user/status');
        setEnrolled(res.data.is_enrolled);
        if (!res.data.is_enrolled && res.data.role !== 'dosen') {
          navigate('/dashboard');
        } else {
          fetchProgress();
        }
      } catch (err) {
        navigate('/dashboard');
      }
    };
    checkStatus();
  }, [navigate, setEnrolled, hasCompletedPretest, user]);

  // const [activeTab, setActiveTab] = useState<'journey' | 'drill' | 'badges'>('journey');
  const [activePopover, setActivePopover] = useState<number | null>(null);
  
  // Drill Modal State
  const [isDrillOpen, setIsDrillOpen] = useState(false);
  const [activeDrillNode, setActiveDrillNode] = useState<number | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [drillFinished, setDrillFinished] = useState(false);

  const handleNodeClick = (chapter: any) => {
    if (chapter.status === 'completed') {
      setActivePopover(activePopover === chapter.id ? null : chapter.id);
    } else if (chapter.status === 'active') {
      // Start Drill
      setActiveDrillNode(chapter.id);
      setIsDrillOpen(true);
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setScore(0);
      setDrillFinished(false);
      setActivePopover(null);
    }
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedOption === mockDrillQuestions[currentQuestionIdx].correctOption;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentQuestionIdx < mockDrillQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOption(null);
    } else {
      // Finish Drill
      setDrillFinished(true);
      const finalScore = Math.round((newScore / mockDrillQuestions.length) * 100);
      
      if (activeDrillNode) {
        const topicName = chapters.find(c => c.id === activeDrillNode)?.title || '';
        api.post('/quiz/submit', {
          submodule_id: activeDrillNode,
          score: finalScore,
          topic_name: topicName
        }).then(() => {
          fetchProgress();
        }).catch(err => console.error("Error submitting quiz", err));
      }
    }
  };

  const closeDrill = () => {
    setIsDrillOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#EEEDFE] font-sans text-[#26215C] pb-20 relative">
      {/* Top Stats Bar */}
      <div className="bg-white shadow-sm px-8 py-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <IconArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">CalcuQuest</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Poin</p>
            <p className="font-extrabold text-[#26215C]">{totalPoints} pts</p>
          </div>
          <div className="bg-[#7F77DD] text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2">
            <IconStar size={16} fill="currentColor" />
            {userLevel}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pt-12">
        {/* Quest Path */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-16 text-center">Jalur Petualangan Kalkulus</h2>
          
          <div className="relative w-full overflow-x-auto pb-16 pt-36 px-4 scrollbar-hide">
            
            <div className="relative flex items-center justify-between min-w-max gap-16 mx-auto px-8">
              {/* Dashed Line moved inside scroll container */}
              <div className="absolute top-1/2 left-8 right-8 h-0.5 border-t-4 border-dashed border-[#D3D1C7] -z-10 translate-y-[-2px]"></div>
              
              {chapters.map((chapter) => (
                <div key={chapter.id} className="relative flex flex-col items-center group">
                  
                  {/* Node Button */}
                  <button 
                    onClick={() => handleNodeClick(chapter)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all z-10 relative
                      ${chapter.status === 'completed' ? 'bg-[#7F77DD] text-white hover:scale-110' : 
                        chapter.status === 'active' ? 'bg-[#5DCAA5] text-white scale-110 cursor-pointer' : 
                        'bg-[#D3D1C7] text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {chapter.status === 'active' && (
                      <span className="absolute inset-0 rounded-full border-4 border-[#5DCAA5] animate-ping opacity-75"></span>
                    )}
                    
                    {chapter.status === 'completed' && <IconCheck stroke={3} size={28} />}
                    {chapter.status === 'active' && <IconStar fill="currentColor" size={28} />}
                    {chapter.status === 'locked' && <IconLock size={24} />}
                  </button>
                  
                  <span className={`mt-4 font-bold text-sm whitespace-nowrap ${chapter.status === 'active' ? 'text-[#5DCAA5]' : 'text-gray-500'}`}>
                    {chapter.title}
                  </span>

                  {/* Popover */}
                  {activePopover === chapter.id && chapter.status === 'completed' && (
                    <div className="absolute -top-32 bg-white p-4 rounded-xl shadow-xl border border-gray-100 text-center min-w-[140px] z-20 animate-in fade-in zoom-in duration-200">
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-gray-100"></div>
                      <p className="text-xs text-gray-400 font-semibold mb-1">Skor Tertinggi</p>
                      <p className="text-xl font-bold text-[#7F77DD] mb-2">{chapter.score}</p>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDrillNode(chapter.id);
                          setIsDrillOpen(true);
                          setCurrentQuestionIdx(0);
                          setSelectedOption(null);
                          setScore(0);
                          setDrillFinished(false);
                          setActivePopover(null);
                        }}
                        className="bg-[#EEEDFE] text-[#7F77DD] hover:bg-[#7F77DD] hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors w-full"
                      >
                        Ulangi Latihan
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Badge Collection */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Koleksi Badge</h2>
            <span className="bg-white px-4 py-1.5 rounded-full text-sm font-bold text-gray-500 shadow-sm border border-gray-100">
              3 / 8 Terkumpul
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {badges.map(badge => {
              const Icon = badge.icon;
              return (
                <div key={badge.id} className="group relative bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:border-[#7F77DD]">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 relative ${
                    badge.earned ? 'bg-[#EEEDFE] text-[#7F77DD]' : 'bg-gray-100 text-gray-300'
                  }`}>
                    <Icon size={40} stroke={badge.earned ? 2 : 1.5} fill={badge.earned ? 'currentColor' : 'none'} />
                    {!badge.earned && (
                      <div className="absolute -bottom-2 -right-2 bg-gray-400 text-white p-1.5 rounded-full border-2 border-white">
                        <IconLock size={14} stroke={3} />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-bold leading-tight ${badge.earned ? 'text-[#26215C]' : 'text-gray-400'}`}>
                    {badge.title}
                  </h3>

                  {/* Tooltip on hover */}
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-full left-1/2 -translate-x-1/2 mb-4 w-[200px] bg-[#26215C] text-white text-xs p-3 rounded-xl pointer-events-none z-20 text-center shadow-lg">
                    {badge.criteria}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#26215C] rotate-45"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Drill Pop-up Overlay */}
      {isDrillOpen && (
        <div className="fixed inset-0 bg-[#26215C]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-xl text-[#26215C]">Drill CalcuQuest</h3>
                <p className="text-gray-500 text-sm">
                  {drillFinished ? 'Selesai!' : `Soal ${currentQuestionIdx + 1} dari ${mockDrillQuestions.length}`}
                </p>
              </div>
              <button onClick={closeDrill} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <IconX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
              {!drillFinished ? (
                <div className="animate-in slide-in-from-right-8 fade-in duration-300" key={currentQuestionIdx}>
                  <h4 className="text-xl font-bold mb-8 leading-relaxed">
                    {renderKaTeX(mockDrillQuestions[currentQuestionIdx].question)}
                  </h4>
                  
                  <div className="space-y-4">
                    {mockDrillQuestions[currentQuestionIdx].options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt.id)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                          selectedOption === opt.id 
                            ? 'border-[#5DCAA5] bg-[#E6FAEF] text-[#5DCAA5]' 
                            : 'border-gray-100 hover:border-[#7F77DD] hover:bg-[#EEEDFE]'
                        }`}
                      >
                        <span className="font-medium text-lg">{renderKaTeX(opt.text)}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === opt.id ? 'border-[#5DCAA5]' : 'border-gray-300'
                        }`}>
                          {selectedOption === opt.id && <div className="w-3 h-3 bg-[#5DCAA5] rounded-full"></div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 animate-in zoom-in duration-300">
                  <div className="w-24 h-24 bg-[#E6FAEF] rounded-full flex items-center justify-center text-[#5DCAA5] mx-auto mb-6">
                    <IconTrophy size={48} />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">CalcuQuest Selesai!</h3>
                  <p className="text-gray-500 mb-8">
                    Kamu menjawab benar {score} dari {mockDrillQuestions.length} soal. Node petualangan berikutnya telah terbuka!
                  </p>
                  <button 
                    onClick={closeDrill}
                    className="bg-[#7F77DD] hover:bg-opacity-90 text-white px-8 py-3.5 rounded-full font-bold text-lg transition-colors w-full sm:w-auto"
                  >
                    Kembali ke Peta
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!drillFinished && (
              <div className="bg-gray-50 px-8 py-5 flex justify-end border-t border-gray-100">
                <button
                  onClick={handleNextQuestion}
                  disabled={!selectedOption}
                  className="bg-[#7F77DD] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 text-white px-8 py-3 rounded-full font-bold transition-colors flex items-center gap-2"
                >
                  {currentQuestionIdx === mockDrillQuestions.length - 1 ? 'Selesai' : 'Lanjut'}
                  <IconChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
