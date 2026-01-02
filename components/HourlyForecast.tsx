
import React from 'react';
import { WeatherData } from '../types';
import { formatCityTime, getIconForWeather, getWindScale, getCityLocalTime, parseCityDate } from '../utils/weatherUtils';
import { Wind } from 'lucide-react';

interface HourlyForecastProps {
  data: WeatherData;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data }) => {
  const cityNow = getCityLocalTime(data.utcOffsetSeconds);

  // Get next 24 hours starting from current city time
  const next24Hours = data.hourly.time
    .map((t, i) => ({
      time: t,
      temp: data.hourly.temperature_2m[i],
      code: data.hourly.weathercode[i],
      prob: data.hourly.precipitation_probability[i],
      windSpeed: data.hourly.wind_speed_10m[i],
    }))
    .filter((item) => parseCityDate(item.time) >= cityNow)
    .slice(0, 24);

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10">
      <div className="text-xs font-medium text-white/70 uppercase mb-3 border-b border-white/10 pb-2 flex items-center">
        <span className="mr-1">🕒</span> 小时预报
      </div>

      <div className="flex overflow-x-auto gap-6 pb-2 no-scrollbar snap-x snap-mandatory">
        {next24Hours.map((hour, idx) => {
          const Icon = getIconForWeather(hour.code, 1);
          const isNow = idx === 0;
          const windScale = getWindScale(hour.windSpeed);

          return (
            <div key={idx} className="flex flex-col items-center min-w-[50px] snap-start">
              <span className="text-sm font-medium mb-2">
                {isNow ? '现在' : formatCityTime(hour.time)}
              </span>
              <Icon size={24} className="mb-2 opacity-90" />

              {hour.prob > 20 && (
                <span className="text-[10px] text-blue-200 font-bold mb-1">{hour.prob}%</span>
              )}

              <span className="text-lg font-semibold mb-1">{Math.round(hour.temp)}°</span>

              <div className="flex flex-col items-center mt-1">
                <Wind size={12} className="text-white/50 mb-0.5" />
                <span className="text-[10px] text-white/70">{windScale}级</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;