import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { usePretestStore } from '../store/usePretestStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import { IconCheck, IconChevronRight, IconBook } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Mock question bank (10 questions)
const questions = [
  { id: 1, text: 'Jika $f(x) = 2x + 5$, berapakah nilai $f(3)$?', options: ['$8$', '$10$', '$11$', '$13$'], answer: '$11$', topic: 'Fungsi' },
  { id: 2, text: 'Bentuk sederhana dari $(x + 2)(x - 2)$ adalah...', options: ['$x^2 - 4$', '$x^2 + 4$', '$x^2 - 4x$', '$x^2 + 4x$'], answer: '$x^2 - 4$', topic: 'Aljabar' },
  { id: 3, text: 'Nilai dari $\\sin(30^\\circ)$ adalah...', options: ['$0$', '$\\frac{1}{2}$', '$\\frac{\\sqrt{2}}{2}$', '$1$'], answer: '$\\frac{1}{2}$', topic: 'Trigonometri' },
  { id: 4, text: '$\\lim_{x \\to 0} \\frac{\\sin x}{x} = \\dots$', options: ['$0$', '$1$', '$\\infty$', 'Tidak ada'], answer: '$1$', topic: 'Limit' },
  { id: 5, text: '$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = \\dots$', options: ['$0$', '$2$', '$4$', '$\\infty$'], answer: '$4$', topic: 'Limit' },
  { id: 6, text: 'Turunan pertama dari $f(x) = x^3$ adalah...', options: ['$3x^2$', '$x^2$', '$3x$', '$x^3$'], answer: '$3x^2$', topic: 'Turunan' },
  { id: 7, text: 'Turunan dari $\\sin(x)$ adalah...', options: ['$\\cos(x)$', '$-\\cos(x)$', '$\\sin(x)$', '$-\\sin(x)$'], answer: '$\\cos(x)$', topic: 'Turunan' },
  { id: 8, text: 'Hasil dari $\\int 2x dx$ adalah...', options: ['$x^2 + C$', '$2x^2 + C$', '$x + C$', '$2 + C$'], answer: '$x^2 + C$', topic: 'Integral' },
  { id: 9, text: 'Hasil dari $\\int \\cos(x) dx$ adalah...', options: ['$\\sin(x) + C$', '$-\\sin(x) + C$', '$\\cos(x) + C$', '$-\\cos(x) + C$'], answer: '$\\sin(x) + C$', topic: 'Integral' },
  { id: 10, text: 'Faktorkan: $x^2 - 9 = 0$', options: ['$(x-3)(x-3)$', '$(x+3)(x+3)$', '$(x-3)(x+3)$', '$(x-9)(x+1)$'], answer: '$(x-3)(x+3)$', topic: 'Aljabar' },
];

