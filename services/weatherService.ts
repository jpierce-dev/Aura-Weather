
import { WeatherData, GeoLocation } from '../types';
import { calculateMoonPhase } from '../utils/weatherUtils';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export interface SearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}

export const fetchWeatherData = async (location: GeoLocation): Promise<WeatherData> => {
  // Use 'auto' to get the actual timezone of the location from Open-Meteo
  const weatherParams = new URLSearchParams({
    latitude: location.lat.toString(),
    longitude: location.lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
    hourly: 'temperature_2m,weather_code,precipitation_probability,uv_index,is_day,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: '16'
  });

  const airQualityParams = new URLSearchParams({
    latitude: location.lat.toString(),
    longitude: location.lon.toString(),
    current: 'us_aqi,pm10,pm2_5',
    hourly: 'us_aqi',
    timezone: 'auto',
    forecast_days: '5'
  });

  try {
    const [weatherResponse, aqResponse] = await Promise.all([
      fetch(`${BASE_URL}?${weatherParams.toString()}`),
      fetch(`${AIR_QUALITY_URL}?${airQualityParams.toString()}`)
    ]);

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error("Weather API Error:", weatherResponse.status, errorText);
      throw new Error(`Failed to fetch weather data: ${weatherResponse.status}`);
    }

    const data = await weatherResponse.json();
    let aqData = {
      current: { us_aqi: undefined, pm10: undefined, pm2_5: undefined },
      hourly: { us_aqi: [] }
    };

    if (aqResponse.ok) {
      aqData = await aqResponse.json();
    }

    // Calculate moon phases locally
    const dailyTime = data.daily.time || [];
    const moonPhases = dailyTime.map((t: string) => calculateMoonPhase(new Date(t)));

    return {
      current: {
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        isDay: data.current.is_day,
        time: data.current.time,
        humidity: data.current.relative_humidity_2m,
        apparentTemperature: data.current.apparent_temperature,
        pressure: data.current.surface_pressure,
        aqi: aqData.current?.us_aqi,
        pm10: aqData.current?.pm10,
        pm2_5: aqData.current?.pm2_5,
      },
      hourly: {
        time: data.hourly.time,
        temperature_2m: data.hourly.temperature_2m,
        weathercode: data.hourly.weather_code,
        precipitation_probability: data.hourly.precipitation_probability,
        wind_speed_10m: data.hourly.wind_speed_10m,
        us_aqi: aqData.hourly?.us_aqi || [],
      },
      daily: {
        time: data.daily.time,
        weathercode: data.daily.weather_code,
        temperature_2m_max: data.daily.temperature_2m_max,
        temperature_2m_min: data.daily.temperature_2m_min,
        sunrise: data.daily.sunrise,
        sunset: data.daily.sunset,
        uv_index_max: data.daily.uv_index_max,
        precipitation_sum: data.daily.precipitation_sum,
        wind_speed_10m_max: data.daily.wind_speed_10m_max,
        moon_phase: moonPhases,
        moonrise: data.daily.moonrise || [],
        moonset: data.daily.moonset || [],
      },
      current_units: {
        temperature: data.current_units.temperature_2m,
        wind_speed: data.current_units.wind_speed_10m,
      },
      utcOffsetSeconds: data.utc_offset_seconds || 0,
      timezone: data.timezone || 'UTC'
    };
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};

export const getCityName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`);
    if (!response.ok) throw new Error("Geocoding failed");
    const data = await response.json();
    return data.city || data.locality || data.principalSubdivision || '本地天气';
  } catch (e) {
    console.warn("Geocoding failed, using coordinates", e);
    return `${lat.toFixed(1)}°, ${lon.toFixed(1)}°`;
  }
};

export const searchCity = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];

  try {
    const params = new URLSearchParams({
      name: query,
      count: '10',
      language: 'zh',
      format: 'json'
    });

    const response = await fetch(`${GEOCODING_URL}?${params.toString()}`);
    if (!response.ok) throw new Error("Search failed");

    const data = await response.json();
    return data.results || [];
  } catch (e) {
    console.error("City search error:", e);
    return [];
  }
};
