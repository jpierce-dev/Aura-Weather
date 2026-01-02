
import React from 'react';
import { WeatherData } from '../types';
import { getAQIDescription, formatCityTime, getDayName, getCityLocalTime, parseCityDate } from '../utils/weatherUtils';
import { Wind, Calendar } from 'lucide-react';

interface AirQualityForecastProps {
  data: WeatherData;
}

const AirQualityForecast: React.FC<AirQualityForecastProps> = ({ data }) => {
  const { hourly, utcOffsetSeconds } = data;
  const aqiData = hourly.us_aqi;

  if (!aqiData || aqiData.length === 0 || !hourly.time) return null;

  const cityNow = getCityLocalTime(utcOffsetSeconds);
  const next24Hours = hourly.time
    .map((t, i) => ({
      time: t,
      aqi: aqiData[i] ?? 0,
    }))
    .filter((item) => parseCityDate(item.time) >= cityNow)
    .slice(0, 24);

  const dailyMap = new Map<string, number[]>();
  hourly.time.forEach((t, i) => {
    const dateStr = t.split('T')[0];
    const val = aqiData[i];
    if (val !== undefined) {
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, []);
      }
      dailyMap.get(dateStr)?.push(val);
    }
  });

  const dailyForecast = Array.from(dailyMap.entries())
    .map(([date, values]) => ({
      date,
      maxAqi: Math.max(...values)
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (next24Hours.length === 0) return null;

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/10">
      <div className="text-xs font-medium text-white/70 uppercase mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <Wind size={14} className="mr-1.5" /> 24小时 AQI 预报
        </div>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x snap-mandatory mb-2">
        {next24Hours.map((hour, idx) => {
          const info = getAQIDescription(hour.aqi);
          const isNow = idx === 0;

          return (
            <div key={idx} className="flex flex-col items-center min-w-[50px] snap-start">
              <span className="text-sm font-medium mb-2 opacity-90 whitespace-nowrap">
                {isNow ? '现在' : formatCityTime(hour.time)}
              </span>

              <div className="h-10 w-1.5 rounded-full bg-white/10 mb-2 relative overflow-hidden">
                <div
                  className={`absolute bottom-0 left-0 w-full rounded-full transition-all duration-1000 bg-gradient-to-t from-${info.color.split('-')[1]}-400 to-${info.color.split('-')[1]}-500`}
                  style={{
                    height: `${Math.min((hour.aqi / 200) * 100, 100)}%`,
                    backgroundColor: 'currentColor' // Fallback
                  }}
                />
              </div>

              <span className="text-lg font-semibold mb-0.5">{hour.aqi}</span>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-white/10 w-full mb-4"></div>

      <div className="text-xs font-medium text-white/70 uppercase mb-3 flex items-center">
        <Calendar size={14} className="mr-1.5" /> 未来5天趋势
      </div>

      <div className="flex flex-col gap-3">
        {dailyForecast.map((day) => {
          const info = getAQIDescription(day.maxAqi);
          const widthPercent = Math.min((day.maxAqi / 300) * 100, 100);

          return (
            <div key={day.date} className="flex items-center text-white">
              <div className="w-14 font-medium text-sm text-white/90">
                {getDayName(day.date, utcOffsetSeconds)}
              </div>

              <div className="flex-1 mx-3 h-2 bg-white/5 rounded-full relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-${info.color.split('-')[1]}-400 to-${info.color.split('-')[1]}-500`}
                  style={{ width: `${widthPercent}%`, backgroundColor: 'currentColor' }}
                />
              </div>

              <div className="w-28 text-right flex items-center justify-end gap-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${info.color} bg-white/5 whitespace-nowrap`}>
                  {info.label}
                </span>
                <span className="font-semibold text-sm">{day.maxAqi}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AirQualityForecast;
