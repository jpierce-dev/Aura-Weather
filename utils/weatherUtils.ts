
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Moon, Sun, Wind } from 'lucide-react';
import { WeatherType } from '../types';

// WMO Weather interpretation codes (WW)
export const getWeatherType = (code: number): WeatherType => {
  if (code === 0) return WeatherType.Clear;
  if (code >= 1 && code <= 3) return WeatherType.Cloudy;
  if (code === 45 || code === 48) return WeatherType.Fog;
  if (code >= 51 && code <= 57) return WeatherType.Drizzle;
  if (code >= 61 && code <= 67) return WeatherType.Rain;
  if (code >= 71 && code <= 77) return WeatherType.Snow;
  if (code >= 80 && code <= 82) return WeatherType.Rain;
  if (code >= 85 && code <= 86) return WeatherType.Snow;
  if (code >= 95 && code <= 99) return WeatherType.Thunderstorm;
  return WeatherType.Clear;
};

export const getWeatherDescription = (code: number): string => {
  const map: Record<number, string> = {
    0: '晴朗',
    1: '大致晴朗',
    2: '多云',
    3: '阴天',
    45: '雾',
    48: '冻雾',
    51: '毛毛雨',
    53: '中度毛毛雨',
    55: '密毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '阵雨',
    81: '中度阵雨',
    82: '暴雨',
    85: '阵雪',
    86: '大阵雪',
    95: '雷雨',
    96: '雷雨伴有冰雹',
    99: '强雷雨伴有冰雹',
  };
  return map[code] || '未知';
};

export const getIconForWeather = (code: number, isDay: number = 1) => {
  const type = getWeatherType(code);
  if (type === WeatherType.Clear) return isDay ? Sun : Moon;
  switch (type) {
    case WeatherType.Cloudy: return Cloud;
    case WeatherType.Fog: return CloudFog;
    case WeatherType.Drizzle: return CloudDrizzle;
    case WeatherType.Rain: return CloudRain;
    case WeatherType.Snow: return CloudSnow;
    case WeatherType.Thunderstorm: return CloudLightning;
    default: return Sun;
  }
};

export const getCityLocalTime = (utcOffsetSeconds: number): Date => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (utcOffsetSeconds * 1000));
};

export const formatCityTime = (isoString: string): string => {
  const parts = isoString.split('T');
  if (parts.length < 2) return '--:--';
  return parts[1].substring(0, 5); // "HH:MM"
};

export const parseCityDate = (isoString: string): Date => {
  return new Date(isoString + "Z");
};

export const getDayName = (isoString: string, utcOffsetSeconds: number = 0): string => {
  const date = parseCityDate(isoString);
  const cityNow = getCityLocalTime(utcOffsetSeconds);

  // Set times to midnight for accurate day comparison
  const d1 = new Date(date.getTime());
  d1.setUTCHours(0, 0, 0, 0);
  const d2 = new Date(cityNow.getTime());
  d2.setUTCHours(0, 0, 0, 0);

  if (d1.getTime() === d2.getTime()) return '今天';

  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getUTCDay()];
};

export const getWindScale = (speedKmh: number): number => {
  if (speedKmh < 1) return 0;
  if (speedKmh < 6) return 1;
  if (speedKmh < 12) return 2;
  if (speedKmh < 20) return 3;
  if (speedKmh < 29) return 4;
  if (speedKmh < 39) return 5;
  if (speedKmh < 50) return 6;
  if (speedKmh < 62) return 7;
  if (speedKmh < 75) return 8;
  if (speedKmh < 89) return 9;
  if (speedKmh < 103) return 10;
  if (speedKmh < 117) return 11;
  return 12;
};

export const getAQIDescription = (aqi: number) => {
  if (aqi <= 50) return { label: "优", color: "text-green-400", percentage: (aqi / 50) * 100 };
  if (aqi <= 100) return { label: "良", color: "text-yellow-400", percentage: ((aqi - 50) / 50) * 100 };
  if (aqi <= 150) return { label: "轻度污染", color: "text-orange-400", percentage: ((aqi - 100) / 50) * 100 };
  if (aqi <= 200) return { label: "中度污染", color: "text-red-400", percentage: ((aqi - 150) / 50) * 100 };
  if (aqi <= 300) return { label: "重度污染", color: "text-purple-400", percentage: ((aqi - 200) / 100) * 100 };
  return { label: "严重污染", color: "text-red-900", percentage: 100 };
};

export const getMoonPhaseDescription = (phase: number) => {
  if (phase > 0.95 || phase <= 0.05) return "新月";
  if (phase > 0.05 && phase < 0.20) return "娥眉月";
  if (phase >= 0.20 && phase <= 0.30) return "上弦月";
  if (phase > 0.30 && phase < 0.45) return "盈凸月";
  if (phase >= 0.45 && phase <= 0.55) return "满月";
  if (phase > 0.55 && phase < 0.70) return "亏凸月";
  if (phase >= 0.70 && phase <= 0.80) return "下弦月";
  return "残月";
};

export const calculateMoonPhase = (date: Date): number => {
  const synodic = 29.53058867;
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)).getTime();
  const diff = date.getTime() - knownNewMoon;
  const days = diff / (1000 * 60 * 60 * 24);
  const cycles = days / synodic;
  let phase = cycles % 1;
  if (phase < 0) phase += 1;
  return phase;
};
