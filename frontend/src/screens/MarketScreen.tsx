import React from 'react';
import { View, Text, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function MarketScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]" style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}>
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-20 h-20 bg-[#EAF5EF] rounded-full items-center justify-center mb-6">
          <Feather name="trending-up" size={40} color="#1A744C" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">{t('market.marketTitle')}</Text>
        <Text className="text-gray-500 text-center">{t('market.marketDesc')}</Text>
      </View>
    </SafeAreaView>
  );
}
