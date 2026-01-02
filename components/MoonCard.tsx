
import React from 'react';
import { Moon } from 'lucide-react';
import { WeatherData } from '../types';
import { getMoonPhaseDescription } from '../utils/weatherUtils';
import MoonVisual from './MoonVisual';

interface MoonCardProps {
  data: WeatherData;
  onClick: () => void;
}

const MoonCard: React.FC<MoonCardProps> = ({ data, onClick }) => {
  const daily = data.daily;
  
  // Current Phase
  const phase = daily.moon_phase?.[0] ?? 0;
  const description = getMoonPhaseDescription(phase);
  
  // Moonrise/set Strings (ISO)
  const moonriseStr = daily.moonrise?.[0];
  const moonsetStr = daily.moonset?.[0];
  
  const format = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false});
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col relative overflow-hidden aspect-square cursor-pointer active:scale-95 transition-transform"
    >
       <div className="flex items-center text-xs font-medium text-white/70 mb-1 z-20 h-5">
         <Moon size={14} className="mr-1.5" /> 月相
       </div>
       
       <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <MoonVisual phase={phase} size={80} />
          
          <div className="mt-2 text-center">
             <div className="text-sm font-semibold text-white">{description}</div>
             
             {/* Only display times if data exists */}
             {(moonriseStr || moonsetStr) && (
               <div className="text-[10px] text-white/50 mt-1 flex flex-col gap-0 leading-tight">
                 {moonriseStr && <div>月出 {format(moonriseStr)}</div>}
                 {moonsetStr && <div>月落 {format(moonsetStr)}</div>}
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default MoonCard;
