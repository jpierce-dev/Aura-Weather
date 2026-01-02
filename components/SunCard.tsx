
import React, { useEffect, useState } from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import { WeatherData } from '../types';

interface SunCardProps {
  daily: WeatherData['daily'];
  className?: string;
  onClick?: () => void;
}

const SunCard: React.FC<SunCardProps> = ({ daily, className, onClick }) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Trigger animation slightly after mount
    const timer = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Safe checks for data availability
  if (!daily?.sunrise?.[0] || !daily?.sunset?.[0]) return null;

  const sunriseStr = daily.sunrise[0];
  const sunsetStr = daily.sunset[0];
  const nextSunriseStr = daily.sunrise[1];
  
  const sunrise = new Date(sunriseStr);
  const sunset = new Date(sunsetStr);
  const now = new Date();

  // Determine current state
  const isDay = now >= sunrise && now <= sunset;
  const isBeforeSunrise = now < sunrise;
  
  // Logic for Label and Big Time Display
  let title = "日落";
  let displayTime = sunset;
  let Icon = Sunset;

  if (isBeforeSunrise) {
    title = "日出";
    displayTime = sunrise;
    Icon = Sunrise;
  } else if (!isDay) {
    // After sunset, look at next day's sunrise if available
    if (nextSunriseStr) {
      title = "日出";
      displayTime = new Date(nextSunriseStr);
      Icon = Sunrise;
    }
  }

  // Safe time formatting helper
  const formatTime = (date: Date) => {
    return isNaN(date.getTime()) ? '--:--' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const timeStr = formatTime(displayTime);
  const sunriseTimeStr = formatTime(sunrise);
  const sunsetTimeStr = formatTime(sunset);

  // --- Graph Calculations ---
  
  // Canvas/SVG dimensions
  const width = 160; 
  const height = 90;
  const paddingX = 20;
  const horizonY = 65; 
  const peakY = 20;    

  // Bezier Control Point Calculation
  const startX = paddingX;
  const endX = width - paddingX;
  const midX = (startX + endX) / 2;
  const controlY = 2 * peakY - horizonY;
  
  const pathD = `M ${startX} ${horizonY} Q ${midX} ${controlY} ${endX} ${horizonY}`;

  // Sun Position Calculation
  const totalDayTime = sunset.getTime() - sunrise.getTime();
  const timeSinceSunrise = now.getTime() - sunrise.getTime();
  
  // Normalize progress (0 to 1)
  let progress = 0;
  if (totalDayTime > 0) {
    progress = timeSinceSunrise / totalDayTime;
  }
  
  // Clamp values
  if (progress < 0) progress = 0;
  if (progress > 1) progress = 1;

  const t = animate ? progress : 0; 
  
  const mt = 1 - t;
  const sunX = mt * mt * startX + 2 * mt * t * midX + t * t * endX;
  const sunY = mt * mt * horizonY + 2 * mt * t * controlY + t * t * horizonY;

  return (
    <div 
      onClick={onClick}
      className={`bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col relative overflow-hidden aspect-square ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className || ''}`}
    >
      
      {/* Title Header */}
      <div className="flex items-center text-xs font-medium text-white/70 mb-1 z-10">
        <Icon size={14} className="mr-1.5" /> {title}
      </div>
      
      {/* Main Time Display */}
      <div className="text-3xl font-medium text-white mb-2 z-10">
        {timeStr}
      </div>

      {/* Graph Container */}
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

          {/* Horizon Line (Dashed) */}
          <line 
            x1="0" y1={horizonY} 
            x2={width} y2={horizonY} 
            stroke="rgba(255,255,255,0.2)" 
            strokeWidth="1" 
            strokeDasharray="4 3" 
          />

          {/* Sun Path Curve */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#curveGradient)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            className="drop-shadow-sm"
          />

          {/* Sun Dot (Animated) */}
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

          {/* Time Labels on the graph */}
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
