
export interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    windDirection: number;
    isDay: number;
    time: string;
    aqi?: number;
    pm2_5?: number;
    pm10?: number;
    humidity?: number;
    apparentTemperature?: number;
    pressure?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
    precipitation_probability: number[];
    wind_speed_10m: number[];
    us_aqi?: number[];
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    moon_phase: number[];
    moonrise: string[];
    moonset: string[];
  };
  current_units: {
    temperature: string;
    wind_speed: string;
  };
}

export interface GeoLocation {
  lat: number;
  lon: number;
  city?: string;
}

export interface SavedCity {
  name: string;
  lat: number;
  lon: number;
}

export enum WeatherType {
  Clear = 'Clear',
  Cloudy = 'Cloudy',
  Rain = 'Rain',
  Snow = 'Snow',
  Thunderstorm = 'Thunderstorm',
  Fog = 'Fog',
  Drizzle = 'Drizzle'
}

export interface SummaryResponse {
  summary: string;
  clothing: string;
}
