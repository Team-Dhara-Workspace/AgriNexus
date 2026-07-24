import React, { useState } from 'react';
import { View, Text, SafeAreaView, Platform, StatusBar as RNStatusBar, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  
  const languages = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు' },
    { id: 'hi', name: 'Hindi', native: 'हिंदी' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]" style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
      <View className="flex-1 p-6">
        <View className="items-center mb-8 mt-4">
          <View className="w-24 h-24 bg-[#EAF5EF] rounded-full items-center justify-center mb-4">
            <Feather name="user" size={48} color="#1A744C" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">{t('profile.profileTitle')}</Text>
          <Text className="text-gray-500 text-center">{t('profile.profileDesc')}</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">{t('profile.languageSettings')}</Text>
          
          {languages.map((lang, index) => (
            <TouchableOpacity 
              key={lang.id}
              className={`flex-row items-center justify-between p-4 ${index !== languages.length - 1 ? 'border-b border-gray-50' : ''}`}
              onPress={() => i18n.changeLanguage(lang.id)}
            >
              <View className="flex-row items-center">
                <Ionicons name="language" size={20} color={i18n.language === lang.id ? "#1A744C" : "#9CA3AF"} />
                <View className="ml-3">
                  <Text className={`text-base font-semibold ${i18n.language === lang.id ? 'text-[#1A744C]' : 'text-gray-800'}`}>{lang.native}</Text>
                  {lang.id !== 'en' && <Text className="text-xs text-gray-500">{lang.name}</Text>}
                </View>
              </View>
              {i18n.language === lang.id && (
                <Feather name="check" size={20} color="#1A744C" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
      </View>
    </SafeAreaView>
  );
}
