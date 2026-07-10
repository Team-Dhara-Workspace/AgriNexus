import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, Alert, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: 'chat' | 'pest') => void;
  currentScreen: 'chat' | 'pest';
};

type Chat = {
  id: string;
  title: string;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 300);

export default function Sidebar({ isOpen, onClose, onNavigate, currentScreen }: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Dummy recent chats data
  const [recentChats, setRecentChats] = useState<Chat[]>([
    { id: '1', title: 'Tomato leaves turning yellow' },
    { id: '2', title: 'Best fertilizer for wheat' },
    { id: '3', title: 'Irrigation schedule for corn' },
  ]);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isOpen]);

  const handleDeleteChat = (chatId: string, chatTitle: string) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${chatTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setRecentChats(prev => prev.filter(c => c.id !== chatId));
          }
        }
      ]
    );
  };

  return (
    <View
      className="absolute top-0 left-0 h-full w-full z-50"
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={{ elevation: 100, zIndex: 100 }}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          className="absolute top-0 left-0 w-full h-full bg-black"
          style={{ opacity: fadeAnim }}
        />
      </TouchableWithoutFeedback>

      {/* Sidebar Content */}
      <Animated.View
        className="absolute top-0 left-0 h-full bg-white shadow-xl"
        style={{
          width: SIDEBAR_WIDTH,
          transform: [{ translateX: slideAnim }]
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-900">Menu</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 pt-4">
          {/* Main Navigation */}
          <View className="px-3 mb-6">
            <Text className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Apps</Text>

            <TouchableOpacity
              className={`flex-row items-center px-3 py-3 mb-1 rounded-xl transition-colors ${currentScreen === 'chat' ? 'bg-[#E6F4FE]' : 'active:bg-gray-50'}`}
              onPress={() => onNavigate('chat')}
            >
              <Feather name="message-circle" size={20} color={currentScreen === 'chat' ? '#18553F' : '#6B7280'} />
              <Text className={`ml-3 text-base ${currentScreen === 'chat' ? 'text-[#18553F] font-bold' : 'text-gray-700'}`}>
                Chat Assistant
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center px-3 py-3 rounded-xl transition-colors ${currentScreen === 'pest' ? 'bg-[#E6F4FE]' : 'active:bg-gray-50'}`}
              onPress={() => onNavigate('pest')}
            >
              <Feather name="target" size={20} color={currentScreen === 'pest' ? '#18553F' : '#6B7280'} />
              <Text className={`ml-3 text-base ${currentScreen === 'pest' ? 'text-[#18553F] font-bold' : 'text-gray-700'}`}>
                Pest & Disease Detection
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chat List */}
          <View className="px-3">
            <Text className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Chats</Text>
            {recentChats.length === 0 ? (
              <Text className="text-gray-400 text-center mt-10">No recent chats</Text>
            ) : (
              recentChats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  className="flex-row items-center justify-between p-3 mb-2 rounded-xl active:bg-gray-50 transition-colors"
                  onPress={() => {
                    // Load chat logic would go here
                    onClose();
                  }}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <Feather name="message-square" size={18} color="#1A744C" />
                    <Text className="text-gray-700 ml-3 text-base" numberOfLines={1}>
                      {chat.title}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleDeleteChat(chat.id, chat.title)}
                  >
                    <Feather name="trash-2" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {/* Account Footer */}
        <TouchableOpacity className="flex-row items-center px-6 py-6 border-t border-gray-100 bg-gray-50">
          <View className="w-10 h-10 rounded-full bg-[#1A744C] items-center justify-center">
            <Feather name="user" size={20} color="white" />
          </View>
          <View className="ml-3">
            <Text className="text-gray-900 font-semibold text-base">My Account</Text>
            <Text className="text-gray-500 text-sm">Farm Details & Settings</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
