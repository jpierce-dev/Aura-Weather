
import React from 'react';
import { WeatherData } from '../types';
import { getDayName, getIconForWeather, getWindScale } from '../utils/weatherUtils';
import { Wind } from 'lucide-react';

interface DailyForecastProps {
  data: WeatherData;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ data }) => {
  const daily = data.daily;
  const minTemp = Math.min(...daily.temperature_2m_min);
  const maxTemp = Math.max(...daily.temperature_2m_max);
  const range = maxTemp - minTemp;

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10">
      <div className="text-xs font-medium text-white/70 uppercase mb-3 border-b border-white/10 pb-2 flex items-center">
        <span className="mr-1">📅</span> 15天预报
      </div>

      <div className="flex flex-col gap-1">
        {daily.time.map((day, i) => {
          const Icon = getIconForWeather(daily.weathercode[i], 1);
          const low = daily.temperature_2m_min[i];
          const high = daily.temperature_2m_max[i];
          const precip = daily.precipitation_sum[i];
          const windScale = getWindScale(daily.wind_speed_10m_max[i]);

          const leftPos = ((low - minTemp) / range) * 100;
          const width = ((high - low) / range) * 100;

          return (
            <div key={day} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 text-white">
              <div className="w-12 font-medium text-base">{getDayName(day, data.utcOffsetSeconds)}</div>

              <div className="flex flex-col items-center w-8">
                <Icon size={22} />
                {precip > 0 && (
                  <span className="text-[10px] text-blue-200 mt-0.5">{precip > 1 ? Math.round(precip) + 'mm' : ''}</span>
                )}
              </div>

              <div className="w-8 flex flex-col items-center justify-center opacity-70">
                <Wind size={12} className="mb-0.5" />
                <span className="text-[10px] font-medium">{windScale}级</span>
              </div>

              <div className="w-8 text-right text-white/70 font-medium">{Math.round(low)}°</div>

              <div className="flex-1 mx-3 h-1.5 bg-black/20 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-green-300 to-yellow-400 opacity-80"
                  style={{ left: `${leftPos}%`, width: `${width}%` }}
                />
              </div>

              <div className="w-8 text-right font-medium">{Math.round(high)}°</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;