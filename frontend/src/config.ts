import { Platform } from 'react-native';
import Constants from 'expo-constants';

// The developer machine's current local IP address as detected
const DEV_IP = '10.16.43.111';

const getBackendUrl = (): string => {
  if (Platform.OS === 'web') {
    // On web, dynamically resolve to the hostname running the app
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      return `http://${hostname}:8000`;
    }
    return 'http://localhost:8000';
  }

  // On native platforms (Android/iOS), try to resolve the Expo Go development host IP.
  // hostUri typically looks like: "10.16.43.111:8081"
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      return `http://${ip}:8000`;
    }
  }

  // Fallback to the known local IP if debugger host is not resolved
  return `http://${DEV_IP}:8000`;
};

export const BACKEND_URL = getBackendUrl();
console.log('Backend URL set to:', BACKEND_URL);
