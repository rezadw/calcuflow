import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { IconArrowLeft, IconChevronDown, IconAlertCircle } from '@tabler/icons-react';
import * as math from 'mathjs';

export default function CalcuSimPage() {
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

  const [expression, setExpression] = useState('sin(x) * x');
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Pan and Zoom state
  const [xDomain, setXDomain] = useState<[number, number]>([-10, 10]);
  const [isPanning, setIsPanning] = useState(false);
  const [startX, setStartX] = useState(0);

  // Simulation Modes
  const [simMode, setSimMode] = useState<'basic' | 'derivative' | 'integral'>('basic');
  const [tangentX, setTangentX] = useState(0); 
  const [integralBounds, setIntegralBounds] = useState<[number, number]>([0, 5]); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const presets = [
    { name: 'Fungsi Kustom', expr: expression },
    { name: 'Fungsi Kuadrat', expr: 'x^2 - 4' },
    { name: 'Fungsi Trigonometri', expr: 'sin(x) * x' },
    { name: 'Fungsi Rasional', expr: '1/x' },
    { name: 'Fungsi Eksponensial', expr: '2^x' }
  ];

  // Compile expression and generate data
  const { compiledExpr, data, texFormula, meta } = useMemo(() => {
    try {
      const compiled = math.compile(expression);
      compiled.evaluate({ x: 0 });

      let m = 0;
      let y0 = 0;
      let totalArea = 0;

      if (simMode === 'derivative') {
        const derived = math.derivative(expression, 'x');
        m = derived.evaluate({ x: tangentX });
        y0 = compiled.evaluate({ x: tangentX });
      }

      const points = [];
      const range = xDomain[1] - xDomain[0];
      const step = range / 200; 
      
      // Compute points and meta data
      for (let x = xDomain[0]; x <= xDomain[1]; x += step) {
        try {
          const y = compiled.evaluate({ x });
          if (!isNaN(y) && isFinite(y)) {
            const point: any = { x, y };

            if (simMode === 'derivative') {
              point.tangentY = m * (x - tangentX) + y0;
            } else if (simMode === 'integral') {
              // shade area between bounds (ensure order is correct)
              const minB = Math.min(integralBounds[0], integralBounds[1]);
              const maxB = Math.max(integralBounds[0], integralBounds[1]);
              if (x >= minB && x <= maxB) {
                point.areaY = y;
                totalArea += y * step;
              }
            }
            points.push(point);
          }
        } catch (e) {
          // ignore undefined math
        }
      }
      
      const node = math.parse(expression);
      const tex = 'f(x) = ' + node.toTex({ parenthesis: 'keep' });
      
      setParseError(null);
      return { 
        compiledExpr: compiled, 
        data: points, 
        texFormula: tex,
        meta: { m, totalArea, tangentX, integralBounds }
      };
    } catch (err: any) {
      setParseError(err.message || 'Ekspresi tidak valid');
      return { compiledExpr: null, data: [], texFormula: 'f(x) = ?', meta: {} };
    }
  }, [expression, xDomain, simMode, tangentX, integralBounds]);

  // Render KaTeX
  useEffect(() => {
    const formulaContainer = document.getElementById('calcusim-formula');
    if (formulaContainer) {
      katex.render(texFormula, formulaContainer, {
        displayMode: true,
        throwOnError: false,
      });
    }
  }, [texFormula]);

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const range = xDomain[1] - xDomain[0];
    const mid = (xDomain[0] + xDomain[1]) / 2;
    const newRange = range * zoomFactor;
    setXDomain([mid - newRange / 2, mid + newRange / 2]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - startX;
    const range = xDomain[1] - xDomain[0];
    const domainDx = (dx / 800) * range; // Approximate width 800px
    setXDomain([xDomain[0] - domainDx, xDomain[1] - domainDx]);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="flex h-screen bg-[#EEEDFE] font-sans text-[#26215C]">
      {/* Main Graph Area */}
      <main className="flex-1 p-6 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-full hover:bg-white/50 text-[#26215C] transition-colors">
              <IconArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">CalcuSim</h1>
          </div>
          <div className="relative">
            <div 
              className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 cursor-pointer border border-gray-100 hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="font-semibold text-sm">Katalog Fungsi</span>
              <IconChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-2">Pilih Preset</div>
                {presets.slice(1).map((preset, idx) => (
                  <div 
                    key={idx}
                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-[#26215C] font-medium transition-colors"
                    onClick={() => {
                      setExpression(preset.expr);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {preset.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Graph Card */}
        <div 
          className={`flex-1 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 relative ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute top-8 right-8 text-xs text-gray-400 font-medium z-10 pointer-events-none">Gunakan Scroll untuk Zoom, Drag untuk Pan</div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="x" 
                type="number" 
                domain={xDomain}
                allowDataOverflow={true}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => Math.round(val).toString()}
                label={{ value: "x", position: 'insideBottom', offset: -10 }} 
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => Math.round(val).toString()}
                label={{ value: "f(x)", angle: -90, position: 'insideLeft' }} 
              />
              <ReferenceLine x={0} stroke="#26215C" strokeWidth={2} strokeOpacity={0.5} />
              <ReferenceLine y={0} stroke="#26215C" strokeWidth={2} strokeOpacity={0.5} />
              
              {simMode === 'integral' && (
                <Area type="monotone" dataKey="areaY" fill="#5DCAA5" stroke="none" fillOpacity={0.5} isAnimationActive={false} />
              )}
              
              <Line type="monotone" dataKey="y" stroke="#7F77DD" strokeWidth={3} dot={false} isAnimationActive={false} />
              
              {simMode === 'derivative' && (
                <Line type="linear" dataKey="tangentY" stroke="#D85A30" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} />
              )}

              <Tooltip 
                formatter={(value: any) => typeof value === 'number' ? Math.round(value) : value} 
                labelFormatter={(label: any) => typeof label === 'number' ? `x = ${Math.round(label)}` : label}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </main>

      {/* Sidebar Controls */}
      <aside className="w-96 bg-white shadow-sm flex flex-col h-full border-l border-gray-100 shrink-0 p-8 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Kontrol Parameter</h2>
        

        {/* Mode Simulasi Dropdown */}
        <div className="mb-8">
          <label className="block font-bold text-gray-700 mb-2">Mode Visualisasi</label>
          <select 
            value={simMode}
            onChange={(e) => setSimMode(e.target.value as any)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-[#26215C] focus:outline-none focus:ring-2 focus:ring-[#7F77DD] cursor-pointer"
          >
            <option value="basic">Grafik Dasar</option>
            <option value="derivative">Garis Singgung (Turunan)</option>
            <option value="integral">Luas Area (Integral)</option>
          </select>
        </div>

        {/* Dynamic Controls based on Mode */}
        {simMode === 'derivative' && (
          <div className="mb-8 bg-orange-50 p-6 rounded-2xl border border-orange-100">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-orange-700">Titik x₀</span>
              <span className="font-bold text-[#D85A30] bg-orange-200 px-3 py-1 rounded-lg">{tangentX.toFixed(0)}</span>
            </div>
            <input 
              type="range" min={Math.ceil(xDomain[0])} max={Math.floor(xDomain[1])} step="1" value={tangentX} onChange={(e) => setTangentX(parseFloat(e.target.value))}
              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-[#D85A30]"
            />
            <div className="mt-6 text-sm font-semibold text-orange-800 bg-white p-3 rounded-lg border border-orange-200">
              m (Kemiringan): {meta?.m !== undefined ? meta.m.toFixed(2) : '-'}
            </div>
          </div>
        )}

        {simMode === 'integral' && (
          <div className="mb-8 bg-[#E6FAEF] p-6 rounded-2xl border border-[#5DCAA5]/30">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-[#2A7558]">Batas a (Bawah)</span>
              <span className="font-bold text-[#5DCAA5] bg-green-100 px-3 py-1 rounded-lg">{integralBounds[0].toFixed(0)}</span>
            </div>
            <input 
              type="range" min={Math.ceil(xDomain[0])} max={Math.floor(xDomain[1])} step="1" value={integralBounds[0]} onChange={(e) => setIntegralBounds([parseFloat(e.target.value), integralBounds[1]])}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-[#5DCAA5] mb-6"
            />
            
            <div className="flex justify-between mb-4">
              <span className="font-bold text-[#2A7558]">Batas b (Atas)</span>
              <span className="font-bold text-[#5DCAA5] bg-green-100 px-3 py-1 rounded-lg">{integralBounds[1].toFixed(0)}</span>
            </div>
            <input 
              type="range" min={Math.ceil(xDomain[0])} max={Math.floor(xDomain[1])} step="1" value={integralBounds[1]} onChange={(e) => setIntegralBounds([integralBounds[0], parseFloat(e.target.value)])}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-[#5DCAA5]"
            />

            <div className="mt-6 text-sm font-semibold text-[#2A7558] bg-white p-3 rounded-lg border border-green-200">
              Estimasi Luas: {meta?.totalArea !== undefined ? Math.abs(meta.totalArea).toFixed(2) : '-'} satuan persegi
            </div>
          </div>
        )}

        {/* Input Fungsi Manual */}
        <div className="mb-10">
          <label className="block font-bold text-gray-700 mb-2">Fungsi f(x)</label>
          <input 
            type="text" 
            value={expression} 
            onChange={(e) => setExpression(e.target.value)}
            className={`w-full bg-gray-50 border ${parseError ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#7F77DD]'} rounded-xl px-4 py-3 font-mono focus:outline-none focus:ring-2`}
            placeholder="Contoh: sin(x) + x^2"
          />
          {parseError && (
            <div className="flex items-center gap-2 mt-2 text-red-500 text-sm font-medium">
              <IconAlertCircle size={16} />
              <span>{parseError}</span>
            </div>
          )}
          <p className="text-gray-400 text-xs mt-3">Gunakan `x` sebagai variabel (contoh: <code>2*x + 5</code>, <code>sin(x)</code>, <code>x^3</code>).</p>
        </div>

        {/* Formula Display */}
        <div className="mt-auto">
          <p className="text-sm font-bold text-gray-500 mb-3">Fungsi Saat Ini</p>
          <div className="bg-[#E6FAEF] p-6 rounded-2xl border border-[#5DCAA5]/20 text-center overflow-x-auto">
            <div id="calcusim-formula" className="text-lg text-[#26215C]"></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
