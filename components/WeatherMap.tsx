
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Thermometer, Navigation, Droplets } from 'lucide-react';

interface WeatherMapProps {
  lat: number;
  lon: number;
  currentTemp?: number; // In Celsius for icon calculation
  onMove: (lat: number, lon: number, name?: string) => void;
  unit: 'C' | 'F';
  isDarkMode: boolean;
}

const RecenterMap: React.FC<{ lat: number; lon: number }> = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom());
  }, [lat, lon, map]);
  return null;
};

const createWeatherIcon = (temp: number, unit: 'C' | 'F', isDarkMode: boolean) => {
  const displayTemp = unit === 'F' ? (temp * 9/5 + 32) : temp;
  // Dynamic color for icon
  const color = temp > 28 ? (isDarkMode ? '#f97316' : '#ea580c') : temp < 15 ? (isDarkMode ? '#3b82f6' : '#2563eb') : (isDarkMode ? '#10b981' : '#16a34a');
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-white font-black text-[10px] shadow-lg border-2 border-white/20 whitespace-nowrap backdrop-blur-sm transition-all" style="background: ${color}ee">
        <span>${displayTemp.toFixed(1)}°${unit}</span>
      </div>
    `,
    iconSize: [50, 28],
    iconAnchor: [25, 14],
  });
};

const WeatherMap: React.FC<WeatherMapProps> = ({ lat, lon, onMove, currentTemp, unit, isDarkMode }) => {
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        onMove(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const tileUrl = isDarkMode 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative group">
      <MapContainer
        center={[lat, lon]}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        <RecenterMap lat={lat} lon={lon} />
        <MapEvents />

        {currentTemp !== undefined && (
          <Marker 
            position={[lat, lon]} 
            icon={createWeatherIcon(currentTemp, unit, isDarkMode)}
          >
            <Popup className="weather-popup">
              <div className={`p-3 transition-colors ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-white text-slate-900'}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                  <Navigation className="w-3 h-3" /> Station ID: LOCAL
                </p>
                <div className="text-2xl font-black mb-1 leading-tight">
                  {(unit === 'F' ? (currentTemp * 9/5 + 32) : currentTemp).toFixed(1)}°{unit}
                </div>
                <div className={`flex items-center gap-2 text-[9px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                   <Thermometer className={`w-3 h-3 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} /> {lat.toFixed(2)}N, {lon.toFixed(2)}E
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[1000]">
        <div className={`backdrop-blur-xl border p-3 rounded-2xl shadow-xl transition-all ${
          isDarkMode ? 'bg-[#0a0a0f]/80 border-white/10' : 'bg-white/80 border-slate-200'
        }`}>
           <div className={`flex items-center gap-2 text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkMode ? 'bg-cyan-400' : 'bg-blue-600'}`} />
             Live Capture Grid
           </div>
        </div>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper {
          background: ${isDarkMode ? '#0a0a0f' : '#ffffff'} !important;
          color: ${isDarkMode ? 'white' : 'black'} !important;
          border-radius: 16px !important;
          padding: 0 !important;
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip { background: ${isDarkMode ? '#0a0a0f' : '#ffffff'} !important; border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; }
      `}</style>
    </div>
  );
};

export default WeatherMap;
