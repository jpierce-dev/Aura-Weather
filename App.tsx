
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { WeatherData, GeoLocation, SavedCity } from './types';
import { fetchWeatherData, getCityName } from './services/weatherService';
import DynamicBackground from './components/DynamicBackground';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherGrid from './components/WeatherGrid';
import AirQualityForecast from './components/AirQualityForecast';
import AIWeatherSummary from './components/AIWeatherSummary';
import CitySearchModal from './components/CitySearchModal';
import { Loader2, MapPinOff, Plus } from 'lucide-react';

const DUBAI_COORDS = { lat: 25.2048, lon: 55.2708 };

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    try {
      const saved = localStorage.getItem('lastWeather');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [city, setCity] = useState<string>(() => {
    return localStorage.getItem('lastCity') || '加载中...';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(() => {
    try {
      const saved = localStorage.getItem('lastLocation');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Pull to Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // History & GPS State
  const [recentCities, setRecentCities] = useState<SavedCity[]>(() => {
    try {
      const saved = localStorage.getItem('recentCities');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [gpsLocation, setGpsLocation] = useState<SavedCity | null>(null);
  const initialLoadStarted = useRef(false);

  const loadData = useCallback(async (lat: number, lon: number, cityNameOverride?: string) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const [weatherData, fetchedCityName] = await Promise.all([
        fetchWeatherData({ lat, lon }),
        cityNameOverride ? Promise.resolve(cityNameOverride) : getCityName(lat, lon)
      ]);

      setWeather(weatherData);
      const finalCityName = cityNameOverride || fetchedCityName;
      setCity(finalCityName);
      const newLocation = { lat, lon };
      setLocation(newLocation);

      // Cache the data
      localStorage.setItem('lastWeather', JSON.stringify(weatherData));
      localStorage.setItem('lastCity', finalCityName);
      localStorage.setItem('lastLocation', JSON.stringify(newLocation));

      return fetchedCityName;
    } catch (err) {
      setError('无法获取天气数据，请重试。');
      throw err;
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [isRefreshing]);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;

    // 1. If we have cached data, trigger a silent refresh for the cached location first
    // so the user sees updated data for what's currently on screen.
    if (location && weather) {
      loadData(location.lat, location.lon, city).catch(() => { });
    }

    // 2. Always attempt to get current Geolocation to support "auto-locate" feature.
    // If the user moved, this will eventually override the cached city with the current GPS city.
    const handleDefaultLocation = () => {
      // Only fallback to Dubai if we have absolutely no data (no cache, no GPS)
      if (!location) {
        console.warn("Using default location: Dubai");
        loadData(DUBAI_COORDS.lat, DUBAI_COORDS.lon);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Fetch name for GPS location specifically to store it
            const gpsCityName = await getCityName(latitude, longitude);
            setGpsLocation({ name: gpsCityName, lat: latitude, lon: longitude });
            // Load fresh data for the ACTUAL current location
            await loadData(latitude, longitude, gpsCityName);
          } catch (e) {
            // If fetching name fails, still load weather for coords
            loadData(latitude, longitude);
          }
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          // If GPS fails, and we don't have cache, use default.
          // If we have cache, we just stay on cache (which we refreshed above).
          if (!location) handleDefaultLocation();
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes 
        }
      );
    } else {
      if (!location) handleDefaultLocation();
    }
  }, [loadData]); // Keep dependencies minimal to avoid loops

  const handleCitySelect = (lat: number, lon: number, name: string) => {
    setIsSearchOpen(false);

    // Update Recent Cities
    const newCity: SavedCity = { name, lat, lon };
    // Filter duplicates (by name) and keep last 5, adding new one to top
    const updatedRecents = [newCity, ...recentCities.filter(c => c.name !== name)].slice(0, 5);

    setRecentCities(updatedRecents);
    localStorage.setItem('recentCities', JSON.stringify(updatedRecents));

    loadData(lat, lon, name);
  };

  const handleDeleteHistory = (name: string) => {
    const updatedRecents = recentCities.filter(c => c.name !== name);
    setRecentCities(updatedRecents);
    localStorage.setItem('recentCities', JSON.stringify(updatedRecents));
  };

  // --- Pull to Refresh Logic ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY > 0 && scrollRef.current && scrollRef.current.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY;
      if (diff > 0) {
        // Prevent browser's native pull-to-refresh (especially on Android Chrome)
        if (e.cancelable) e.preventDefault();
        // Add resistance
        setPullDistance(Math.min(diff * 0.4, 120));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60 && location) {
      setIsRefreshing(true);
      loadData(location.lat, location.lon, city); // Reload current
    } else {
      setPullDistance(0);
    }
    setPullStartY(0);
  };

  if (loading && !weather && !isRefreshing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>正在获取预报...</p>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
        <MapPinOff size={48} className="mb-4 text-red-400" />
        <p className="text-xl font-bold mb-2">出错了!</p>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Layer - Z Index 0 */}
      {weather && (
        <DynamicBackground
          weatherCode={weather.current.weatherCode}
          isDay={weather.current.isDay}
        />
      )}

      {/* Top Right Add Button - Z Index 40 */}
      <div className="fixed top-safe-top right-0 z-40 p-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-all active:scale-95 border border-white/10 shadow-lg"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <CitySearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelect={handleCitySelect}
          recentCities={recentCities}
          currentLocation={gpsLocation}
          onDeleteHistory={handleDeleteHistory}
        />
      )}

      {/* Refresh/Initial Loading Indicator - Z Index 30 */}
      <div
        className="fixed top-safe-top left-0 right-0 z-30 flex justify-center pointer-events-none transition-transform duration-200"
        style={{ transform: `translateY(${(pullDistance > 0 || (loading && weather)) ? pullDistance + 20 : -50}px)` }}
      >
        <div className="bg-black/30 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/10">
          <Loader2 className={`text-white ${(isRefreshing || (loading && weather) || pullDistance > 60) ? 'animate-spin' : ''}`} size={20} />
        </div>
      </div>

      {/* Main Content Scroll Area - Z Index 10 */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 h-screen overflow-y-auto no-scrollbar pt-safe-top pb-safe-bottom transition-transform duration-200 overscroll-none"
        style={{ transform: `translateY(${pullDistance}px)`, overscrollBehaviorY: 'none' }}
      >
        <div className="max-w-2xl mx-auto px-4 md:px-8 pb-10">

          {weather && (
            <>
              {/* Header / Current */}
              <CurrentWeather data={weather} city={city} />

              {/* Content Grid */}
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* AI Summary */}
                <AIWeatherSummary
                  data={weather}
                  city={city}
                  isRefreshing={isRefreshing}
                />

                {/* Hourly List */}
                <HourlyForecast data={weather} />

                {/* 15-Day List */}
                <DailyForecast data={weather} />

                {/* Air Quality Forecast (Moved Outside) */}
                <AirQualityForecast data={weather} />

                {/* Details Grid */}
                <WeatherGrid data={weather} />

                {/* Footer Attribution */}
                <div className="text-center text-white/40 text-xs py-4">
                  天气数据来源 Open-Meteo
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
