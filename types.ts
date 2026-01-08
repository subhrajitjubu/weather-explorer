
export interface WeatherDataPoint {
  time: string;
  temperature: number; // In Kelvin
  rainfall: number; // In mm
}

export interface WeatherResponse {
  timeseries: WeatherDataPoint[];
}

export interface Location {
  lat: number;
  lon: number;
  name: string;
}
