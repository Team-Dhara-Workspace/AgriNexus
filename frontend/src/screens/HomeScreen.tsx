import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ScreenType } from '../../App';
import { fetchWeatherData, WeatherData, getIoniconsName } from '../utils/weather';

type HomeScreenProps = {
  onNavigate: (screen: ScreenType) => void;
  onLogout?: () => void;
};

export default function HomeScreen({ onNavigate, onLogout }: HomeScreenProps) {
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting Location...');

  const scrollViewRef = useRef<ScrollView>(null);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  useEffect(() => {
    (async () => {
      setWeatherLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setWeatherError('Permission to access location was denied');
          setWeatherLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const data = await fetchWeatherData(location.coords.latitude, location.coords.longitude);
        setWeatherData(data);
        setLocationName(data.name || 'Your Location');
      } catch (error: any) {
        setWeatherError(error.message || 'Could not fetch weather');
      } finally {
        setWeatherLoading(false);
      }
    })();
  }, []);

  const insights = [
    { id: '1', title: 'Market Insight', desc: 'Tomato prices are up 15% this week in your region.', color: '#F0FDF4', iconColor: '#10B981', icon: 'trending-up' },
    { id: '2', title: 'Pest Alert', desc: 'Fall Armyworm detected in nearby farms. Check crops.', color: '#FEF2F2', iconColor: '#EF4444', icon: 'alert-triangle' },
    { id: '3', title: 'Weather Warning', desc: 'Heavy rain expected tomorrow. Delay pesticide usage.', color: '#EFF6FF', iconColor: '#3B82F6', icon: 'cloud-rain' },
  ];

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth - 48;
  const spacing = 16;
  const snapInterval = itemWidth + spacing;

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentInsightIndex + 1;
      if (nextIndex >= insights.length) {
        nextIndex = 0;
      }
      setCurrentInsightIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * snapInterval, animated: true });
    }, 3500);
    return () => clearInterval(timer);
  }, [currentInsightIndex, snapInterval, insights.length]);

  const tools = [
    { id: 'chat', label: 'Farm Advisor', icon: 'message-circle', screen: 'chat' },
    { id: 'pest', label: 'Pest Scan', icon: 'camera', screen: 'pest' },
    { id: 'market', label: 'Market', icon: 'dollar-sign', screen: 'market' },
    { id: 'articles', label: 'Articles', icon: 'book-open', screen: 'home' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]" style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        
        {/* Header / Greeting */}
        <View className="px-6 pt-6 pb-4 flex-row justify-between items-center z-50">
          <View>
            <Text className="text-3xl font-extrabold text-[#1A744C]">AgriNexus</Text>
          </View>
          <View className="flex-row items-center z-50">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white border border-gray-100 items-center justify-center shadow-sm">
              <Feather name="bell" size={20} color="#4B5563" />
            </TouchableOpacity>

            {/* My Account */}
            <View className="relative z-50 ml-3">
              <TouchableOpacity onPress={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}>
                <View className="w-10 h-10 rounded-full bg-[#1A744C] items-center justify-center shadow-sm">
                  <Feather name="user" size={18} color="white" />
                </View>
              </TouchableOpacity>

              {isAccountDropdownOpen && (
                <View 
                  className="absolute top-12 right-0 bg-white rounded-xl border border-gray-100 py-1.5" 
                  style={{ elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, minWidth: 140 }}
                >
                  <TouchableOpacity 
                    className="px-4 py-3 bg-white active:bg-gray-50 flex-row items-center border-b border-gray-50"
                    onPress={() => {
                      setIsAccountDropdownOpen(false);
                      Alert.alert("Settings", "Navigating to settings...");
                    }}
                  >
                    <Feather name="settings" size={16} color="#4B5563" />
                    <Text className="text-sm text-gray-800 ml-3 font-medium">Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="px-4 py-3 bg-white active:bg-gray-50 flex-row items-center"
                    onPress={() => {
                      setIsAccountDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                  >
                    <Feather name="log-out" size={16} color="#EF4444" />
                    <Text className="text-sm text-red-500 ml-3 font-medium">Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Weather Component */}
        <View className="px-6 mb-8 mt-2">
          <View className="bg-gradient-to-br from-[#1A744C] to-[#0F4A30] rounded-3xl p-6 shadow-lg relative overflow-hidden" style={{ backgroundColor: '#1A744C', minHeight: 180, justifyContent: 'center' }}>
            <View className="absolute -right-10 -top-10 opacity-10">
              <Feather name="sun" size={160} color="white" />
            </View>
            
            {weatherLoading ? (
               <ActivityIndicator size="large" color="#ffffff" />
            ) : weatherError ? (
               <View className="items-center">
                 <Feather name="alert-circle" size={24} color="#FCA5A5" />
                 <Text className="text-red-200 mt-2 text-center">{weatherError}</Text>
               </View>
            ) : weatherData ? (
               <>
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-white/80 font-medium mb-2 flex-row items-center">
                      <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" /> {locationName}
                    </Text>
                    <Text className="text-5xl font-extrabold text-white mb-2">
                      {Math.round(weatherData.main.temp)}°<Text className="text-2xl font-normal">C</Text>
                    </Text>
                    <Text className="text-white text-base font-medium capitalize">
                      {weatherData.weather[0]?.description || 'Clear'}
                    </Text>
                  </View>
                  
                  <View className="bg-white/20 rounded-2xl p-4 backdrop-blur-md">
                    <Ionicons 
                       name={getIoniconsName(weatherData.weather[0]?.id || 800, weatherData.weather[0]?.icon || '01d') as any} 
                       size={36} 
                       color="white" 
                    />
                  </View>
                </View>
                
                <View className="flex-row items-center mt-6 pt-5 border-t border-white/20">
                  <View className="flex-row items-center mr-6">
                    <Feather name="droplet" size={14} color="rgba(255,255,255,0.8)" />
                    <Text className="text-white/80 ml-2 text-sm font-medium">Humidity {weatherData.main.humidity}%</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Feather name="wind" size={14} color="rgba(255,255,255,0.8)" />
                    <Text className="text-white/80 ml-2 text-sm font-medium">Wind {Math.round(weatherData.wind.speed * 3.6)} km/h</Text>
                  </View>
                </View>
               </>
            ) : null}
          </View>
        </View>



        {/* Tools Grid */}
        <View className="px-6 mb-2">
          <Text className="text-lg font-bold text-gray-900 mb-4">Quick Tools</Text>
          <View className="flex-row flex-wrap justify-between">
            {tools.map((tool) => (
              <TouchableOpacity 
                key={tool.id} 
                className="w-[31%] bg-white rounded-2xl p-4 items-center justify-center mb-4 shadow-sm border border-gray-100 active:bg-gray-50"
                onPress={() => onNavigate(tool.screen as ScreenType)}
              >
                <View className="w-12 h-12 bg-[#F5FAF6] rounded-full items-center justify-center mb-2">
                  <Feather name={tool.icon as any} size={22} color="#1A744C" />
                </View>
                <Text className="text-gray-700 text-xs font-bold text-center leading-tight">{tool.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Insights Carousel */}
        <View className="mb-6 mt-2">
          <View className="px-6 flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Farm Insights</Text>
          </View>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={snapInterval}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 24 }}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
              setCurrentInsightIndex(newIndex);
            }}
          >
            {insights.map((item, index) => (
              <View 
                key={item.id} 
                className="rounded-2xl p-4 shadow-sm border border-gray-100 flex-row items-center"
                style={{ width: itemWidth, marginRight: index === insights.length - 1 ? 0 : spacing, backgroundColor: item.color }}
              >
                <View className="w-12 h-12 rounded-full items-center justify-center bg-white shadow-sm mr-4">
                  <Feather name={item.icon as any} size={24} color={item.iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">{item.title}</Text>
                  <Text className="text-gray-600 text-sm leading-tight">{item.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-4">
            {insights.map((_, index) => (
              <View 
                key={index}
                className={`h-1.5 mx-1 rounded-full ${index === currentInsightIndex ? 'w-6 bg-[#1A744C]' : 'w-1.5 bg-gray-300'}`}
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
