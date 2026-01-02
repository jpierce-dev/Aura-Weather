
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, Navigation, Clock, Trash2 } from 'lucide-react';
import { searchCity, SearchResult } from '../services/weatherService';
import { SavedCity } from '../types';

interface CitySearchModalProps {
  onClose: () => void;
  onSelect: (lat: number, lon: number, name: string) => void;
  recentCities: SavedCity[];
  currentLocation: SavedCity | null;
  onDeleteHistory?: (name: string) => void; // Added prop
}

const CitySearchModal: React.FC<CitySearchModalProps> = ({ onClose, onSelect, recentCities, currentLocation, onDeleteHistory }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        const data = await searchCity(query);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const hasHistory = recentCities.length > 0;
  const isSearching = query.length >= 2;

  const handleDelete = (e: React.MouseEvent, name: string) => {
    e.stopPropagation(); // Prevent triggering the select action
    if (onDeleteHistory) {
      onDeleteHistory(name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Header - Added extra padding top to clear status bar comfortably */}
      <div className="flex items-center px-4 pb-4 pt-[calc(env(safe-area-inset-top)+20px)]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索城市 (例如: 北京, Tokyo)"
            className="w-full bg-white/10 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-white font-medium hover:text-white/80 transition-colors"
        >
          取消
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-safe-bottom">
        
        {/* State: Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-white/50" />
          </div>
        )}

        {/* State: Show History & Current Location (When NOT searching) */}
        {!isSearching && !loading && (
          <div className="space-y-6 pt-2">
            
            {/* Current Location Section */}
            {currentLocation && (
              <div className="space-y-2">
                 <div className="text-xs font-semibold text-white/40 uppercase tracking-wider px-1">当前位置</div>
                 <button
                    onClick={() => onSelect(currentLocation.lat, currentLocation.lon, currentLocation.name)}
                    className="w-full text-left p-4 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/20 transition-all active:scale-[0.99] flex items-center gap-3 group"
                  >
                    <Navigation size={18} className="text-blue-400 group-hover:text-blue-300" />
                    <div className="flex-1">
                      <div className="text-white font-medium text-lg">{currentLocation.name}</div>
                      <div className="text-white/50 text-xs">GPS 定位</div>
                    </div>
                  </button>
              </div>
            )}

            {/* Recent History Section */}
            {hasHistory && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                   <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">历史记录</div>
                </div>
                
                <div className="space-y-2">
                  {recentCities.map((city, idx) => (
                    <div
                      key={`${city.name}-${idx}`}
                      className="relative group"
                    >
                      <button
                        onClick={() => onSelect(city.lat, city.lon, city.name)}
                        className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors active:scale-[0.99] flex items-center justify-between pr-12"
                      >
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-white/30" />
                          <div className="text-white font-medium text-lg">{city.name}</div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, city.name)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!currentLocation && !hasHistory && (
               <div className="text-center text-white/30 py-12 text-sm">
                 输入城市名称开始搜索
               </div>
            )}
          </div>
        )}

        {/* State: Search Results */}
        {isSearching && !loading && (
          <div className="space-y-2">
            {results.map((city) => (
              <button
                key={city.id}
                onClick={() => onSelect(city.latitude, city.longitude, city.name)}
                className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors active:scale-[0.99] flex items-center justify-between group"
              >
                <div>
                  <div className="text-white font-medium text-lg">{city.name}</div>
                  <div className="text-white/50 text-sm">
                    {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                  </div>
                </div>
                <MapPin size={18} className="text-white/30 group-hover:text-white/70 transition-colors" />
              </button>
            ))}
            
            {results.length === 0 && (
              <div className="text-center text-white/40 py-8">
                未找到相关城市
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySearchModal;