export default function PretestPage() {
  const navigate = useNavigate();
  const setScores = usePretestStore((state) => state.setScores);
  const setHasCompletedPretest = useAuthStore((state) => state.setHasCompletedPretest);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const currentQ = questions[currentQIndex];

  const handleNext = () => {
    if (selectedOption) {
      setAnswers((prev) => ({ ...prev, [currentQ.id]: selectedOption }));
    }

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    // Process the last answer
    const finalAnswers = { ...answers, [currentQ.id]: selectedOption };
    
    // Calculate scores per topic
    const topicStats: Record<string, { total: number; correct: number }> = {
      Limit: { total: 0, correct: 0 },
      Turunan: { total: 0, correct: 0 },
      Integral: { total: 0, correct: 0 },
      Aljabar: { total: 0, correct: 0 },
      Trigonometri: { total: 0, correct: 0 },
      Fungsi: { total: 0, correct: 0 },
    };

    questions.forEach((q) => {
      topicStats[q.topic].total += 1;
      if (finalAnswers[q.id] === q.answer) {
        topicStats[q.topic].correct += 1;
      }
    });

    const finalScores = {
      Limit: topicStats.Limit.total ? Math.round((topicStats.Limit.correct / topicStats.Limit.total) * 100) : 0,
      Turunan: topicStats.Turunan.total ? Math.round((topicStats.Turunan.correct / topicStats.Turunan.total) * 100) : 0,
      Integral: topicStats.Integral.total ? Math.round((topicStats.Integral.correct / topicStats.Integral.total) * 100) : 0,
      Aljabar: topicStats.Aljabar.total ? Math.round((topicStats.Aljabar.correct / topicStats.Aljabar.total) * 100) : 0,
      Trigonometri: topicStats.Trigonometri.total ? Math.round((topicStats.Trigonometri.correct / topicStats.Trigonometri.total) * 100) : 0,
      Fungsi: topicStats.Fungsi.total ? Math.round((topicStats.Fungsi.correct / topicStats.Fungsi.total) * 100) : 0,
    };

    setScores(finalScores);

    const formattedData = Object.keys(finalScores).map((key) => ({
      subject: key,
      score: finalScores[key as keyof typeof finalScores],
      fullMark: 100,
    }));
    setChartData(formattedData);

    // Get 3 lowest scoring topics for recommendations
    const sortedTopics = Object.keys(finalScores).sort(
      (a, b) => finalScores[a as keyof typeof finalScores] - finalScores[b as keyof typeof finalScores]
    );
    setRecommendations(sortedTopics.slice(0, 3));

    try {
      await api.post('/user/pretest', { scores: finalScores });
      setHasCompletedPretest(true);
    } catch (err) {
      console.error("Failed to save pretest progress", err);
    }

    setIsFinished(true);
  };

  return (
    <div className="min-h-screen bg-[#EEEDFE] flex items-center justify-center p-4 font-sans text-[#26215C]">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-xl overflow-hidden p-8 md:p-12">
        {!isFinished ? (
          <div>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                <span>Pertanyaan {currentQIndex + 1} dari {questions.length}</span>
                <span>{Math.round(((currentQIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-[#7F77DD] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 bg-[#EEEDFE] text-[#7F77DD] text-sm font-bold rounded-full mb-4">
                Topik: {currentQ.topic}
              </span>
              <div className="text-2xl font-bold">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{currentQ.text}</ReactMarkdown>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-10">
              {currentQ.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedOption === option
                      ? 'border-[#7F77DD] bg-[#EEEDFE] text-[#7F77DD]'
                      : 'border-gray-100 hover:border-[#7F77DD] hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-lg">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{option}</ReactMarkdown>
                  </span>
                  {selectedOption === option && (
                    <div className="w-6 h-6 rounded-full bg-[#7F77DD] flex items-center justify-center text-white">
                      <IconCheck size={16} stroke={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-all ${
                  selectedOption
                    ? 'bg-[#7F77DD] text-white hover:bg-opacity-90 shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {currentQIndex === questions.length - 1 ? 'Selesai' : 'Selanjutnya'}
                <IconChevronRight size={20} stroke={3} />
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold mb-2 text-[#26215C]">Analisis Diagnostik Selesai!</h2>
              <p className="text-gray-500 text-lg">Berikut adalah pemetaan kemampuan dasarmu sebelum memulai perjalanan kalkulus.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-center mb-10">
              {/* Radar Chart */}
              <div className="w-full md:w-1/2 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Skor"
                      dataKey="score"
                      stroke="#7F77DD"
                      strokeWidth={2}
                      fill="#7F77DD"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendations */}
              <div className="w-full md:w-1/2">
                <h3 className="text-xl font-bold mb-4">Rekomendasi CalcuLearn Untukmu</h3>
                <p className="text-sm text-gray-500 mb-6">Berdasarkan hasil ini, kami merekomendasikan kamu untuk memperkuat topik berikut:</p>
                <div className="space-y-4">
                  {recommendations.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-[#EEEDFE] flex items-center justify-center text-[#7F77DD] shrink-0">
                        <IconBook size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold">Fundamental {topic}</h4>
                        <p className="text-xs text-gray-500">Mulai dari konsep paling dasar</p>
                      </div>
                      <Link to="/modul" className="ml-auto text-[#7F77DD] hover:bg-[#EEEDFE] p-2 rounded-full transition-colors block">
                        <IconChevronRight size={20} stroke={2} />
                      </Link>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-8 bg-[#7F77DD] text-white py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-md"
                >
                  Masuk ke Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
