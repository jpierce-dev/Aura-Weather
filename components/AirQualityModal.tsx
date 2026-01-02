
import React from 'react';
import { createPortal } from 'react-dom';
import { X, Wind } from 'lucide-react';
import { WeatherData } from '../types';
import { getAQIDescription } from '../utils/weatherUtils';

interface AirQualityModalProps {
  data: WeatherData;
  onClose: () => void;
}

const AirQualityModal: React.FC<AirQualityModalProps> = ({ data, onClose }) => {
  const { current } = data;
  const aqi = current.aqi ?? 0;
  const aqiInfo = getAQIDescription(aqi);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-[#1c1c1e] text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="bg-green-500/20 p-1.5 rounded-full">
               <Wind size={18} className="text-green-400" />
            </div>
            <h2 className="text-lg font-semibold">空气质量详情</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 no-scrollbar">
          {/* Main Status */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-24 overflow-hidden mb-2">
               {/* Gauge Background */}
               <div className="absolute w-48 h-48 rounded-full border-[12px] border-white/10 top-0 left-0 box-border"></div>
               {/* Gauge Value */}
               <div 
                 className={`absolute w-48 h-48 rounded-full border-[12px] border-transparent border-t-${aqiInfo.color.split('-')[1]}-500 border-r-${aqiInfo.color.split('-')[1]}-500 top-0 left-0 transition-transform duration-1000 ease-out`}
                 style={{ 
                    transform: `rotate(${-135 + (Math.min(aqi, 300) / 300) * 180}deg)`,
                    borderColor: 'transparent'
                 }}
               >
               </div>
               
               {/* Custom SVG Gauge */}
               <svg viewBox="0 0 200 100" className="w-full h-full">
                 <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#333" strokeWidth="20" strokeLinecap="round" />
                 <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="20" 
                    strokeLinecap="round" 
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (Math.min(aqi, 300) / 300))}
                    className="transition-[stroke-dashoffset] duration-1000 ease-out"
                 />
                 <defs>
                   <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" stopColor="#4ade80" />
                     <stop offset="50%" stopColor="#facc15" />
                     <stop offset="100%" stopColor="#ef4444" />
                   </linearGradient>
                 </defs>
               </svg>
            </div>
            
            <div className="text-center -mt-8">
                <div className="text-5xl font-bold">{aqi}</div>
                <div className={`text-xl font-medium mt-1 ${aqiInfo.color}`}>{aqiInfo.label}</div>
            </div>
          </div>

          {/* Pollutants */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <div className="text-white/50 text-xs font-medium uppercase mb-1">PM2.5</div>
              <div className="text-2xl font-semibold">{Math.round(current.pm2_5 ?? 0)}</div>
              <div className="text-xs text-white/40 mt-1">μg/m³</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
              <div className="text-white/50 text-xs font-medium uppercase mb-1">PM10</div>
              <div className="text-2xl font-semibold">{Math.round(current.pm10 ?? 0)}</div>
              <div className="text-xs text-white/40 mt-1">μg/m³</div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/5">
             <h3 className="font-semibold mb-2 text-sm">健康影响</h3>
             <p className="text-sm text-white/70 leading-relaxed">
               {aqi <= 50 && "空气质量令人满意，空气污染几乎没有风险。"}
               {aqi > 50 && aqi <= 100 && "空气质量可以接受。然而，对于极少数对空气污染异常敏感的人群，可能存在一定风险。"}
               {aqi > 100 && aqi <= 150 && "敏感人群可能会受到健康影响。一般人群受影响的可能性较小。"}
               {aqi > 150 && aqi <= 200 && "每个人都可能开始受到健康影响；敏感人群可能会受到更严重的健康影响。"}
               {aqi > 200 && "卫生警报：每个人都可能受到更严重的健康影响。"}
             </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AirQualityModal;
