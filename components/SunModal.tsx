
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sunrise, Sunset, Sun, Moon } from 'lucide-react';
import { WeatherData } from '../types';
import { getCityLocalTime, parseCityDate, formatCityTime } from '../utils/weatherUtils';

interface SunModalProps {
  data: WeatherData;
  onClose: () => void;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

const interpolateColor = (color1: string, color2: string, factor: number) => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  return `rgb(${r}, ${g}, ${b})`;
};

const SunModal: React.FC<SunModalProps> = ({ data, onClose }) => {
  const daily = data.daily;
  const sunriseStr = daily.sunrise?.[0];
  const sunsetStr = daily.sunset?.[0];

  const sunriseDate = parseCityDate(sunriseStr);
  const sunsetDate = parseCityDate(sunsetStr);
  const cityNow = getCityLocalTime(data.utcOffsetSeconds);

  const getMinutes = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes();

  const sunriseMins = getMinutes(sunriseDate);
  const sunsetMins = getMinutes(sunsetDate);
  const currentMins = getMinutes(cityNow);

  const [sliderValue, setSliderValue] = useState(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1500; // Faster animation for UX

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = 1 - Math.pow(1 - percentage, 3);
      const newValue = Math.floor(currentMins * ease);
      setSliderValue(newValue);

      if (progress < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setSliderValue(currentMins);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [currentMins]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setSliderValue(parseInt(e.target.value));
  };

  const diffMs = sunsetDate.getTime() - sunriseDate.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const timeStops = useMemo(() => {
    const stops = [
      { min: 0, colors: ['#0f172a', '#1e293b', '#0f172a'] },
      { min: Math.max(0, sunriseMins - 90), colors: ['#1e1b4b', '#312e81', '#0f172a'] },
      { min: sunriseMins - 30, colors: ['#312e81', '#7c3aed', '#f97316'] },
      { min: sunriseMins, colors: ['#60a5fa', '#fb923c', '#fef08a'] },
      { min: sunriseMins + 60, colors: ['#38bdf8', '#7dd3fc', '#bae6fd'] },
      { min: (sunriseMins + sunsetMins) / 2, colors: ['#0ea5e9', '#38bdf8', '#e0f2fe'] },
      { min: sunsetMins - 60, colors: ['#38bdf8', '#7dd3fc', '#bae6fd'] },
      { min: sunsetMins, colors: ['#2563eb', '#f59e0b', '#ef4444'] },
      { min: sunsetMins + 45, colors: ['#4c1d95', '#312e81', '#0f172a'] },
      { min: Math.min(1440, sunsetMins + 90), colors: ['#0f172a', '#1e293b', '#0f172a'] },
      { min: 1440, colors: ['#0f172a', '#1e293b', '#0f172a'] }
    ];
    return stops.sort((a, b) => a.min - b.min);
  }, [sunriseMins, sunsetMins]);

  const bgStyle = useMemo(() => {
    let start = timeStops[0];
    let end = timeStops[timeStops.length - 1];

    for (let i = 0; i < timeStops.length - 1; i++) {
      if (sliderValue >= timeStops[i].min && sliderValue <= timeStops[i + 1].min) {
        start = timeStops[i];
        end = timeStops[i + 1];
        break;
      }
    }

    const range = end.min - start.min;
    const progress = range === 0 ? 0 : (sliderValue - start.min) / range;

    const c1 = interpolateColor(start.colors[0], end.colors[0], progress);
    const c2 = interpolateColor(start.colors[1], end.colors[1], progress);
    const c3 = interpolateColor(start.colors[2], end.colors[2], progress);

    return { background: `linear-gradient(to bottom, ${c1}, ${c2}, ${c3})` };
  }, [sliderValue, timeStops]);

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const width = 280;
  const height = 140;
  const paddingX = 20;
  const horizonY = 100;
  const peakY = 20;

  const startX = paddingX;
  const endX = width - paddingX;
  const midX = (startX + endX) / 2;
  const controlY = 2 * peakY - horizonY;
  const pathD = `M ${startX} ${horizonY} Q ${midX} ${controlY} ${endX} ${horizonY}`;

  let t = -0.1;
  let isDay = false;
  let opacity = 0;

  if (sliderValue >= sunriseMins && sliderValue <= sunsetMins) {
    isDay = true;
    t = (sliderValue - sunriseMins) / (sunsetMins - sunriseMins);
    if (t < 0.1) opacity = t * 10;
    else if (t > 0.9) opacity = (1 - t) * 10;
    else opacity = 1;
  }

  const mt = 1 - t;
  const sunX = mt * mt * startX + 2 * mt * t * midX + t * t * endX;
  const sunY = mt * mt * horizonY + 2 * mt * t * controlY + t * t * horizonY;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-sm text-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
        style={bgStyle}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/10">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {isDay ? <Sun size={18} /> : <Moon size={18} />} 日出日落
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="text-center mb-6">
            <div className="text-5xl font-light tracking-tight mb-1 font-mono tabular-nums">
              {formatMins(sliderValue)}
            </div>
            <div className="text-sm font-medium opacity-80">
              {sliderValue < sunriseMins ? '日出前' : sliderValue > sunsetMins ? '日落后' : '白昼'}
            </div>
          </div>

          <div className="w-full h-40 relative flex items-center justify-center mb-6">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <line x1="0" y1={horizonY} x2={width} y2={horizonY} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="5,5" />
              <path d={pathD} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
              <g style={{ opacity: opacity, transition: 'opacity 0.1s linear' }}>
                <circle cx={sunX} cy={sunY} r="12" fill="rgba(255,255,255,0.2)" className="animate-pulse" />
                <circle cx={sunX} cy={sunY} r="6" fill="#fff" className="shadow-[0_0_15px_rgba(255,223,0,0.8)]" />
              </g>
              <text x={startX} y={horizonY + 20} fontSize="10" fill="white" textAnchor="middle">{formatCityTime(sunriseStr)}</text>
              <text x={endX} y={horizonY + 20} fontSize="10" fill="white" textAnchor="middle">{formatCityTime(sunsetStr)}</text>
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-black/20 rounded-2xl p-3 flex flex-col items-center">
              <div className="flex items-center gap-1 text-xs text-white/60 mb-1"><Sunrise size={12} /> 日出</div>
              <div className="text-lg font-semibold">{formatCityTime(sunriseStr)}</div>
            </div>
            <div className="bg-black/20 rounded-2xl p-3 flex flex-col items-center">
              <div className="flex items-center gap-1 text-xs text-white/60 mb-1"><Sunset size={12} /> 日落</div>
              <div className="text-lg font-semibold">{formatCityTime(sunsetStr)}</div>
            </div>
          </div>

          <div className="w-full bg-black/20 rounded-2xl p-4 border border-white/5">
            <div className="flex justify-between text-xs text-white/40 mb-2 font-medium">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:59</span>
            </div>
            <input type="range" min="0" max="1439" value={sliderValue} onChange={handleSliderChange} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
            <div className="mt-3 text-center text-xs text-white/50">白昼时长: {hours}小时 {minutes}分钟</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SunModal;
