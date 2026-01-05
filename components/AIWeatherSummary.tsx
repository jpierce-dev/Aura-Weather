import React, { useEffect, useState } from 'react';
import { WeatherData } from '../types';
import { generateWeatherSummary } from '../services/geminiService';
import { Sparkles } from 'lucide-react';

interface AIWeatherSummaryProps {
  data: WeatherData;
  city: string;
  isRefreshing?: boolean;
}

const AIWeatherSummary: React.FC<AIWeatherSummaryProps> = ({ data, city, isRefreshing }) => {
  const [insight, setInsight] = useState<{ summary: string; clothing: string; airQuality?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // 使用一个内部触发器，避免 isRefreshing 频繁切换导致的竞态问题
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const lastCity = React.useRef(city);

  // 当显式刷新（isRefreshing 为 true）或城市改变时，才更新触发器
  useEffect(() => {
    if (isRefreshing || city !== lastCity.current) {
      setRefreshTrigger(prev => prev + 1);
      lastCity.current = city;
    }
  }, [city, isRefreshing]);

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const key = `weather_summary_${city}_${new Date().toDateString()}`;
        // 只有当是因为手动刷新（isRefreshing 为 true）触发时，才跳过缓存
        const cached = isRefreshing ? null : localStorage.getItem(key);

        if (cached && !isRefreshing) {
          setInsight(JSON.parse(cached));
        } else {
          const result = await generateWeatherSummary(data, city);
          if (isMounted) {
            setInsight(result);
            localStorage.setItem(key, JSON.stringify(result));
          }
        }
      } catch (err) {
        console.error("AI Summary failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (data && city) {
      fetchSummary();
    }

    return () => { isMounted = false; };
    // 关键修复：依赖项去掉 isRefreshing，改用 refreshTrigger。
    // 即使 isRefreshing 从 true 变回 false，只要 refreshTrigger 不变，
    // 此 Effect 就不会重启，原来的请求也不会因为 isMounted 变 false 而被放弃。
  }, [data, city, refreshTrigger]);

  if (!process.env.GEMINI_API_KEY && !insight) return null; // Hide if no key and no data

  return (
    <div className="w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <Sparkles size={40} className="text-white" />
      </div>

      <div className="flex items-center space-x-2 mb-2 text-xs font-bold text-indigo-200 uppercase">
        <Sparkles size={12} />
        <span>Gemini 天气分析</span>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      ) : insight ? (
        <div className="space-y-2">
          <p className="text-white text-sm font-medium leading-relaxed">
            "{insight.summary}"
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="bg-white/10 rounded-lg p-2">
              <p className="text-xs text-white/90">
                <span className="font-bold mr-1">穿衣建议:</span> {insight.clothing}
              </p>
            </div>
            {insight.airQuality && (
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-xs text-white/90">
                  <span className="font-bold mr-1">空气质量建议:</span> {insight.airQuality}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AIWeatherSummary;