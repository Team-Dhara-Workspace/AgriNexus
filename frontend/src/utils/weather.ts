export const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || "";

export interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
  console.log("Fetching weather with URL:", url); // DEBUG LOG
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Weather fetch error:", error);
    throw new Error(error.message || 'Failed to fetch weather data');
  }
};

export const getIoniconsName = (conditionId: number, iconCode: string): string => {
  const isDay = iconCode.includes('d');

  if (conditionId >= 200 && conditionId < 300) {
    return isDay ? 'thunderstorm-outline' : 'thunderstorm-outline';
  } else if (conditionId >= 300 && conditionId < 400) {
    return 'rainy-outline';
  } else if (conditionId >= 500 && conditionId < 600) {
    return isDay ? 'partly-sunny-outline' : 'rainy-outline';
  } else if (conditionId >= 600 && conditionId < 700) {
    return 'snow-outline';
  } else if (conditionId >= 700 && conditionId < 800) {
    return 'filter-outline';
  } else if (conditionId === 800) {
    return isDay ? 'sunny' : 'moon';
  } else if (conditionId > 800) {
    return isDay ? 'partly-sunny' : 'cloudy-night';
  }

  return 'partly-sunny';
};
