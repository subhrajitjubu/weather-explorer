
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Cloud, 
  Search, 
  Navigation, 
  MapPin, 
  RefreshCw, 
  Thermometer, 
  Droplets, 
  Sun, 
  Moon, 
  Wind, 
  Maximize2, 
  Minimize2, 
  Film, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Waves, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { fetchWeather, reverseGeocode, fetchLocationSuggestions } from './services/weatherService';
import { getWeatherInsights, getMovieSuggestions, MovieSuggestion } from './services/geminiService';
import { Location, WeatherResponse } from './types';
import WeatherMap from './components/WeatherMap';
import WeatherCharts from './components/WeatherCharts';
import WeatherInsights from './components/WeatherInsights';

const DEFAULT_LOCATION: Location = { lat: 20.5937, lon: 78.9629, name: 'India' };

const App: React.FC = () => {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [movies, setMovies] = useState<MovieSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kelvinToUnit = (k: number) => {
    const c = k - 273.15;
    return unit === 'F' ? (c * 9/5 + 32) : c;
  };

  const loadWeather = useCallback(async (lat: number, lon: number, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon);
      setWeatherData(data);
      const actualName = name || await reverseGeocode(lat, lon);
      setLocation({ lat, lon, name: actualName });
      
      getWeatherInsights(data, actualName, unit).then(setInsights);
      getMovieSuggestions(data).then(setMovies);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Satellite Link Interrupted");
    } finally {
      setLoading(false);
    }
  }, [unit]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
        () => loadWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)
      );
    } else {
      loadWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        const results = await fetchLocationSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const current = weatherData?.timeseries?.[0];
  const displayTemp = current ? kelvinToUnit(current.temperature) : undefined;

  const statCardStyle = (color: string) => `bg-[#0d111d] border-l-4 border-l-${color}-500/50 rounded-2xl p-6 shadow-2xl border border-white/5 transition-all hover:border-white/10`;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#05070a] text-white' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-blue-500/30 transition-colors duration-500 pb-16`}>
      {/* Top Navbar */}
      <nav className="relative z-50 border-b border-white/5 bg-[#05070a]/90 backdrop-blur-xl px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/20 rounded-xl">
            <Cloud className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter uppercase block leading-none">WeatherCatch</span>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-1.5">
              <Clock className="w-3 h-3" /> {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <Calendar className="w-3 h-3 ml-2" /> {currentTime.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="relative max-w-lg w-full mx-10" ref={searchRef}>
          <input
            type="text"
            placeholder="Interrogate planetary coordinates..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-[#111421] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-2xl">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    loadWeather(parseFloat(s.lat), parseFloat(s.lon), s.display_name);
                    setShowSuggestions(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-5 py-3.5 text-left text-[11px] font-semibold hover:bg-blue-500/10 border-b border-white/5 last:border-0 transition-colors"
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10">
            {isDarkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-indigo-500" />}
          </button>
          <button onClick={() => setUnit(unit === 'C' ? 'F' : 'C')} className="text-xs font-black w-12 h-12 flex items-center justify-center border border-white/10 rounded-2xl hover:bg-white/5 transition-all">°{unit}</button>
        </div>
      </nav>

      {error && (
        <div className="mx-10 mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl">
           <AlertCircle className="w-6 h-6 flex-shrink-0" />
           <div className="flex-grow">
             <p className="uppercase tracking-widest text-[10px] mb-1 opacity-60">System Error</p>
             <p>{error}</p>
           </div>
           <button onClick={() => loadWeather(location.lat, location.lon)} className="px-6 py-2 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-all uppercase text-[10px] font-black tracking-widest border border-red-500/20">Reconnect</button>
        </div>
      )}

      <main className="p-10 max-w-[1700px] mx-auto space-y-16">
        {/* Core Metrics - 3 Columns (Cloud Cover Removed) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={statCardStyle('blue')}>
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10"><Thermometer className="w-7 h-7 text-blue-400" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Temperature</p>
                <p className="text-4xl font-black">{loading ? '--' : displayTemp?.toFixed(1)}°{unit}</p>
              </div>
            </div>
          </div>
          <div className={statCardStyle('cyan')}>
            <div className="flex items-center gap-5">
              <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/10"><Droplets className="w-7 h-7 text-cyan-400" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Precipitation</p>
                <p className="text-4xl font-black">{loading ? '--' : current?.rainfall.toFixed(1)} <span className="text-sm text-slate-500 font-bold tracking-normal lowercase ml-1">mm</span></p>
              </div>
            </div>
          </div>
          <div className={statCardStyle('purple')}>
            <div className="flex items-center gap-5">
              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/10"><Wind className="w-7 h-7 text-purple-400" /></div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Pressure</p>
                <p className="text-4xl font-black">1020.7 <span className="text-sm text-slate-500 font-bold tracking-normal lowercase ml-1">hPa</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Temporal Observation Timeline */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-blue-400/80">
             <Navigation className="w-4 h-4 rotate-45" /> Atmospheric Forecast Timeline
          </div>
          <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide">
            {weatherData?.timeseries.slice(0, 14).map((point, i) => {
              const d = new Date(point.time);
              const isActive = i === 0;
              return (
                <div key={i} className={`min-w-[160px] bg-[#0d111d] border ${isActive ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-white/5'} rounded-2xl p-7 text-center transition-all hover:bg-[#151a2e] group`}>
                  <p className={`text-[10px] font-black mb-5 uppercase tracking-tighter ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                    {isActive ? 'CURRENT' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className={`p-4 rounded-full w-fit mx-auto mb-5 transition-transform group-hover:scale-110 ${isActive ? 'bg-blue-500/10' : 'bg-white/5'}`}>
                    <Cloud className={`w-7 h-7 ${point.rainfall > 0 ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-2xl font-black">{kelvinToUnit(point.temperature).toFixed(1)}°</p>
                  <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${point.rainfall > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                    {point.rainfall.toFixed(1)}mm
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Data Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className={`${isMapExpanded ? 'lg:col-span-4' : 'lg:col-span-8'} space-y-10 transition-all duration-700 ease-in-out`}>
             <div className="bg-[#0d111d] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none group-hover:bg-blue-500/10 transition-all" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400 flex items-center gap-3 mb-10">
                  <RefreshCw className="w-4 h-4" /> Thermal Gradient Profile
                </h3>
                <WeatherCharts data={weatherData?.timeseries.slice(0, 24) || []} unit={unit} mode="temp" isDarkMode={isDarkMode} />
             </div>
             
             <div className="bg-[#0d111d] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none group-hover:bg-cyan-500/10 transition-all" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-400 flex items-center gap-3 mb-10">
                  <Waves className="w-4 h-4" /> Rainfall Volume Profile
                </h3>
                <WeatherCharts data={weatherData?.timeseries.slice(0, 24) || []} unit={unit} mode="rain" isDarkMode={isDarkMode} />
             </div>
          </div>

          <div className={`${isMapExpanded ? 'lg:col-span-8 h-[750px]' : 'lg:col-span-4 h-[550px]'} relative transition-all duration-700 ease-in-out bg-[#0d111d] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl ring-1 ring-white/5`}>
            <div className="absolute top-0 left-0 right-0 z-10 p-8 bg-gradient-to-b from-[#05070a] to-transparent flex justify-between items-center pointer-events-none">
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-green-400 flex items-center gap-3 drop-shadow-xl">
                <MapPin className="w-5 h-5" /> Orbital Satellite Imagery
              </h3>
              <button 
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="p-3 bg-black/60 backdrop-blur-xl hover:bg-black/90 rounded-2xl transition-all border border-white/10 pointer-events-auto shadow-2xl active:scale-95"
              >
                {isMapExpanded ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              </button>
            </div>
            <WeatherMap 
              lat={location.lat} 
              lon={location.lon} 
              onMove={loadWeather} 
              currentTemp={current ? current.temperature - 273.15 : undefined}
              unit={unit}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* Skycinema AI Picks Section */}
        <section className="space-y-10 pt-16 border-t border-white/5">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/20">
              <Film className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-blue-50 opacity-90">Skycinema AI Picks</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {movies.length > 0 ? movies.map((movie, idx) => (
              <div key={idx} className="group relative bg-[#0d111d] border border-white/5 rounded-[2rem] p-10 transition-all hover:bg-[#141829] hover:border-blue-500/30 flex flex-col h-full shadow-2xl hover:translate-y-[-8px] duration-500">
                <div className="flex items-center justify-between mb-10">
                  <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[10px] font-black tracking-[0.15em] text-blue-400 uppercase">
                    {movie.genre}
                  </div>
                  <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-50">
                    {movie.mood}
                  </div>
                </div>
                
                <h3 className="text-3xl font-black text-white mb-6 tracking-tight group-hover:text-blue-400 transition-colors leading-tight">
                  {movie.title}
                </h3>
                
                <p className="text-[14px] leading-relaxed text-slate-400 font-medium mb-12 flex-grow opacity-80 group-hover:opacity-100 transition-opacity">
                  {movie.description}
                </p>
                
                <div className="flex items-center justify-between pt-10 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 opacity-40 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">AI Curated</span>
                  </div>
                  <button className="text-[11px] font-black text-blue-400 flex items-center gap-2 uppercase group-hover:gap-5 transition-all group/btn">
                    Suggestions <ChevronRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-all duration-1000" />
              </div>
            )) : (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-[#0d111d]/50 border border-white/5 rounded-[2rem] p-10 h-[22rem] animate-pulse flex flex-col gap-8 shadow-xl">
                  <div className="flex justify-between"><div className="w-24 h-6 bg-white/5 rounded-lg" /><div className="w-20 h-5 bg-white/5 rounded-lg" /></div>
                  <div className="w-3/4 h-12 bg-white/5 rounded-xl" />
                  <div className="w-full h-32 bg-white/5 rounded-2xl" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Intelligence Insights Component */}
        <section className="pt-10">
          <WeatherInsights insights={insights} loading={loading} isDarkMode={isDarkMode} />
        </section>
      </main>

      {/* Futuristic Footer */}
      <footer className="mt-16 py-16 border-t border-white/5 text-center px-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 opacity-30">
             <Cloud className="w-5 h-5" />
             <div className="w-12 h-[1px] bg-slate-500" />
             <Wind className="w-5 h-5" />
             <div className="w-12 h-[1px] bg-slate-500" />
             <Sun className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <div className="text-[11px] font-black tracking-[0.6em] text-slate-700 uppercase">
              WeatherCatch Intelligence // Orbital Node v5.2.4
            </div>
            <div className="text-[9px] font-bold text-slate-800 uppercase tracking-widest flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse" />
              Satellite Synchronized @ {currentTime.toLocaleTimeString()} UTC
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
