import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconSend, IconPhotoPlus, IconBrain, IconBulb } from '@tabler/icons-react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MessageFormatter = ({ content }: { content: string }) => {
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\)|(?<!\\)\$[\s\S]*?(?<!\\)\$)/g;
  const parts = content.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={index} math={part.slice(2, -2)} />;
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          return <BlockMath key={index} math={part.slice(2, -2)} />;
        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
          return <InlineMath key={index} math={part.slice(2, -2)} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default function CalcuMindPage() {
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

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Aku CalcuMind. Mari kita diskusikan materi yang membuatmu bingung. Apa yang ingin kamu tanyakan hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use state or location to set topic. Hardcoded for now based on mockup requirements
  const topic = "Turunan Fungsi Aljabar"; 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (text: string, isHintRequest: boolean = false) => {
    if (!text.trim() && !isHintRequest) return;

    const newMessages = [...messages];
    if (!isHintRequest) {
      newMessages.push({ role: 'user', content: text });
      setMessages(newMessages);
      setInput('');
    } else {
      // If it's a hint request, we invisibly send it to the AI as a user message
      newMessages.push({ role: 'user', content: 'Saya butuh satu hint lagi untuk langkah selanjutnya.' });
      setMessages(newMessages);
    }

    setIsLoading(true);

    try {
      // Use the FastAPI backend to securely proxy the request to Anthropic
      const response = await api.post('/calcumind/chat', {
        messages: newMessages
      });

      const replyContent = response.data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
    } catch (error: any) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Maaf, aku tidak bisa membalas saat ini. (Error: ${error.message})` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-sans text-[#26215C]">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between shrink-0 border-b border-gray-100 z-10">
        <div className="flex items-center gap-4">
          <Link to="/modul" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <IconArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7F77DD] to-[#5DCAA5] flex items-center justify-center text-white shadow-sm">
              <IconBrain size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">CalcuMind</h1>
              <p className="text-xs text-[#5DCAA5] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#5DCAA5] animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[#EEEDFE] text-[#7F77DD] px-4 py-1.5 rounded-full text-sm font-bold border border-[#7F77DD]/20">
          Topik: {topic}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
          <div className="text-center my-4">
            <span className="text-xs text-gray-400 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-50">
              Hari ini
            </span>
          </div>

          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            
            // Hide the hint request message from the UI to make it feel magical, or show it? Let's show it so user knows what they asked.
            // If it's a hint request, we can style it differently, but showing it as a normal user message is fine.

            return (
              <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1 max-w-[85%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                <div className={`p-4 shadow-sm ${
                  isUser 
                    ? 'bg-white rounded-[2rem] rounded-tr-sm border border-gray-100' 
                    : 'bg-[#EEEDFE] rounded-[2rem] rounded-tl-sm'
                }`}>
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    <MessageFormatter content={msg.content} />
                  </div>
                </div>
                
                {/* Show "Butuh hint?" button only on the last assistant message if not loading */}
                {!isUser && idx === messages.length - 1 && !isLoading && (
                  <button 
                    onClick={() => sendMessage('', true)}
                    className="mt-2 ml-4 flex items-center gap-1 text-xs font-bold text-[#7F77DD] hover:text-[#26215C] transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100"
                  >
                    <IconBulb size={14} />
                    Butuh hint?
                  </button>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start max-w-[85%] mr-auto">
              <div className="bg-[#EEEDFE] p-5 rounded-[2rem] rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#7F77DD] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#7F77DD] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#7F77DD] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white p-4 border-t border-gray-100 shrink-0">
        <div className="max-w-3xl mx-auto relative flex items-center">
          <button className="absolute left-3 p-2 text-gray-400 hover:text-[#7F77DD] transition-colors rounded-full hover:bg-gray-50">
            <IconPhotoPlus size={24} />
          </button>
          
          <form onSubmit={handleFormSubmit} className="w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu tentang turunan..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-16 focus:outline-none focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all"
              disabled={isLoading}
            />
            
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 p-2.5 bg-[#7F77DD] text-white rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <IconSend size={20} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
