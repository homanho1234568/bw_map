import React, { useEffect, useState } from 'react';
import { CloudRain, Sun, Cloud, CloudLightning, Umbrella, ThermometerSun, AlertTriangle, Loader2 } from 'lucide-react';

interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipProb: number;
  weatherCode: number;
}

export default function WeatherWidget() {
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=31.18&longitude=121.30&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&forecast_days=14');
        if (!res.ok) throw new Error('Weather API error');
        const data = await res.json();
        
        const targetDates = ['2026-07-10', '2026-07-11', '2026-07-12'];
        const extracted: WeatherData[] = [];
        
        for (let i = 0; i < data.daily.time.length; i++) {
          if (targetDates.includes(data.daily.time[i])) {
            extracted.push({
              date: data.daily.time[i],
              maxTemp: data.daily.temperature_2m_max[i],
              minTemp: data.daily.temperature_2m_min[i],
              precipProb: data.daily.precipitation_probability_max[i],
              weatherCode: data.daily.weather_code[i]
            });
          }
        }
        setForecast(extracted);
      } catch (err) {
        console.error('Failed to fetch weather', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="w-5 h-5 text-amber-500" />;
    if (code === 2 || code === 3) return <Cloud className="w-5 h-5 text-zinc-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudRain className="w-5 h-5 text-blue-300" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (code >= 95) return <CloudLightning className="w-5 h-5 text-purple-500" />;
    return <Cloud className="w-5 h-5 text-zinc-400" />;
  };
  
  const getWeatherDesc = (code: number) => {
    if (code === 0) return '晴朗';
    if (code === 1 || code === 2 || code === 3) return '多雲';
    if (code >= 51 && code <= 67) return '雨天';
    if (code >= 71 && code <= 77) return '下雪';
    if (code >= 80 && code <= 82) return '陣雨';
    if (code >= 95) return '雷雨';
    return '未知';
  };

  if (loading) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-center justify-center h-28 mb-5">
        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (error || forecast.length === 0) {
    return null; 
  }

  const maxTempInPeriod = Math.max(...forecast.map(f => f.maxTemp));
  const maxPrecipInPeriod = Math.max(...forecast.map(f => f.precipProb));
  
  let reminder = '';
  if (maxPrecipInPeriod > 40) {
    reminder = '展期預計有雨，建議隨身攜帶雨具！';
  } else if (maxTempInPeriod >= 32) {
    reminder = '天氣炎熱，請注意防暑降溫，多補充水分！';
  } else {
    reminder = '天氣良好，祝您參展愉快！';
  }

  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-blue-100/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <ThermometerSun className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-blue-950">展期天氣預報 (上海國家會展中心)</h4>
            <p className="text-[11px] text-blue-700 flex items-center gap-1 mt-1 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              {reminder}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {forecast.map((day, idx) => (
          <div key={idx} className="bg-white rounded-lg p-3.5 border border-blue-50 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[11px] font-bold text-zinc-500 uppercase font-mono tracking-wider mb-2.5">
              {day.date.substring(5).replace('-', '/')}
            </span>
            <div className="mb-2.5">
              {getWeatherIcon(day.weatherCode)}
            </div>
            <div className="font-bold text-black text-xs mb-1">{getWeatherDesc(day.weatherCode)}</div>
            <div className="text-[10px] text-zinc-500 flex flex-col gap-1 font-mono">
              <span className="text-zinc-700 font-medium">{Math.round(day.minTemp)}° - {Math.round(day.maxTemp)}°C</span>
              <span className="flex items-center justify-center gap-1 text-blue-500 font-medium">
                <Umbrella className="w-3 h-3" />
                {day.precipProb}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
