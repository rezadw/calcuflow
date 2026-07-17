import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { mockModuleData } from './mockModuleData';
import type { Chapter, SubChapter, QuizQuestion } from './mockModuleData';
import { IconChevronDown, IconChevronRight, IconCheck, IconX, IconMessageCircle2, IconArrowLeft, IconListNumbers, IconBulb, IconMathFunction } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

export default function ModulePage() {
  const navigate = useNavigate();
  // const user = useAuthStore(state => state.user);
  // const isEnrolled = useAuthStore(state => state.isEnrolled);
  const setEnrolled = useAuthStore(state => state.setEnrolled);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/user/status');
        setEnrolled(res.data.is_enrolled);
        if (!res.data.is_enrolled && res.data.role !== 'dosen') {
          navigate('/dashboard');
        }
      } catch (err) {
        navigate('/dashboard');
      }
    };
    checkStatus();
  }, [navigate, setEnrolled]);

  const [activeChapterId, setActiveChapterId] = useState<string>(mockModuleData[0].id);
  const [activeSubChapter, setActiveSubChapter] = useState<SubChapter>(mockModuleData[0].subChapters[0]);
  
  // Quiz states
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  // Render KaTeX for formula block
  useEffect(() => {
    const formulaContainer = document.getElementById('formula-container');
    if (formulaContainer && activeSubChapter.formula) {
      katex.render(activeSubChapter.formula, formulaContainer, {
        displayMode: true,
        throwOnError: false,
      });
    }
  }, [activeSubChapter]);

  const handleSubChapterSelect = (chapterId: string, sub: SubChapter) => {
    setActiveChapterId(chapterId);
    setActiveSubChapter(sub);
    setIsQuizActive(false);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleQuizSubmit = () => {
    let correctCount = 0;
    activeSubChapter.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    const score = (correctCount / activeSubChapter.quiz.length) * 100;
    setQuizResult({
      score,
      passed: score >= 70
    });
  };

  return (
    <div className="flex h-screen bg-[#EEEDFE] font-sans text-[#26215C]">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-sm flex flex-col h-full border-r border-gray-100 shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 bg-white z-10">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <IconArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-[#7F77DD]">CalcuLearn</h1>
        </div>

        <nav className="p-4 space-y-4">
          {mockModuleData.map(chapter => (
            <div key={chapter.id} className="space-y-2">
              <button 
                onClick={() => setActiveChapterId(activeChapterId === chapter.id ? '' : chapter.id)}
                className="w-full flex items-center justify-between font-bold p-2 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <span>{chapter.title}</span>
                {activeChapterId === chapter.id ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
              </button>
              
              {activeChapterId === chapter.id && (
                <div className="pl-4 space-y-1">
                  {chapter.subChapters.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubChapterSelect(chapter.id, sub)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeSubChapter.id === sub.id
                          ? 'bg-[#7F77DD] text-white shadow-md'
                          : 'text-gray-600 hover:bg-[#EEEDFE] hover:text-[#7F77DD]'
                      }`}
                    >
                      {sub.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-10 max-w-4xl mx-auto pb-32">
          
          <header className="mb-10">
            <span className="text-[#7F77DD] font-bold text-sm tracking-wider uppercase mb-2 block">
              {mockModuleData.find(c => c.id === activeChapterId)?.title}
            </span>
            <h2 className="text-4xl font-extrabold">{activeSubChapter.title}</h2>
          </header>

          <div className="space-y-8">
            {/* Concept Block */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4 text-[#7F77DD]">
                <IconBulb size={28} />
                <h3 className="text-2xl font-bold">Konsep Dasar</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {activeSubChapter.concept}
              </p>
            </section>

            {/* Formula Block */}
            <section className="bg-[#E6FAEF] p-8 rounded-[2rem] shadow-sm border border-[#5DCAA5]/20">
              <div className="flex items-center gap-3 mb-6 text-[#5DCAA5]">
                <IconMathFunction size={28} />
                <h3 className="text-2xl font-bold">Rumus Utama</h3>
              </div>
              <div className="bg-white py-8 px-4 rounded-2xl shadow-inner overflow-x-auto text-center">
                <div id="formula-container" className="text-xl md:text-2xl"></div>
              </div>
            </section>

            {/* Worked Example Block */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 text-[#7F77DD]">
                <IconListNumbers size={28} />
                <h3 className="text-2xl font-bold">Contoh Penyelesaian</h3>
              </div>
              <div className="space-y-4">
                {activeSubChapter.workedExample.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#EEEDFE] text-[#7F77DD] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 text-lg pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Quiz Gate */}
          <div className="mt-16">
            {!isQuizActive && !quizResult ? (
              <div className="bg-gradient-to-br from-[#7F77DD] to-[#5DCAA5] p-10 rounded-[2.5rem] shadow-lg text-white text-center relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">Uji Pemahamanmu</h3>
                  <p className="mb-8 opacity-90 max-w-md mx-auto">Selesaikan quiz singkat untuk membuka sub-bab selanjutnya. Minimal skor kelulusan adalah 70%.</p>
                  <button 
                    onClick={() => setIsQuizActive(true)}
                    className="bg-white text-[#7F77DD] px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    Mulai Quiz
                  </button>
                </div>
              </div>
            ) : isQuizActive && !quizResult ? (
              <div className="bg-white p-8 rounded-[2rem] shadow-md border border-[#7F77DD]">
                <h3 className="text-2xl font-bold mb-8 text-[#7F77DD]">Quiz: {activeSubChapter.title}</h3>
                
                <div className="space-y-8 mb-10">
                  {activeSubChapter.quiz.map((q, qIndex) => (
                    <div key={q.id} className="p-6 bg-gray-50 rounded-2xl">
                      <div className="font-bold text-lg mb-4 flex items-start gap-2">
                        <span>{qIndex + 1}.</span>
                        <div>
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.question}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {q.options.map(opt => (
                          <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-[#EEEDFE] transition-colors">
                            <input 
                              type="radio" 
                              name={q.id}
                              value={opt}
                              checked={quizAnswers[q.id] === opt}
                              onChange={(e) => setQuizAnswers({...quizAnswers, [q.id]: e.target.value})}
                              className="w-5 h-5 text-[#7F77DD] focus:ring-[#7F77DD] shrink-0"
                            />
                            <span className="font-medium">
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{opt}</ReactMarkdown>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length !== activeSubChapter.quiz.length}
                  className="w-full bg-[#7F77DD] text-white py-4 rounded-full font-bold text-lg disabled:opacity-50 hover:bg-opacity-90 transition-all"
                >
                  Kirim Jawaban
                </button>
              </div>
            ) : quizResult ? (
              <div className={`p-10 rounded-[2rem] text-center border-2 ${quizResult.passed ? 'bg-[#E6FAEF] border-[#5DCAA5]' : 'bg-red-50 border-red-200'}`}>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 text-white ${quizResult.passed ? 'bg-[#5DCAA5]' : 'bg-red-400'}`}>
                  {quizResult.passed ? <IconCheck size={40} /> : <IconX size={40} />}
                </div>
                <h3 className="text-3xl font-bold mb-2">Skor Kamu: {Math.round(quizResult.score)}%</h3>
                
                {quizResult.passed ? (
                  <div>
                    <p className="text-green-700 font-medium mb-8">Luar biasa! Kamu berhasil menguasai materi ini.</p>
                    <button 
                      onClick={() => {
                        // Logic to go to next chapter would go here
                        setIsQuizActive(false);
                        setQuizResult(null);
                        setQuizAnswers({});
                        window.scrollTo(0, 0);
                      }}
                      className="bg-[#5DCAA5] text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90"
                    >
                      Lanjut ke Materi Berikutnya
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 font-medium mb-8">Wah, sedikit lagi! Nilai minimal untuk lulus adalah 70%.</p>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm text-left border border-gray-100 flex gap-6 items-center">
                      <div className="w-14 h-14 bg-[#EEEDFE] rounded-full flex items-center justify-center text-[#7F77DD] shrink-0">
                        <IconMessageCircle2 size={28} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Masih bingung?</h4>
                        <p className="text-gray-500 text-sm mb-3">Tanyakan langsung pada CalcuMind, tutor AI pribadimu untuk penjelasan lebih detail.</p>
                        <Link to="/calcumind" className="inline-block text-[#7F77DD] font-bold text-sm border-2 border-[#7F77DD] px-5 py-2 rounded-full hover:bg-[#EEEDFE] transition-colors">
                          Diskusikan dengan CalcuMind
                        </Link>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setIsQuizActive(true);
                        setQuizResult(null);
                        setQuizAnswers({});
                      }}
                      className="mt-6 text-gray-500 font-medium hover:underline"
                    >
                      Ulangi Quiz
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

        </div>
      </main>
    </div>
  );
}
