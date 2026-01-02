
import React, { useMemo } from 'react';
import { getWeatherType } from '../utils/weatherUtils';
import { WeatherType } from '../types';

interface DynamicBackgroundProps {
  weatherCode: number;
  isDay: number;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ weatherCode, isDay }) => {
  const type = getWeatherType(weatherCode);

  // --- 1. Base Gradients ---
  const backgroundClass = useMemo(() => {
    // --- NIGHT ---
    if (!isDay) {
      switch (type) {
        case WeatherType.Clear:
          // Clear Night: Deep midnight blue to lighter horizon
          return 'bg-gradient-to-b from-[#0B1026] via-[#2B32B2] to-[#1488CC]';
        case WeatherType.Cloudy:
          // Cloudy Night: Dark grey/purple
          return 'bg-gradient-to-b from-[#232526] via-[#414345] to-[#2C3E50]';
        case WeatherType.Fog:
          // Foggy Night (Sandstorm?): Murky brown/grey
          return 'bg-gradient-to-b from-[#3E3834] via-[#544F49] to-[#636363]';
        case WeatherType.Rain:
        case WeatherType.Drizzle:
          // Rainy Night: Deep desaturated blue
          return 'bg-gradient-to-b from-[#000428] via-[#004e92] to-[#005c97]';
        case WeatherType.Thunderstorm:
          // Storm Night: Almost black to deep purple
          return 'bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]';
        case WeatherType.Snow:
          // Snowy Night: Cold dark blue/grey
          return 'bg-gradient-to-b from-[#16222A] via-[#3A6073] to-[#8CA6DB]';
        default:
          return 'bg-gradient-to-b from-[#0B1026] via-[#2B32B2] to-[#1488CC]';
      }
    }

    // --- DAY ---
    switch (type) {
      case WeatherType.Clear:
        // Clear Day: Bright vibrant Sky
        return 'bg-gradient-to-b from-[#005AA7] via-[#2980B9] to-[#86A8E7]';
      case WeatherType.Cloudy:
        // Cloudy Day: Greyish blue
        return 'bg-gradient-to-b from-[#606c88] via-[#8E9EAB] to-[#D7DDE8]';
      case WeatherType.Fog:
        // Fog/Sandstorm Day: Intense Dusty Orange/Yellow for Dubai feel
        return 'bg-gradient-to-b from-[#9D8157] via-[#C9A66B] to-[#E3D5B8]';
      case WeatherType.Rain:
      case WeatherType.Drizzle:
        // Rainy Day: Desaturated blue/grey
        return 'bg-gradient-to-b from-[#4B6CB7] via-[#587399] to-[#182848]';
      case WeatherType.Thunderstorm:
        // Storm Day: Dark menacing blue/grey
        return 'bg-gradient-to-b from-[#2C3E50] via-[#4CA1AF] to-[#2C3E50]';
      case WeatherType.Snow:
        // Snowy Day: Bright white/blue
        return 'bg-gradient-to-b from-[#E6DADA] via-[#274046] to-[#E6DADA]';
      default:
        return 'bg-gradient-to-b from-[#2980B9] via-[#6DD5FA] to-[#FFFFFF]';
    }
  }, [type, isDay]);

  // Flags
  const isClear = type === WeatherType.Clear;
  const isCloudy = type === WeatherType.Cloudy;
  const isFoggy = type === WeatherType.Fog; // Treated as Sandstorm/Haze
  const isRainy = type === WeatherType.Rain || type === WeatherType.Drizzle;
  const isThunder = type === WeatherType.Thunderstorm;
  const isSnowy = type === WeatherType.Snow;

  // --- SVG Data for Clouds ---
  const CloudShape = ({ className, style }: any) => (
    <svg viewBox="0 0 100 60" className={`absolute fill-current ${className}`} style={style}>
      <path d="M10 35 Q25 15 40 35 T70 35 T90 35 A10 10 0 1 1 90 55 H10 A10 10 0 1 1 10 35" />
    </svg>
  );

  // --- Styles & Animations ---
  const animations = `
    @keyframes float-h { 0% { transform: translateX(-10%); } 50% { transform: translateX(10%); } 100% { transform: translateX(-10%); } }
    @keyframes sand-h { 0% { transform: translateX(-100%); opacity: 0; } 50% { opacity: 0.6; } 100% { transform: translateX(100%); opacity: 0; } }
    @keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
    @keyframes rain-drop { 0% { transform: translateY(-20px) scaleY(1); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: translateY(100vh) scaleY(1.5); opacity: 0; } }
    @keyframes snow-fall { 0% { transform: translateY(-10px) translateX(0); opacity: 0; } 20% { opacity: 0.9; } 100% { transform: translateY(100vh) translateX(30px); opacity: 0; } }
    @keyframes pulse-glow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
    @keyframes lightning { 0%, 95% { opacity: 0; } 96% { opacity: 0.8; } 97% { opacity: 0; } 98% { opacity: 0.5; } 100% { opacity: 0; } }
    @keyframes sun-glow { 0% { box-shadow: 0 0 40px rgba(255, 200, 0, 0.4); } 50% { box-shadow: 0 0 80px rgba(255, 200, 0, 0.6); } 100% { box-shadow: 0 0 40px rgba(255, 200, 0, 0.4); } }
    
    .anim-cloud { animation: float-h 20s ease-in-out infinite; }
    .anim-sand { animation: sand-h 4s linear infinite; }
    .anim-star { animation: twinkle 4s ease-in-out infinite; }
    .anim-rain { animation: rain-drop 0.8s linear infinite; }
    .anim-snow { animation: snow-fall 8s linear infinite; }
    .anim-lightning { animation: lightning 6s infinite; }
  `;

  return (
    <div className={`fixed inset-0 z-0 transition-colors duration-1000 ease-in-out ${backgroundClass} overflow-hidden`}>
      <style>{animations}</style>

      {/* --- CELESTIAL BODIES --- */}
      
      {/* Sun (Day + Clear/Cloudy/Fog) */}
      {isDay === 1 && (isClear || isCloudy || isFoggy) && (
        <div className="absolute top-10 right-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 blur-2xl opacity-80 animate-[pulse-glow_4s_ease-in-out_infinite]" />
          {/* Intense center */}
          <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-white blur-xl opacity-90" />
        </div>
      )}

      {/* Moon (Night + Clear/Cloudy) */}
      {!isDay && (
        <div className="absolute top-16 right-12">
           <div className="w-16 h-16 rounded-full bg-slate-200 opacity-90 shadow-[0_0_40px_rgba(255,255,255,0.3)]" />
           {/* Craters - simplistic */}
           <div className="absolute top-4 left-3 w-4 h-4 rounded-full bg-slate-300 opacity-50" />
           <div className="absolute bottom-4 right-5 w-3 h-3 rounded-full bg-slate-300 opacity-50" />
        </div>
      )}

      {/* --- STARS (Night + Clear) --- */}
      {!isDay && isClear && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full anim-star"
              style={{
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            />
          ))}
        </div>
      )}

      {/* --- CLOUDS (Cloudy / Thunderstorm) --- */}
      {(isCloudy || isThunder) && (
        <div className="absolute inset-0">
           <CloudShape className={`text-white top-[10%] left-[-10%] w-[50%] opacity-20 anim-cloud`} style={{ animationDuration: '30s' }} />
           <CloudShape className={`text-gray-100 top-[20%] right-[-10%] w-[60%] opacity-20 anim-cloud`} style={{ animationDuration: '40s', animationDelay: '2s' }} />
           <CloudShape className={`text-white top-[40%] left-[20%] w-[30%] opacity-10 anim-cloud`} style={{ animationDuration: '25s', animationDelay: '5s' }} />
        </div>
      )}

      {/* --- SANDSTORM / FOG --- */}
      {isFoggy && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Base Haze */}
          <div className={`absolute inset-0 ${isDay ? 'bg-amber-100/10' : 'bg-white/5'} backdrop-blur-[2px]`} />
          
          {/* Moving Dust Streaks */}
          {[...Array(6)].map((_, i) => (
             <div 
               key={i}
               className={`absolute h-[2px] w-[30%] ${isDay ? 'bg-amber-100/30' : 'bg-gray-400/20'} rounded-full anim-sand`}
               style={{
                 top: `${10 + Math.random() * 80}%`,
                 left: '-30%',
                 animationDuration: `${3 + Math.random() * 4}s`,
                 animationDelay: `${Math.random() * 2}s`
               }}
             />
          ))}
          
          {/* Grain Texture Overlay (Simulated with noise) */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
          />
        </div>
      )}

      {/* --- RAIN --- */}
      {(isRainy || isThunder) && (
        <div className="absolute inset-0 overflow-hidden">
           {[...Array(80)].map((_, i) => (
             <div 
               key={i}
               className="absolute bg-white/40 w-[1px] rounded-full anim-rain"
               style={{
                 height: `${Math.random() * 20 + 10}px`,
                 left: `${Math.random() * 100}%`,
                 animationDuration: `${0.5 + Math.random() * 0.3}s`,
                 animationDelay: `${Math.random() * 2}s`
               }}
             />
           ))}
        </div>
      )}

      {/* --- THUNDER --- */}
      {isThunder && (
        <div className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none anim-lightning" />
      )}

      {/* --- SNOW --- */}
      {isSnowy && (
        <div className="absolute inset-0 overflow-hidden">
           {[...Array(50)].map((_, i) => (
             <div 
               key={i}
               className="absolute bg-white/80 rounded-full anim-snow"
               style={{
                 width: `${Math.random() * 3 + 2}px`,
                 height: `${Math.random() * 3 + 2}px`,
                 left: `${Math.random() * 100}%`,
                 animationDuration: `${3 + Math.random() * 4}s`,
                 animationDelay: `${Math.random() * 5}s`
               }}
             />
           ))}
        </div>
      )}
    </div>
  );
};

export default DynamicBackground;
