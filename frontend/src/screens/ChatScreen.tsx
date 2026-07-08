import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, Alert, ScrollView, StatusBar as RNStatusBar } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

type ChatScreenProps = {
  onOpenSidebar: () => void;
};

export default function ChatScreen({ onOpenSidebar }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handleSend = () => {
    if (message.trim().length > 0) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      // Simulate bot typing and responding
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I am an AI assistant for Smart Crop Advisory. I am still under development, but I will soon be able to help you with " + userMessage.text + "!",
          sender: 'bot',
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]" style={{ height: (Platform.OS === 'web' ? '100vh' : '100%') as any }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View 
          className="flex-row justify-between items-center px-6 pb-2 bg-[#F5FAF6] z-10"
          style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 12 : 20 }}
        >
          <TouchableOpacity onPress={onOpenSidebar}>
            <Feather name="menu" size={24} color="#18553F" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#18553F]">Smart Crop Advisory</Text>
          <View style={{ width: 24 }} />
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
                className={`mb-4 max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'user' 
                    ? 'bg-[#1A744C] self-end rounded-tr-sm' 
                    : 'bg-white border border-gray-100 self-start rounded-tl-sm shadow-sm'
                }`}
              >
                <Text className={`text-[15px] ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {/* Bottom padding to prevent last message hiding behind input */}
            <View className="h-6" />
          </ScrollView>
        )}

        {/* Bottom Input Area */}
        <View className="px-5 pb-8 pt-2 bg-[#F5FAF6]">
          <View className="flex-row items-end min-h-[60px] bg-white border border-gray-200 rounded-[30px] pl-5 pr-1.5 py-1.5 shadow-sm relative">
            <TouchableOpacity onPress={handlePickDocument} className="mb-3">
              <Feather name="plus" size={22} color="#9CA3AF" />
            </TouchableOpacity>

            <TextInput
              placeholder="Ask about your crop..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 px-4 py-3.5 text-[15px] text-gray-800 min-h-[48px] max-h-[120px]"
              value={message}
              onChangeText={setMessage}
              multiline={true}
            />

            <TouchableOpacity className="mr-3 mb-3" onPress={handleMicPress}>
              <Feather name="mic" size={20} color="#9CA3AF" />
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
          <Text className="text-[10px] text-gray-400 mt-3 px-1 text-center">
            AI provides guidance. Always verify field conditions.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
