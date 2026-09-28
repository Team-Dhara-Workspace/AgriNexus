import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Platform, ScrollView, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchWeather } from '../store/slices/weatherSlice';
import { ScreenType } from '../../App';
import { 
  getIoniconsName, 
  getWindDirection, 
  getHumidityStatus, 
  getRainChance, 
  getLocalizedWeatherDescription, 
  getFarmingLightAdvisory 
} from '../utils/weather';
import DroneIcon from '../components/DroneIcon';
import WeatherIllustration from '../components/WeatherIllustration';

type HomeScreenProps = {
  onNavigate: (screen: ScreenType) => void;
  onLogout?: () => void;
};

export default function HomeScreen({ onNavigate, onLogout }: HomeScreenProps) {
  const { t, i18n } = useTranslation();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const languages = [
    { id: 'en', native: 'English' },
    { id: 'ta', native: 'தமிழ்' },
    { id: 'te', native: 'తెలుగు' },
    { id: 'hi', native: 'हिंदी' }
  ];

  const dispatch = useDispatch<AppDispatch>();
  const { data: weatherData, loading: weatherLoading, error: weatherError, lastFetched } = useSelector((state: RootState) => state.weather);
  const [locationName, setLocationName] = useState<string>(t('home.detectingLocation'));
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  });

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const scrollViewRef = useRef<ScrollView>(null);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  useEffect(() => {
    if (weatherData) {
      setLocationName(weatherData.name || t('home.yourLocation'));
    }
  }, [weatherData, t]);

  useEffect(() => {
    // Fetch if no data exists, or if the cache is older than 15 minutes (900000 ms)
    const isStale = !lastFetched || (Date.now() - lastFetched > 900000);

    if (isStale) {
      dispatch(fetchWeather());
    }
  }, [dispatch, lastFetched]);

  const insights = [
    { id: '1', title: t('home.insightMarket'), desc: t('home.insightMarketDesc'), color: '#F0FDF4', iconColor: '#10B981', icon: 'trending-up' },
    { id: '2', title: t('home.insightPest'), desc: t('home.insightPestDesc'), color: '#FEF2F2', iconColor: '#EF4444', icon: 'alert-triangle' },
    { id: '3', title: t('home.insightWeather'), desc: t('home.insightWeatherDesc'), color: '#EFF6FF', iconColor: '#3B82F6', icon: 'cloud-rain' },
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
    { id: 'chat', label: t('home.toolFarmAdvisor'), icon: 'message-circle', screen: 'chat' },
    { id: 'pest', label: t('home.toolPestScan'), icon: 'camera', screen: 'pest' },
    { id: 'drone', label: t('home.toolBookDrone', 'Book Drones'), icon: 'drone', screen: 'drone' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>

        {/* Header / Greeting */}
        <View className="px-6 pt-6 pb-4 flex-row justify-between items-center z-50">
          <View>
            <Text 
              className="text-3xl font-extrabold text-[#0B3D2E] tracking-tight"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              Agri<Text className="text-[#10B981]">Nexus</Text>
            </Text>
          </View>
          <View className="flex-row items-center z-50">
            {/* Language Switcher */}
            <View className="relative z-50 mr-3">
              <TouchableOpacity onPress={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}>
                <View 
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="language" size={18} color="#0B3D2E" />
                </View>
              </TouchableOpacity>

              {isLanguageDropdownOpen && (
                <View
                  className="absolute top-12 right-0 bg-white rounded-xl border border-gray-100 py-1.5"
                  style={{ elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, minWidth: 120 }}
                >
                  {languages.map((lang) => (
                    <TouchableOpacity
                      key={lang.id}
                      className="px-4 py-3 bg-white active:bg-gray-50 flex-row items-center justify-between"
                      onPress={() => {
                        i18n.changeLanguage(lang.id);
                        setIsLanguageDropdownOpen(false);
                      }}
                    >
                      <Text className={`text-sm font-medium ${i18n.language === lang.id ? 'text-[#0B3D2E] font-bold' : 'text-gray-800'}`}>
                        {lang.native}
                      </Text>
                      {i18n.language === lang.id && (
                        <Feather name="check" size={16} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>


            {/* My Account */}
            <View className="relative z-50 ml-1">
              <TouchableOpacity onPress={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}>
                <View 
                  className="w-10 h-10 rounded-full bg-[#0F172A] items-center justify-center shadow-md border border-gray-800"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.18,
                    shadowRadius: 5,
                    elevation: 3,
                  }}
                >
                  <Feather name="user" size={18} color="#10B981" />
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
                      Alert.alert(t('home.settings'), t('home.navigatingToSettings'));
                    }}
                  >
                    <Feather name="settings" size={16} color="#4B5563" />
                    <Text className="text-sm text-gray-800 ml-3 font-medium">{t('home.settings')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="px-4 py-3 bg-white active:bg-gray-50 flex-row items-center"
                    onPress={() => {
                      setIsAccountDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                  >
                    <Feather name="log-out" size={16} color="#EF4444" />
                    <Text className="text-sm text-red-500 ml-3 font-medium">{t('home.logout')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Weather Component */}
        <View className="px-6 mb-7 mt-2">
          <View 
            className="bg-white rounded-3xl p-6"
            style={{
              borderWidth: 2,
              borderColor: '#000000',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.16,
              shadowRadius: 14,
              elevation: 6,
              minHeight: 180,
              justifyContent: 'center',
            }}
          >
            {weatherLoading ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="large" color="#0B3D2E" />
                <Text className="text-gray-400 text-xs mt-3 font-medium">{t('home.detectingLocation')}</Text>
              </View>
            ) : weatherError ? (
              <View className="items-center py-6">
                <Feather name="alert-circle" size={24} color="#EF4444" />
                <Text className="text-red-500 mt-2 text-center text-sm font-medium">{weatherError}</Text>
                <TouchableOpacity 
                  onPress={() => dispatch(fetchWeather())}
                  className="mt-3 px-5 py-2 bg-[#072C1E]/10 rounded-full"
                >
                  <Text className="text-[#0B3D2E] text-xs font-semibold">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : weatherData ? (
              (() => {
                const rainInfo = getRainChance(weatherData);
                const weatherCondition = weatherData.weather[0]?.main || 'Partly Cloudy';
                const weatherDesc = weatherData.weather[0]?.description || weatherCondition;
                const localizedDesc = getLocalizedWeatherDescription(weatherDesc, i18n.language);

                return (
                  <>
                    {/* Top Row: Location with green dot + Telemetry Live badge */}
                    <View className="flex-row justify-between items-center mb-4">
                      <View className="flex-row items-center flex-1 pr-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-[#16A34A] mr-2" />
                        <Text className="text-gray-600 text-xs font-medium" numberOfLines={1}>
                          {locationName} · {currentTime}
                        </Text>
                      </View>
                      <View className="bg-[#DCFCE7] px-3 py-1 rounded-full">
                        <Text className="text-[#15803D] text-[11px] font-bold">Telemetry Live</Text>
                      </View>
                    </View>

                    {/* Middle Row: Temperature, Condition, Subtext & Weather Icon */}
                    <View className="flex-row justify-between items-center mb-5">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-start">
                          <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            {Math.round(weatherData.main.temp)}°
                          </Text>
                          <Text className="text-xl font-normal text-gray-700 mt-1">C</Text>
                        </View>
                        <Text className="text-base font-bold text-gray-900 mt-1">
                          {weatherCondition}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-0.5 font-medium">
                          {localizedDesc}
                        </Text>
                      </View>

                      <View className="w-20 h-20 bg-[#F1F5F9] rounded-2xl items-center justify-center">
                        <WeatherIllustration
                          conditionId={weatherData.weather[0]?.id}
                          iconCode={weatherData.weather[0]?.icon}
                          size={64}
                        />
                      </View>
                    </View>

                    {/* Bottom Row: 3 Metric Cards */}
                    <View className="flex-row justify-between gap-3">
                      {/* Humidity */}
                      <View className="flex-1 bg-[#F8FAFC] rounded-2xl p-3 border border-gray-100">
                        <View className="flex-row items-center mb-1.5">
                          <Feather name="droplet" size={12} color="#0284C7" />
                          <Text className="text-[10px] font-bold text-gray-400 ml-1 tracking-wider uppercase">
                            {t('home.humidity', 'HUMIDITY')}
                          </Text>
                        </View>
                        <Text className="text-sm font-extrabold text-gray-900">
                          {weatherData.main.humidity}%
                        </Text>
                        <Text className="text-[11px] text-gray-500 mt-0.5">
                          {getHumidityStatus(weatherData.main.humidity)}
                        </Text>
                      </View>

                      {/* Wind */}
                      <View className="flex-1 bg-[#F8FAFC] rounded-2xl p-3 border border-gray-100">
                        <View className="flex-row items-center mb-1.5">
                          <Feather name="wind" size={12} color="#0D9488" />
                          <Text className="text-[10px] font-bold text-gray-400 ml-1 tracking-wider uppercase">
                            {t('home.wind', 'WIND')}
                          </Text>
                        </View>
                        <Text className="text-sm font-extrabold text-gray-900">
                          {Math.round(weatherData.wind.speed * 3.6)} <Text className="text-[10px] font-normal text-gray-600">km/h</Text>
                        </Text>
                        <Text className="text-[11px] text-gray-500 mt-0.5">
                          {getWindDirection(weatherData.wind?.deg)}
                        </Text>
                      </View>

                      {/* Rain */}
                      <View className="flex-1 bg-[#F8FAFC] rounded-2xl p-3 border border-gray-100">
                        <View className="flex-row items-center mb-1.5">
                          <Feather name="cloud-rain" size={12} color="#3B82F6" />
                          <Text className="text-[10px] font-bold text-gray-400 ml-1 tracking-wider uppercase">
                            RAIN
                          </Text>
                        </View>
                        <Text className="text-sm font-extrabold text-gray-900">
                          {rainInfo.percent}%
                        </Text>
                        <Text className="text-[11px] text-gray-500 mt-0.5">
                          {rainInfo.status}
                        </Text>
                      </View>
                    </View>
                  </>
                );
              })()
            ) : null}
          </View>
        </View>

        {/* Rapid Diagnosis Section */}
        <View className="px-6 mb-7">
          <View className="flex-row justify-between items-center mb-3.5">
            <Text 
              className="text-xl font-bold text-[#0B3D2E]"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              Rapid Diagnosis
            </Text>
            <Text className="text-xs font-semibold text-[#16A34A]">Instant AI Vision</Text>
          </View>

          <View 
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              {/* Graphic container */}
              <View className="w-18 h-18 bg-[#F2F8F4] rounded-2xl border border-dashed border-[#A7D7B5] items-center justify-center relative mr-4 p-3">
                <Ionicons name="leaf" size={32} color="#16A34A" />
                <View className="w-6 h-6 rounded-full bg-[#0F172A] items-center justify-center absolute -bottom-1 -right-1 border-2 border-white">
                  <Feather name="camera" size={11} color="white" />
                </View>
              </View>

              {/* Text content */}
              <View className="flex-1">
                <View className="bg-[#DCFCE7] px-2.5 py-0.5 rounded-full self-start mb-1.5">
                  <Text className="text-[#15803D] text-[10px] font-bold">
                    {i18n.language === 'ta' ? 'பயிர் நோய் ஸ்கேன்' : i18n.language === 'te' ? 'పంట వ్యాధి స్కాన్' : i18n.language === 'hi' ? 'फसल रोग स्कैन' : 'AI Pest Scan'}
                  </Text>
                </View>
                <Text 
                  className="text-base font-bold text-[#0B3D2E]"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                >
                  Pest & Disease Scan
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Instant AI pest & leaf disease diagnosis.
                </Text>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity 
              className="bg-[#072C1E] rounded-full py-3.5 px-5 flex-row items-center justify-center mt-5 active:opacity-90 shadow-sm"
              onPress={() => onNavigate('pest')}
            >
              <Ionicons name="scan-outline" size={16} color="#10B981" style={{ marginRight: 8 }} />
              <Text className="text-white text-xs font-bold">
                Scan Crop ({i18n.language === 'ta' ? 'ஸ்கேன் செய்க' : i18n.language === 'te' ? 'స్కాన్ చేయండి' : i18n.language === 'hi' ? 'स्कैन करें' : 'Open Camera'})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Smart Farming Tools Section */}
        <View className="px-6 mb-7">
          <View className="flex-row justify-between items-center mb-3.5">
            <Text 
              className="text-xl font-bold text-[#0B3D2E]"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              Smart Farming Tools
            </Text>
            <TouchableOpacity onPress={() => onNavigate('chat')}>
              <Text className="text-xs font-semibold text-[#16A34A]">View All</Text>
            </TouchableOpacity>
          </View>

          {/* Tool 1: AI Farming Assistant */}
          <View 
            className="bg-white rounded-3xl p-6 mb-5 border border-gray-100 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="w-12 h-12 rounded-full bg-[#072C1E] items-center justify-center">
                <Ionicons name="chatbubbles" size={20} color="#10B981" />
              </View>
              <View className="bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                <Text className="text-[#15803D] text-[10px] font-bold">Voice & Text 🎙️</Text>
              </View>
            </View>

            <Text 
              className="text-base font-bold text-[#0B3D2E] mt-3"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              AI Farming Assistant
            </Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {i18n.language === 'ta' ? 'AI உதவியாளர்' : i18n.language === 'te' ? 'AI సహాయకుడు' : i18n.language === 'hi' ? 'AI सहायक' : 'Smart Agronomist'}
            </Text>
            <Text className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Instant voice & text crop advisory in your regional dialect.
            </Text>

            <TouchableOpacity 
              className="bg-[#F4F8F5] rounded-full py-3 px-5 flex-row items-center justify-between mt-4 active:bg-gray-100"
              onPress={() => onNavigate('chat')}
            >
              <Text className="text-xs font-bold text-[#0B3D2E]">Consult Agronomist</Text>
              <Feather name="arrow-right" size={15} color="#0B3D2E" />
            </TouchableOpacity>
          </View>

          {/* Tool 2: Book a Drone */}
          <View 
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="w-12 h-12 rounded-full bg-[#D1FAE5] items-center justify-center">
                <DroneIcon size={22} color="#065F46" />
              </View>
              <View className="bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                <Text className="text-[#15803D] text-[10px] font-bold">Slots Available</Text>
              </View>
            </View>

            <Text 
              className="text-base font-bold text-[#0B3D2E] mt-3"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              Book a Drone
            </Text>
            <Text className="text-xs text-gray-500 font-medium mt-0.5">
              {i18n.language === 'ta' ? 'ட்ரோன் முன்பதிவு' : i18n.language === 'te' ? 'డ్రోన్ బుకింగ్' : i18n.language === 'hi' ? 'ड्रोन बुकिंग' : 'Drone Aerial Spray'}
            </Text>
            <Text className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Aerial crop spraying and NDVI drone field surveys.
            </Text>

            <TouchableOpacity 
              className="bg-[#F4F8F5] rounded-full py-3 px-5 flex-row items-center justify-between mt-4 active:bg-gray-100"
              onPress={() => onNavigate('drone')}
            >
              <Text className="text-xs font-bold text-[#0B3D2E]">Schedule Flight</Text>
              <Feather name="arrow-right" size={15} color="#0B3D2E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Insights Carousel */}
        <View className="mb-8 mt-1">
          <View className="px-6 flex-row justify-between items-center mb-3.5">
            <Text 
              className="text-xl font-bold text-[#0B3D2E]"
              style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
            >
              {t('home.farmInsights')}
            </Text>
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
                className="rounded-3xl p-5 shadow-sm border border-gray-100 flex-row items-center"
                style={{ width: itemWidth, marginRight: index === insights.length - 1 ? 0 : spacing, backgroundColor: item.color }}
              >
                <View className="w-12 h-12 rounded-2xl items-center justify-center bg-white shadow-sm mr-4">
                  <Feather name={item.icon as any} size={22} color={item.iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">{item.title}</Text>
                  <Text className="text-gray-600 text-xs leading-relaxed">{item.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-4">
            {insights.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 mx-1 rounded-full ${index === currentInsightIndex ? 'w-6 bg-[#0B3D2E]' : 'w-1.5 bg-gray-300'}`}
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
