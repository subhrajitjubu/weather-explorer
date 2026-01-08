
import { WeatherResponse } from '../types';

/**
 * Use allorigins.win as it wraps the response in a JSON object,
 * which is more resilient to certain CORS header conflicts that 
 * transparent proxies like corsproxy.io might encounter.
 */
const PROXY_URL = "https://api.allorigins.win/get?url=";
const API_BASE = "https://sweatherapi.vercel.app/timeseries";

async function fetchWithProxy(targetUrl: string, timeout = 15000): Promise<any> {
  const urlWithTimestamp = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}cache_bust=${Date.now()}`;
  const proxiedUrl = `${PROXY_URL}${encodeURIComponent(urlWithTimestamp)}`;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(proxiedUrl, { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    
    const data = await response.json();
    if (!data || !data.contents) throw new Error("No contents returned from proxy");

    // AllOrigins returns the target response body as a string in 'contents'
    return JSON.parse(data.contents);
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') throw new Error("Connection timed out");
    throw err;
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const url = `${API_BASE}?lat=${lat}&lon=${lon}`;
  
  try {
    const weatherData = await fetchWithProxy(url, 20000);
    
    if (!weatherData || !weatherData.timeseries) {
      throw new Error("Invalid weather data format received.");
    }
    
    return weatherData as WeatherResponse;
  } catch (error: any) {
    console.error("fetchWeather failure:", error);
    throw new Error(error.message || "Failed to retrieve atmospheric data.");
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
  try {
    const data = await fetchWithProxy(url, 10000);
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `Coord: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}

export async function fetchLocationSuggestions(query: string): Promise<any[]> {
  if (!query || query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  try {
    const data = await fetchWithProxy(url, 10000);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
