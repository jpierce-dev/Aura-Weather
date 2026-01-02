
import React, { useEffect, useState } from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import { WeatherData } from '../types';
import { getCityLocalTime, parseCityDate, formatCityTime } from '../utils/weatherUtils';

interface SunCardProps {
  daily: WeatherData['daily'];
  utcOffsetSeconds: number;
  className?: string;
  onClick?: () => void;
}

const SunCard: React.FC<SunCardProps> = ({ daily, utcOffsetSeconds, className, onClick }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!daily?.sunrise?.[0] || !daily?.sunset?.[0]) return null;

  const sunriseStr = daily.sunrise[0];
  const sunsetStr = daily.sunset[0];
  const nextSunriseStr = daily.sunrise[1];

  // Use UTC parsing to treat city local time as the source of truth
  const sunrise = parseCityDate(sunriseStr);
  const sunset = parseCityDate(sunsetStr);
  const now = getCityLocalTime(utcOffsetSeconds);

  // Determine current state
  const isDay = now >= sunrise && now <= sunset;
  const isBeforeSunrise = now < sunrise;

  // Logic for Label and Big Time Display
  let title = "日落";
  let displayTimeStr = formatCityTime(sunsetStr);
  let Icon = Sunset;

  if (isBeforeSunrise) {
    title = "日出";
    displayTimeStr = formatCityTime(sunriseStr);
    Icon = Sunrise;
  } else if (!isDay) {
    if (nextSunriseStr) {
      title = "日出";
      displayTimeStr = formatCityTime(nextSunriseStr);
      Icon = Sunrise;
    }
  }

  const sunriseTimeStr = formatCityTime(sunriseStr);
  const sunsetTimeStr = formatCityTime(sunsetStr);

  // --- Graph Calculations ---
  const width = 160;
  const height = 90;
  const paddingX = 20;
  const horizonY = 65;
  const peakY = 20;

  const startX = paddingX;
  const endX = width - paddingX;
  const midX = (startX + endX) / 2;
  const controlY = 2 * peakY - horizonY;

  const pathD = `M ${startX} ${horizonY} Q ${midX} ${controlY} ${endX} ${horizonY}`;

  const totalDayTime = sunset.getTime() - sunrise.getTime();
  const timeSinceSunrise = now.getTime() - sunrise.getTime();

  let progress = 0;
  if (totalDayTime > 0) {
    progress = timeSinceSunrise / totalDayTime;
  }
  progress = Math.max(0, Math.min(1, progress));

  const t = animate ? progress : 0;
  const mt = 1 - t;
  const sunX = mt * mt * startX + 2 * mt * t * midX + t * t * endX;
  const sunY = mt * mt * horizonY + 2 * mt * t * controlY + t * t * horizonY;

  return (
    <div
      onClick={onClick}
      className={`bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col relative overflow-hidden aspect-square ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className || ''}`}
    >
      <div className="flex items-center text-xs font-medium text-white/70 mb-1 z-10">
        <Icon size={14} className="mr-1.5" /> {title}
      </div>

      <div className="text-3xl font-medium text-white mb-2 z-10">
        {displayTimeStr}
      </div>

      <div className="absolute inset-0 top-6 flex items-end justify-center pb-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <line x1="0" y1={horizonY} x2={width} y2={horizonY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3" />

          <path d={pathD} fill="none" stroke="url(#curveGradient)" strokeWidth="3" strokeLinecap="round" className="drop-shadow-sm" />

          <circle
            cx={sunX}
            cy={sunY}
            r="5"
            fill="#fff"
            stroke="#fbbf24"
            strokeWidth="2"
            filter="url(#sunGlow)"
            style={{
              transition: 'cx 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), cy 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              opacity: isDay || (isBeforeSunrise && progress === 0) || (!isDay && progress === 1) ? 1 : 0.5
            }}
          />

          <text x={startX} y={horizonY + 12} fontSize="8" fill="rgba(255,255,255,0.6)" textAnchor="middle" fontWeight="500">
            {sunriseTimeStr}
          </text>
          <text x={endX} y={horizonY + 12} fontSize="8" fill="rgba(255,255,255,0.6)" textAnchor="middle" fontWeight="500">
            {sunsetTimeStr}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default SunCard;
