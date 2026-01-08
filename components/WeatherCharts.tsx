
import React from 'react';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, Bar } from 'recharts';
import { WeatherDataPoint } from '../types';

interface WeatherChartsProps {
  data: WeatherDataPoint[];
  unit: 'C' | 'F';
  mode: 'temp' | 'rain';
  isDarkMode: boolean;
}

const WeatherCharts: React.FC<WeatherChartsProps> = ({ data, unit, mode, isDarkMode }) => {
  const chartData = data.map(point => {
    const celsius = point.temperature - 273.15;
    const temp = unit === 'F' ? (celsius * 9/5 + 32) : celsius;
    const date = new Date(point.time);
    return {
      fullLabel: `${date.getHours()}h`,
      temp: parseFloat(temp.toFixed(1)),
      rain: parseFloat(point.rainfall.toFixed(2))
    };
  });

  if (chartData.length === 0) return null;

  const textColor = isDarkMode ? '#475569' : '#94a3b8';
  const gridColor = isDarkMode ? '#ffffff' : '#000000';
  const accentColor = mode === 'temp' ? '#3b82f6' : '#22d3ee';

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${mode}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.4}/>
              <stop offset="100%" stopColor={accentColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.03} />
          <XAxis 
            dataKey="fullLabel" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: textColor, fontSize: 9, fontWeight: 900 }} 
            interval={2}
          />
          <YAxis hide domain={mode === 'temp' ? ['dataMin - 2', 'dataMax + 2'] : [0, 'auto']} />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#111421', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '12px', 
              fontSize: '10px',
              fontWeight: 900,
              color: '#fff',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
              textTransform: 'uppercase'
            }}
            cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
          />

          {mode === 'temp' ? (
            <Area 
              type="monotone" 
              dataKey="temp" 
              name={`Temp (°${unit})`}
              stroke={accentColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#grad-${mode})`} 
              animationDuration={1500}
            />
          ) : (
            <Bar 
              dataKey="rain" 
              name="Rain (mm)"
              fill={accentColor} 
              radius={[4, 4, 0, 0]}
              opacity={0.6}
              animationDuration={1500}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeatherCharts;
