import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { fetchWeatherData, WeatherData } from '../../utils/weather';

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: WeatherState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchWeather = createAsyncThunk(
  'weather/fetchWeather',
  async (_, { rejectWithValue }) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return rejectWithValue('home.locationPermissionDenied'); // Using translation keys
      }

      let location = await Location.getCurrentPositionAsync({});
      const data = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'home.couldNotFetchWeather');
    }
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action: PayloadAction<WeatherData>) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default weatherSlice.reducer;
