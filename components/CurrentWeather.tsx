
import React from 'react';
import { WeatherData } from '../types';
import { getWeatherDescription, getIconForWeather } from '../utils/weatherUtils';

interface CurrentWeatherProps {
  data: WeatherData;
  city: string;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data, city }) => {
  const current = data.current;
  const today = data.daily;
  const description = getWeatherDescription(current.weatherCode);
  const Icon = getIconForWeather(current.weatherCode, current.isDay);

  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-6 text-white text-center drop-shadow-md">
      <h1 className="text-3xl font-medium tracking-wide mb-1 shadow-black/10 drop-shadow-lg">{city}</h1>
      <div className="text-sm font-light opacity-90 mb-2 bg-black/10 px-3 py-0.5 rounded-full backdrop-blur-sm">
        {description}
      </div>
      
      {/* Big Hero Icon */}
      <div className="my-2 filter drop-shadow-2xl opacity-90">
        <Icon size={110} strokeWidth={1.2} />
      </div>
      
      <div className="text-8xl font-thin tracking-tighter mb-2 -ml-2">
        {Math.round(current.temperature)}°
      </div>
      
      <div className="flex items-center space-x-3 text-lg font-medium opacity-90">
        <span className="flex items-center gap-1">H: {Math.round(today.temperature_2m_max[0])}°</span>
        <span className="flex items-center gap-1">L: {Math.round(today.temperature_2m_min[0])}°</span>
      </div>
    </div>
  );
};

export default CurrentWeather;
