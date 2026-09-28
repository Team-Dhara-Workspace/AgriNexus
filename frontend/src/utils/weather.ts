export const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || "d747d59f16dd65ff98130d6144768dfc";

export interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like?: number;
    pressure?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg?: number;
  };
  clouds?: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  pop?: number;
  dt?: number;
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

export const getIoniconsName = (conditionId: number, iconCode: string = '01d'): string => {
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

export const getWindDirection = (deg?: number): string => {
  if (deg === undefined || deg === null) return 'Gentle Breeze';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return `${directions[index]} Breeze`;
};

export const getHumidityStatus = (humidity: number): string => {
  if (humidity >= 70) return 'High range';
  if (humidity >= 40) return 'Optimal';
  return 'Low range';
};

export const getRainChance = (weatherData: WeatherData): { percent: number; status: string } => {
  if (weatherData.pop !== undefined) {
    const percent = Math.round(weatherData.pop * 100);
    const status = percent > 60 ? 'High chance' : percent > 25 ? 'Moderate' : 'Low chance';
    return { percent, status };
  }
  
  if (weatherData.rain && (weatherData.rain['1h'] || weatherData.rain['3h'])) {
    return { percent: 80, status: 'High chance' };
  }

  const id = weatherData.weather[0]?.id || 800;
  if (id >= 200 && id < 600) {
    return { percent: 75, status: 'High chance' };
  }
  
  const cloudCover = weatherData.clouds?.all || 20;
  const estimatedChance = Math.min(Math.round(cloudCover * 0.4), 40);
  const status = estimatedChance > 30 ? 'Moderate' : estimatedChance > 10 ? 'Low chance' : 'No rain';
  return { percent: estimatedChance, status };
};

export const getLocalizedWeatherDescription = (description: string, lang: string): string => {
  const lower = description.toLowerCase();
  
  // Tamil mappings
  if (lang === 'ta') {
    if (lower.includes('clear')) return 'தெளிவான வானம்';
    if (lower.includes('few clouds')) return 'சில மேகங்கள்';
    if (lower.includes('scattered') || lower.includes('broken') || lower.includes('partly')) return 'பகுதி மேகமூட்டம்';
    if (lower.includes('overcast') || lower.includes('cloud')) return 'மேகமூட்டம்';
    if (lower.includes('light rain') || lower.includes('drizzle')) return 'லேசான மழை';
    if (lower.includes('rain')) return 'மழைப்பொழிவு';
    if (lower.includes('thunderstorm')) return 'இடியுடன் கூடிய மழை';
    if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return 'பனிமூட்டம்';
    return 'பகுதி மேகமூட்டம்';
  }

  // Hindi mappings
  if (lang === 'hi') {
    if (lower.includes('clear')) return 'साफ मौसम';
    if (lower.includes('scattered') || lower.includes('broken') || lower.includes('partly')) return 'आंशिक रूप से बादल';
    if (lower.includes('cloud')) return 'बादल छाए रहेंगे';
    if (lower.includes('rain')) return 'बारिश';
    if (lower.includes('thunderstorm')) return 'तूफान';
    return 'आंशिक रूप से बादल';
  }

  // Telugu mappings
  if (lang === 'te') {
    if (lower.includes('clear')) return 'నిర్మలమైన ఆకాశం';
    if (lower.includes('scattered') || lower.includes('broken') || lower.includes('partly')) return 'పాక్షికంగా మేఘావృతం';
    if (lower.includes('cloud')) return 'మేఘావృతమైనది';
    if (lower.includes('rain')) return 'వర్షం';
    if (lower.includes('thunderstorm')) return 'ఉరుములతో కూడిన వర్షం';
    return 'పాక్షికంగా మేఘావృతం';
  }

  return 'Partly Cloudy';
};

export const getFarmingLightAdvisory = (conditionId: number, temp: number): string => {
  if (conditionId >= 200 && conditionId < 600) return 'Rain alert';
  if (temp > 35) return 'High heat';
  if (conditionId === 800) return 'Full sunlight';
  if (conditionId > 800 && conditionId < 804) return 'Ideal light';
  if (conditionId >= 804) return 'Low light';
  return 'Ideal light';
};

