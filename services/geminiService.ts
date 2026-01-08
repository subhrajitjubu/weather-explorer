
import { GoogleGenAI, Type } from "@google/genai";
import { WeatherResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getWeatherInsights(weatherData: WeatherResponse, locationName: string, unit: 'C' | 'F' = 'C') {
  const current = weatherData.timeseries[0];
  const later = weatherData.timeseries[12] || weatherData.timeseries[weatherData.timeseries.length - 1];

  const toDisplayTemp = (kelvin: number) => {
    const celsius = kelvin - 273.15;
    return unit === 'F' ? (celsius * 9/5 + 32).toFixed(1) : celsius.toFixed(1);
  };

  const prompt = `
    Analyze weather for ${locationName}. Use ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}.
    
    DATA:
    - Current Temp: ${toDisplayTemp(current.temperature)}°${unit}
    - Current Rain: ${current.rainfall}mm
    - 12h Forecast Temp: ${toDisplayTemp(later.temperature)}°${unit}
    - 12h Forecast Rain: ${later.rainfall}mm
    
    Tasks:
    1. Short summary.
    2. One specific advice for this temperature/rain.
    3. A professional meteorological insight.
    
    Keep it very concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Insights are currently under maintenance.";
  }
}

export interface MovieSuggestion {
  title: string;
  genre: string;
  mood: string;
  description: string;
}

export async function getMovieSuggestions(weatherData: WeatherResponse): Promise<MovieSuggestion[]> {
  const current = weatherData.timeseries[0];
  const celsius = current.temperature - 273.15;
  const isRaining = current.rainfall > 0;

  const prompt = `
    The current weather is ${celsius.toFixed(1)}°C and ${isRaining ? 'it is raining' : 'it is clear'}.
    Suggest 6 movie titles that fit this specific mood and environmental vibe.
    For each movie, include:
    1. title
    2. genre (short, e.g., ROMANCE, ACTION, THRILLER)
    3. mood (short, e.g., Whimsical, Gritty, Cozy)
    4. description (how it specifically matches the current ${celsius.toFixed(1)}°C and ${isRaining ? 'rainy' : 'clear'} conditions).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              genre: { type: Type.STRING },
              mood: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "genre", "mood", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text) as MovieSuggestion[];
  } catch (error) {
    console.error("Movie fetch failed", error);
    return [
      { title: "Singin' in the Rain", genre: "MUSICAL", mood: "Cheerful", description: "The perfect lighthearted companion for the current rainy conditions." },
      { title: "Blade Runner 2049", genre: "SCI-FI", mood: "Atmospheric", description: "Matches the moody, overcast sky with its stunning visual palette." },
      { title: "About Time", genre: "ROMANCE", mood: "Cozy", description: "A heartwarming tale that feels right at home in today's gentle weather." }
    ];
  }
}
