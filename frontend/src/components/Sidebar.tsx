import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ScreenType } from '../../App';
import { BACKEND_URL } from '../config';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenType) => void;
  currentScreen: ScreenType;
  userId?: number;
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  refreshTrigger?: number;
};

type Chat = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 300);

export default function Sidebar({
  isOpen,
  onClose,
  onNavigate,
  currentScreen,
  userId,
  currentSessionId,
  onSelectSession,
  onNewChat,
  refreshTrigger
}: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSessions = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/chatbot/sessions?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sessions) {
          setChats(data.sessions);
        }
      }
    } catch (err) {
      console.log('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
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
  }, [isOpen, userId, refreshTrigger]);

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
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/chatbot/sessions/${chatId}/delete?user_id=${userId}`, {
                method: 'DELETE'
              });
              const data = await response.json();
              if (data.success) {
                setChats(prev => prev.filter(c => c.id !== chatId));
                if (currentSessionId === chatId) {
                  onNewChat();
                }
              } else {
                Alert.alert("Error", data.error || "Could not delete chat");
              }
            } catch (err) {
              console.error("Error deleting session:", err);
              Alert.alert("Error", "Could not connect to server");
            }
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
        <View className="flex-row items-center justify-between px-5 pt-14 pb-4 border-b border-gray-100 bg-white" style={{ zIndex: 50, elevation: 5 }}>
          <Text className="text-xl font-bold text-gray-900">Menu</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 pt-4">
          {/* New Chat Button */}
          <View className="px-3 mb-4">
            <TouchableOpacity
              onPress={() => {
                onNewChat();
                onClose();
              }}
              className="flex-row items-center justify-center bg-[#1A744C] py-3 px-4 rounded-xl shadow-sm active:bg-[#135939]"
            >
              <Feather name="plus-circle" size={18} color="white" />
              <Text className="text-white font-bold text-base ml-2">New Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Chat List */}
          <View className="px-3">
            <Text className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Chats</Text>
            {isLoading ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#1A744C" />
              </View>
            ) : chats.length === 0 ? (
              <Text className="text-gray-400 text-center mt-6">No recent chats</Text>
            ) : (
              chats.map((chat) => {
                const isActive = currentSessionId === chat.id;
                return (
                  <TouchableOpacity
                    key={chat.id}
                    className={`flex-row items-center justify-between p-3 mb-2 rounded-xl transition-colors ${
                      isActive ? 'bg-[#EAF2ED]' : 'active:bg-gray-50'
                    }`}
                    onPress={() => {
                      onSelectSession(chat.id);
                      onClose();
                    }}
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      <Feather name="message-square" size={18} color={isActive ? "#1A744C" : "#6B7280"} />
                      <Text
                        className={`ml-3 text-base ${isActive ? 'font-bold text-[#1A744C]' : 'text-gray-700'}`}
                        numberOfLines={1}
                      >
                        {chat.title}
                      </Text>
                    </View>

                    <TouchableOpacity
                      className="p-1.5"
                      onPress={() => handleDeleteChat(chat.id, chat.title)}
                    >
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
