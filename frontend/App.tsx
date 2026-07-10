import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import PestDetectionScreen from './src/screens/PestDetectionScreen';
import Sidebar from './src/components/Sidebar';

export type ScreenType = 'chat' | 'pest';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
    setIsSidebarOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      
      {currentScreen === 'chat' && (
        <ChatScreen onOpenSidebar={() => setIsSidebarOpen(true)} />
      )}
      
      {currentScreen === 'pest' && (
        <PestDetectionScreen onOpenSidebar={() => setIsSidebarOpen(true)} />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={navigateTo}
        currentScreen={currentScreen}
      />
    </View>
  );
}
