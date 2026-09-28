import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Keyboard, Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenType } from '../../App';
import DroneIcon from './DroneIcon';

type BottomNavbarProps = {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
};

export default function BottomNavbar({ currentScreen, onNavigate }: BottomNavbarProps) {
  const { t } = useTranslation();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  const tabs = [
    { id: 'home', label: t('navbar.home', 'Home'), icon: 'home' },
    { id: 'chat', label: t('navbar.chat', 'Chat'), icon: 'message-circle' },
    { id: 'pest', label: t('navbar.pest', 'Pest'), icon: 'camera' },
    { id: 'drone', label: t('navbar.drone', 'Book Drone'), icon: 'drone' },
  ] as const;

  const handleTabPress = (tabId: string) => {
    if (tabId === 'drone') {
      Linking.openURL('tel:9342451403').catch(() => {
        Alert.alert(t('navbar.drone', 'Book Drone'), 'Please call +91 9342451403 to book your agricultural drone service.');
      });
      return;
    }
    onNavigate(tabId as ScreenType);
  };

  return (
    <View
      className="flex-row justify-around items-center bg-white border-t border-gray-100 pt-3"
      style={{ paddingBottom: Platform.OS === 'ios' ? 24 : 36 }}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        const iconColor = isActive ? '#1A744C' : '#9CA3AF';

        return (
          <TouchableOpacity
            key={tab.id}
            className="items-center justify-center flex-1"
            onPress={() => handleTabPress(tab.id)}
          >
            <View className={`p-2 rounded-xl ${isActive ? 'bg-[#EAF5EF]' : 'bg-transparent'}`}>
              {tab.id === 'drone' ? (
                <DroneIcon
                  size={22}
                  color={iconColor}
                />
              ) : (
                <Feather
                  name={tab.icon as any}
                  size={22}
                  color={iconColor}
                />
              )}
            </View>
            <Text
              className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#1A744C]' : 'text-gray-400'}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
