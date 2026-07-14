import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import PestDetectionScreen from './src/screens/PestDetectionScreen';
import Sidebar from './src/components/Sidebar';
import AuthScreen from './src/screens/AuthScreen';

export type ScreenType = 'chat' | 'pest' | 'auth';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('auth');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
    setIsSidebarOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />

      {currentScreen === 'auth' && (
        <AuthScreen onLoginSuccess={() => setCurrentScreen('chat')} />
      )}

      {currentScreen === 'chat' && (
        <ChatScreen 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
          onLogout={() => setCurrentScreen('auth')}
        />
      )}

      {currentScreen === 'pest' && (
        <PestDetectionScreen onOpenSidebar={() => setIsSidebarOpen(true)} />
      )}

      {currentScreen !== 'auth' && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigate={navigateTo as any}
          currentScreen={currentScreen}
        />
      )}
    </View>
  );
}
