
import React, { useState } from 'react';
import { WeatherData } from '../types';
import { Sun, Wind, Droplets, Thermometer, Gauge } from 'lucide-react';
import { getWindScale, getAQIDescription } from '../utils/weatherUtils';
import SunCard from './SunCard';
import AirQualityModal from './AirQualityModal';
import MoonCard from './MoonCard';
import MoonModal from './MoonModal';
import SunModal from './SunModal';

interface WeatherGridProps {
  data: WeatherData;
}

// --- Helper: Card Container ---
const CardContainer = ({ title, icon: Icon, children, className = '', onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col relative overflow-hidden aspect-square ${className} ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
  >
    <div className="flex items-center text-xs font-medium text-white/70 mb-1 z-20 h-5">
      <Icon size={14} className="mr-1.5" /> {title}
    </div>
    <div className="flex-1 relative z-10 w-full h-full">
      {children}
    </div>
  </div>
);

// --- Component: AQI Card ---
const AQICard = ({ aqi, onClick }: { aqi: number, onClick: () => void }) => {
  const { label, color, percentage } = getAQIDescription(aqi);
  const angle = -90 + ((percentage / 100) * 180);

  return (
    <CardContainer title="空气质量" icon={Wind} onClick={onClick}>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <div className="text-3xl font-semibold text-white leading-none">{aqi}</div>
        <div className={`text-sm font-medium mt-1 ${color}`}>{label}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-[110%] h-[110%] overflow-visible mt-4">
          <defs>
            <linearGradient id="aqiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="url(#aqiGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="110" strokeDashoffset={110 - (110 * (percentage / 100))} />
          <g transform={`rotate(${angle}, 50, 50)`}>
             <circle cx="50" cy="15" r="5" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2" className="shadow-sm" />
          </g>
        </svg>
      </div>
    </CardContainer>
  );
};

// --- Component: UV Index Card ---
const UVCard = ({ uvIndex }: { uvIndex: number }) => {
  const maxUV = 12;
  const percentage = Math.min(uvIndex / maxUV, 1);
  const angle = -90 + (percentage * 180); 
  let label = "低";
  if (uvIndex > 2) label = "中";
  if (uvIndex > 5) label = "高";
  if (uvIndex > 7) label = "极高";
  if (uvIndex > 10) label = "极强";

  return (
    <CardContainer title="紫外线" icon={Sun}>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <div className="text-3xl font-semibold text-white leading-none">{uvIndex.toFixed(0)}</div>
        <div className="text-sm font-medium text-white/80 mt-1">{label}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-[110%] h-[110%] overflow-visible mt-4">
          <defs>
            <linearGradient id="uvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="url(#uvGradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="110" strokeDashoffset={110 - (110 * percentage)} />
          <g transform={`rotate(${angle}, 50, 50)`}>
             <circle cx="50" cy="15" r="5" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="2" className="shadow-sm" />
          </g>
        </svg>
      </div>
    </CardContainer>
  );
};

// --- Component: Humidity Card ---
const HumidityCard = ({ humidity }: { humidity: number }) => {
  let label = "干燥";
  if (humidity >= 30) label = "舒适";
  if (humidity >= 70) label = "潮湿";

  return (
    <CardContainer title="湿度" icon={Droplets}>
       <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-semibold text-white leading-none">{humidity}<span className="text-lg align-top">%</span></div>
        <div className="text-xs font-medium text-white/60 mt-1">{label}</div>
      </div>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] rotate-180">
             <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
             <circle cx="50" cy="50" r="42" fill="none" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264 - (264 * (humidity / 100))} className="transition-all duration-1000 ease-out" />
          </svg>
       </div>
    </CardContainer>
  );
};

// --- Component: Feels Like Card ---
const FeelsLikeCard = ({ temp }: { temp: number }) => {
  const minT = -10;
  const maxT = 40;
  const clamped = Math.max(minT, Math.min(maxT, temp));
  const percentage = (clamped - minT) / (maxT - minT);
  const angle = -120 + (percentage * 240);
  let label = "适宜";
  if (temp < 10) label = "较冷";
  else if (temp < 18) label = "凉爽";
  else if (temp > 28) label = "炎热";

  return (
    <CardContainer title="体感" icon={Thermometer}>
       <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <div className="text-3xl font-semibold text-white leading-none">{Math.round(temp)}°</div>
          <div className="text-xs font-medium text-white/60 mt-1">{label}</div>
       </div>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-1">
         <svg viewBox="0 0 100 100" className="w-[100%] h-[100%] overflow-visible">
           <defs>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
           </defs>
           <path d="M 30.9 83 A 38 38 0 1 1 69.1 83" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
           <path d="M 30.9 83 A 38 38 0 1 1 69.1 83" fill="none" stroke="url(#tempGradient)" strokeWidth="6" strokeLinecap="round" />
           <g transform={`rotate(${angle}, 50, 50)`}>
              <circle cx="50" cy="12" r="4" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="1" className="shadow-sm" />
           </g>
         </svg>
       </div>
    </CardContainer>
  );
};

// --- Component: Wind Card ---
const WindCard = ({ speed, direction }: { speed: number, direction: number }) => {
  const level = getWindScale(speed);
  return (
    <CardContainer title="风向" icon={Wind}>
       <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-xl font-bold text-white">{level}级</div>
          <div className="text-[10px] text-white/60">{Math.round(speed)} km/h</div>
       </div>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-[95%] h-[95%]">
             <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
             {[0, 90, 180, 270].map(d => (
                <line key={d} x1="50" y1="6" x2="50" y2="10" stroke="white" strokeWidth="2" transform={`rotate(${d}, 50, 50)`} />
             ))}
             {Array.from({length: 8}).map((_, i) => (
                <line key={i} x1="50" y1="6" x2="50" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1" transform={`rotate(${i * 45 + 45}, 50, 50)`} />
             ))}
             <text x="50" y="20" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">北</text>
             <text x="80" y="53" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">东</text>
             <text x="50" y="86" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">南</text>
             <text x="20" y="53" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">西</text>
             <g transform={`rotate(${direction}, 50, 50)`}>
                <path d="M 50 25 L 55 40 L 50 35 L 45 40 Z" fill="#60a5fa" />
                <path d="M 50 35 L 50 65" stroke="#60a5fa" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="2" fill="white" />
             </g>
          </svg>
       </div>
    </CardContainer>
  );
};

// --- Component: Pressure Card ---
const PressureCard = ({ pressure }: { pressure: number }) => {
  const minP = 960;
  const maxP = 1060;
  const percentage = (pressure - minP) / (maxP - minP);
  const angle = -135 + (percentage * 270);

  return (
    <CardContainer title="气压" icon={Gauge}>
       <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-white">{Math.round(pressure)}</div>
          <div className="text-[10px] font-bold text-white/50">hPa</div>
       </div>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <svg viewBox="0 0 100 100" className="w-[100%] h-[100%]">
            {Array.from({length: 20}).map((_, i) => {
               const deg = -135 + (i * (270/19));
               const isMajor = i % 5 === 0;
               return (
                 <line key={i} x1="50" y1="12" x2="50" y2={isMajor ? 20 : 16} stroke={isMajor ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"} strokeWidth={isMajor ? 1.5 : 1} transform={`rotate(${deg}, 50, 50)`} />
               )
            })}
            <g transform={`rotate(${angle}, 50, 50)`}>
               <path d="M 50 22 L 54 28 L 46 28 Z" fill="#60a5fa" />
            </g>
            <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
         </svg>
       </div>
    </CardContainer>
  );
};

// --- Main Grid Component ---
const WeatherGrid = ({ data }: WeatherGridProps) => {
  const [showAQI, setShowAQI] = useState(false);
  const [showMoon, setShowMoon] = useState(false);
  const [showSun, setShowSun] = useState(false);

  const current = data.current;
  const today = data.daily;

  const aqi = current.aqi ?? 0;
  const uvIndex = today.uv_index_max?.[0] ?? 0;
  const humidity = current.humidity ?? 0;
  const feelsLike = current.apparentTemperature ?? current.temperature;
  const windSpeed = current.windSpeed;
  const windDir = current.windDirection;
  const pressure = current.pressure ?? 1013;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        {/* Row 1 */}
        <AQICard aqi={aqi} onClick={() => setShowAQI(true)} />
        <FeelsLikeCard temp={feelsLike} />

        {/* Row 2 */}
        <SunCard daily={data.daily} onClick={() => setShowSun(true)} />
        <MoonCard data={data} onClick={() => setShowMoon(true)} />

        {/* Row 3 */}
        <WindCard speed={windSpeed} direction={windDir} />
        <HumidityCard humidity={humidity} />

        {/* Row 4 */}
        <UVCard uvIndex={uvIndex} />
        <PressureCard pressure={pressure} />
      </div>

      {/* Modals */}
      {showAQI && <AirQualityModal data={data} onClose={() => setShowAQI(false)} />}
      {showMoon && <MoonModal data={data} onClose={() => setShowMoon(false)} />}
      {showSun && <SunModal data={data} onClose={() => setShowSun(false)} />}
    </>
  );
};

export default WeatherGrid;
