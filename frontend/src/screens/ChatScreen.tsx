import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, Alert, ScrollView, StatusBar as RNStatusBar, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import { BACKEND_URL } from '../config';
import { renderFormattedMessage } from '../utils/markdown';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isLoading?: boolean;
};

type ChatScreenProps = {
  onOpenSidebar: () => void;
  onLogout: () => void;
};

export default function ChatScreen({ onOpenSidebar, onLogout }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Language state
  const languages = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు' },
    { id: 'hi', name: 'Hindi', native: 'हिंदी' }
  ];
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      Alert.alert("File Selected", `You selected: ${file.name}`);
    } catch (err) {
      console.log('Error picking document', err);
      Alert.alert("Error", "Could not pick document");
    }
  };

  const handleMicPress = () => {
    Alert.alert("Voice Recording", "Microphone feature is coming soon!");
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 0) {
      const userMessageId = Date.now().toString();
      const userMessage: Message = {
        id: userMessageId,
        text: trimmedMessage,
        sender: 'user',
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');

      // Add a placeholder bot message with loading status
      const botMessageId = (Date.now() + 1).toString();
      const botMessagePlaceholder: Message = {
        id: botMessageId,
        text: '',
        sender: 'bot',
        isLoading: true,
      };
      setMessages(prev => [...prev, botMessagePlaceholder]);

      try {
        const url = `${BACKEND_URL}/chatbot/chat?query=${encodeURIComponent(trimmedMessage)}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const processedText = data.response ? data.response.trim() : "Sorry, I received an invalid response.";

        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? { ...msg, text: processedText, isLoading: false }
              : msg
          )
        );
      } catch (err) {
        console.log('Error fetching response:', err);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? {
                ...msg,
                text: "Failed to connect to the advisory server. Please ensure the server is running and try again.",
                isLoading: false
              }
              : msg
          )
        );
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]" style={Platform.OS === 'web' ? ({ height: '100vh' } as any) : undefined}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View
          className="flex-row justify-between items-center px-6 pb-2 bg-[#F5FAF6] z-50"
          style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 12 : 20, zIndex: 50, elevation: 5 }}
        >
          <TouchableOpacity onPress={onOpenSidebar}>
            <Feather name="menu" size={24} color="#18553F" />
          </TouchableOpacity>
          
          <View className="flex-row items-center z-50">
            {/* Language Dropdown */}
            <View className="mr-3 relative z-50">
              <TouchableOpacity 
                onPress={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex-row items-center bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm"
              >
                <Ionicons name="language" size={16} color="#4B5563" />
                <Text className="text-sm text-gray-800 mx-2 font-semibold">{selectedLanguage.native}</Text>
                <Feather name={isLangDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#4B5563" />
              </TouchableOpacity>

              {isLangDropdownOpen && (
                <View 
                  className="absolute top-11 right-0 bg-white rounded-xl border border-gray-100 py-1.5" 
                  style={{ elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, minWidth: 140 }}
                >
                  {languages.map((lang) => (
                    <TouchableOpacity 
                      key={lang.id} 
                      className={`px-4 py-3 bg-white active:bg-gray-50 flex-row items-center justify-between border-b border-gray-50 last:border-b-0 ${selectedLanguage.id === lang.id ? 'bg-[#E6F4FE]/50' : ''}`}
                      onPress={() => {
                        setSelectedLanguage(lang);
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      <View>
                        <Text className={`text-sm ${selectedLanguage.id === lang.id ? 'text-[#18553F] font-bold' : 'text-gray-800 font-medium'}`}>
                          {lang.native}
                        </Text>
                        {lang.id !== 'en' && (
                          <Text className="text-[11px] text-gray-500 mt-0.5">{lang.name}</Text>
                        )}
                      </View>
                      {selectedLanguage.id === lang.id && (
                        <Feather name="check" size={16} color="#18553F" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* My Account */}
            <View className="relative z-50">
              <TouchableOpacity onPress={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}>
                <View className="w-9 h-9 rounded-full bg-[#1A744C] items-center justify-center shadow-sm">
                  <Feather name="user" size={18} color="white" />
                </View>
              </TouchableOpacity>

              {isAccountDropdownOpen && (
                <View 
                  className="absolute top-11 right-0 bg-white rounded-xl border border-gray-100 py-1.5" 
                  style={{ elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, minWidth: 140 }}
                >
                  <TouchableOpacity 
                    className="px-4 py-3 bg-white active:bg-gray-50 flex-row items-center border-b border-gray-50"
                    onPress={() => {
                      setIsAccountDropdownOpen(false);
                      Alert.alert("Settings", "Navigating to settings...");
                    }}
                  >
                    <Feather name="settings" size={16} color="#4B5563" />
                    <Text className="text-sm text-gray-800 ml-3 font-medium">Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="px-4 py-3 bg-white active:bg-gray-50 flex-row items-center"
                    onPress={() => {
                      setIsAccountDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <Feather name="log-out" size={16} color="#EF4444" />
                    <Text className="text-sm text-red-500 ml-3 font-medium">Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Main Content Area */}
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6" style={{ flexGrow: 1 }}>


            {/* Heading */}
            <Text className="text-[28px] font-extrabold text-gray-900 text-center leading-tight">
              How can I help your{"\n"}farm today?
            </Text>

            {/* Subtitle */}
            <Text className="text-sm text-gray-500 text-center mt-4 leading-relaxed px-1">
              Ask about crops, soil, fertilizers, pests, weather insights, irrigation planning, disease detection, yield improvement, or farming recommendations.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-4 pt-4"
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`mb-4 max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'user'
                  ? 'bg-[#1A744C] self-end rounded-tr-sm'
                  : 'bg-white border border-gray-100 self-start rounded-tl-sm shadow-sm'
                  }`}
              >
                {msg.isLoading ? (
                  <View className="flex-row items-center justify-center py-1.5 px-3">
                    <ActivityIndicator size="small" color="#1A744C" />
                  </View>
                ) : (
                  <View className="flex-col">
                    {renderFormattedMessage(msg.text, msg.sender === 'user')}
                  </View>
                )}
              </View>
            ))}
            {/* Bottom padding to prevent last message hiding behind input */}
            <View className="h-6" />
          </ScrollView>
        )}

        {/* Bottom Input Area */}
        <View className="px-5 pb-8 pt-2 bg-[#F5FAF6]">
          <View className="flex-row items-end min-h-[60px] bg-white border border-gray-200 rounded-[30px] pl-2.5 pr-1.5 py-1.5 shadow-sm relative">
            <TouchableOpacity
              onPress={handlePickDocument}
              className="w-[38px] h-[38px] rounded-full items-center justify-center bg-[#EAF2ED] mb-1.5 active:bg-[#D4E8DC] transition-colors duration-200"
            >
              <Feather name="plus" size={20} color="#1A744C" />
            </TouchableOpacity>

            <TextInput
              placeholder="Ask about your crop..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 px-3 py-3 text-[15px] text-gray-800 min-h-[44px] max-h-[120px]"
              value={message}
              onChangeText={setMessage}
              multiline={true}
            />

            <TouchableOpacity
              onPress={handleMicPress}
              className="w-[38px] h-[38px] rounded-full items-center justify-center bg-[#EAF2ED] mr-2 mb-1.5 active:bg-[#D4E8DC] transition-colors duration-200"
            >
              <Feather name="mic" size={18} color="#1A744C" />
            </TouchableOpacity>

            <TouchableOpacity
              className={`w-[48px] h-[48px] rounded-full items-center justify-center transition-colors duration-200 ${message.trim().length > 0 ? 'bg-[#1A744C]' : 'bg-gray-300'
                }`}
              disabled={message.trim().length === 0}
              onPress={handleSend}
            >
              <Ionicons name="send" size={20} color="white" className="ml-1" />
            </TouchableOpacity>
          </View>

          {/* Footer Text */}
          {/* <Text className="text-[10px] text-gray-400 mt-3 px-1 text-center">
            AI provides guidance. Always verify field conditions.
          </Text> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
