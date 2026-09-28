import { Platform } from 'react-native';
import Constants from 'expo-constants';

// The developer machine's current local IP address as detected
const DEV_IP = '10.93.95.111';

const getBackendUrl = (): string => {
  // 1. Allow explicit environment variable override if provided
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }

  if (Platform.OS === 'web') {
    // On web, dynamically resolve to the hostname running the app
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      return `http://${hostname}:8000`;
    }
    return 'http://localhost:8000';
  }

  // On native platforms (Android/iOS), resolve host from modern Expo Go or Expo Config
  const hostUri = 
    Constants.expoConfig?.hostUri || 
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8000`;
    }
  }

  // Fallback to the known local IP if debugger host is not resolved
  return `http://${DEV_IP}:8000`;
};

export const BACKEND_URL = getBackendUrl();
console.log('Backend URL set to:', BACKEND_URL);

