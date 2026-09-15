import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ConnectScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6] justify-center items-center">
      <Text className="text-xl font-bold text-[#1A744C]">{t('connect.connectTitle')}</Text>
      <Text className="text-gray-500 mt-2">{t('connect.connectComingSoon')}</Text>
    </SafeAreaView>
  );
}
