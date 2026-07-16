import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ScreenType } from '../../App';

type BottomNavbarProps = {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
};

export default function BottomNavbar({ currentScreen, onNavigate }: BottomNavbarProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'chat', label: 'Chat', icon: 'message-circle' },
    { id: 'market', label: 'Market', icon: 'trending-up' },
    { id: 'connect', label: 'Connect', icon: 'users' },
  ] as const;

  return (
    <View 
      className="flex-row justify-around items-center bg-white border-t border-gray-100 pb-5 pt-3"
      style={{ paddingBottom: Platform.OS === 'ios' ? 24 : 12 }}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            className="items-center justify-center flex-1"
            onPress={() => onNavigate(tab.id as ScreenType)}
          >
            <View className={`p-2 rounded-xl ${isActive ? 'bg-[#EAF5EF]' : 'bg-transparent'}`}>
              <Feather 
                name={tab.icon as any} 
                size={22} 
                color={isActive ? '#1A744C' : '#9CA3AF'} 
              />
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
