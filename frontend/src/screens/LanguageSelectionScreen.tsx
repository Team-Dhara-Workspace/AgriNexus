import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

type LanguageSelectionScreenProps = {
  onLanguageSelected: () => void;
};

export default function LanguageSelectionScreen({ onLanguageSelected }: LanguageSelectionScreenProps) {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<string>(i18n.language || 'ta');

  const languages = [
    { id: 'ta', name: 'Tamil', native: 'தமிழ்', symbol: 'அ' },
    { id: 'en', name: 'English', native: 'English', symbol: 'A' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు', symbol: 'అ' },
    { id: 'hi', name: 'Hindi', native: 'हिंदी', symbol: 'अ' }
  ];

  const handleSelectLanguage = (langId: string) => {
    setSelectedLang(langId);
    i18n.changeLanguage(langId);
  };

  const handleContinue = () => {
    i18n.changeLanguage(selectedLang);
    onLanguageSelected();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]">
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 48 }} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header section */}
        <View className="items-center mb-10">
          <View 
            className="w-16 h-16 bg-[#072C1E] rounded-2xl items-center justify-center mb-4 shadow-md border border-gray-800"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="language" size={28} color="#10B981" />
          </View>

          <View className="bg-[#DCFCE7] px-3 py-1 rounded-full mb-3">
            <Text className="text-[#15803D] text-[11px] font-bold">Language Setup</Text>
          </View>

          <Text 
            className="text-3xl font-extrabold text-[#0B3D2E] mb-2 tracking-tight text-center"
            style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
          >
            Choose Language
          </Text>
          <Text className="text-sm text-gray-500 text-center px-4 font-medium">
            Select your preferred regional language
          </Text>
        </View>

        {/* Language Options Grid */}
        <View className="flex-row flex-wrap justify-between">
          {languages.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                className={`w-[48%] py-7 px-5 justify-between items-center bg-white rounded-3xl mb-4 border-2 active:opacity-90 ${
                  isSelected ? 'border-[#0B3D2E] bg-[#F0FDF4]' : 'border-gray-100'
                }`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.08 : 0.03,
                  shadowRadius: 10,
                  elevation: isSelected ? 3 : 1,
                  minHeight: 165,
                }}
                onPress={() => handleSelectLanguage(lang.id)}
              >
                <View 
                  className={`w-14 h-14 rounded-2xl items-center justify-center mb-4 ${
                    isSelected ? 'bg-[#072C1E]' : 'bg-[#F1F5F9]'
                  }`}
                >
                  <Text 
                    className={`text-2xl font-bold ${
                      isSelected ? 'text-[#10B981]' : 'text-gray-700'
                    }`}
                  >
                    {lang.symbol}
                  </Text>
                </View>

                <View className="items-center">
                  <Text 
                    className={`text-lg font-bold ${
                      isSelected ? 'text-[#0B3D2E]' : 'text-gray-900'
                    }`}
                    style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
                  >
                    {lang.native}
                  </Text>
                  <Text className="text-xs font-semibold text-gray-500 mt-1">
                    {lang.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue CTA Button */}
        <TouchableOpacity
          className="bg-[#072C1E] rounded-full py-4 px-6 flex-row items-center justify-center mt-8 shadow-md active:opacity-90"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={handleContinue}
        >
          <Text className="text-white text-base font-bold mr-2">
            Continue ({selectedLang === 'ta' ? 'தொடர்க' : selectedLang === 'te' ? 'కొనసాగించండి' : selectedLang === 'hi' ? 'जारी रखें' : 'Continue'})
          </Text>
          <Feather name="arrow-right" size={18} color="#10B981" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
