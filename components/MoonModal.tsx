
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Moon, Info } from 'lucide-react';
import MoonVisual from './MoonVisual';
import { getMoonPhaseDescription } from '../utils/weatherUtils';
import { WeatherData } from '../types';

interface MoonModalProps {
  data: WeatherData;
  onClose: () => void;
}

const MoonModal: React.FC<MoonModalProps> = ({ data, onClose }) => {
  const todayPhase = data.daily.moon_phase?.[0] ?? 0;
  
  // Slider state: 0 represents "Today".
  // Use floating point numbers for smooth animation
  const [offset, setOffset] = useState(0);

  // Phase calculation
  const phaseChangePerDay = 1 / 29.53;
  let simulatedPhase = (todayPhase + (offset * phaseChangePerDay)) % 1;
  // Handle Javascript negative modulo bug
  if (simulatedPhase < 0) simulatedPhase += 1;
  
  // Date calculation
  // Use timestamp math for accurate floating point day addition
  const today = new Date();
  // Round offset for date display to avoid jittering date when sliding
  const displayOffset = Math.round(offset);
  const simulatedDate = new Date(today);
  simulatedDate.setDate(today.getDate() + displayOffset);
  
  const isToday = displayOffset === 0;
  const dateStr = isToday ? "今天" : simulatedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const description = getMoonPhaseDescription(simulatedPhase);

  const illumination = Math.round((1 - Math.cos(simulatedPhase * 2 * Math.PI)) / 2 * 100);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-[#1c1c1e] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
               <Moon size={18} /> 月相详情
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          
          {/* Main Visual */}
          <div className="mb-6 relative">
             <MoonVisual phase={simulatedPhase} size={220} />
             {/* Glow effect behind */}
             <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full -z-10 transform scale-110" />
          </div>
          
          {/* Info */}
          <div className="text-center mb-8 space-y-1">
             <h3 className="text-3xl font-bold tracking-tight text-white">{dateStr}</h3>
             <div className="text-xl text-white/80 font-medium">{description}</div>
             <div className="text-sm text-white/50">照亮比例 {illumination}%</div>
          </div>

          {/* Timeline Slider */}
          <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10">
             <div className="flex justify-between text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">
                <span>过去</span>
                <span>现在</span>
                <span>未来</span>
             </div>
             
             {/* High precision step for fluid animation */}
             <input 
               type="range" 
               min="-14" 
               max="14" 
               step="0.05"
               value={offset}
               onChange={(e) => setOffset(parseFloat(e.target.value))}
               className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-200 transition-all"
             />
             
             <div className="mt-3 flex items-start gap-2 text-[10px] text-white/40 leading-relaxed">
               <Info size={12} className="shrink-0 mt-0.5" />
               <p>左右拖动滑块，观察月相阴影的连续变化。</p>
             </div>
          </div>
          
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MoonModal;
