import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

type LanguageSelectionScreenProps = {
  onLanguageSelected: () => void;
};

export default function LanguageSelectionScreen({ onLanguageSelected }: LanguageSelectionScreenProps) {
  const { t, i18n } = useTranslation();

  const languages = [
    { id: 'ta', name: 'Tamil', native: 'தமிழ்', symbol: 'அ' },
    { id: 'en', name: 'English', native: 'English', symbol: 'A' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు', symbol: 'అ' },
    { id: 'hi', name: 'Hindi', native: 'हिंदी', symbol: 'अ' }
  ];

  const handleSelectLanguage = (langId: string) => {
    i18n.changeLanguage(langId);
    onLanguageSelected();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]" style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header section */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-[#EAF5EF] rounded-full items-center justify-center mb-4 shadow-sm">
            <Feather name="globe" size={28} color="#1A744C" />
          </View>
          <Text className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight text-center">
            Choose Your Language
          </Text>
          <Text className="text-base text-gray-500 text-center px-4">
            Select your preferred language to continue
          </Text>
        </View>

        {/* Language Options Grid */}
        <View className="flex-row flex-wrap justify-between mt-2">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              className={`w-[48%] py-8 justify-center items-center bg-white rounded-[32px] shadow-sm border-2 ${i18n.language === lang.id ? 'border-[#1A744C] bg-[#F0FDF4]' : 'border-gray-100'} active:bg-gray-50 mb-4`}
              onPress={() => handleSelectLanguage(lang.id)}
            >
              <Text className={`text-5xl mb-3 font-semibold ${i18n.language === lang.id ? 'text-[#1A744C]' : 'text-gray-400'}`}>
                {lang.symbol}
              </Text>
              <Text className={`text-xl mb-1 font-bold ${i18n.language === lang.id ? 'text-[#1A744C]' : 'text-gray-800'}`}>
                {lang.native}
              </Text>
              {lang.id !== 'en' && (
                 <Text className={`text-sm font-medium ${i18n.language === lang.id ? 'text-[#1A744C]/80' : 'text-gray-500'}`}>
                   {lang.name}
                 </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
