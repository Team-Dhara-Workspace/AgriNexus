import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import PestDetectionScreen from './src/screens/PestDetectionScreen';
import Sidebar from './src/components/Sidebar';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketScreen from './src/screens/MarketScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import BottomNavbar from './src/components/BottomNavbar';

export type ScreenType = 'chat' | 'pest' | 'auth' | 'home' | 'market' | 'profile' | 'connect';

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
        <AuthScreen onLoginSuccess={() => setCurrentScreen('home')} />
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

      {currentScreen === 'home' && (
        <HomeScreen onNavigate={navigateTo} onLogout={() => setCurrentScreen('auth')} />
      )}

      {currentScreen === 'market' && (
        <MarketScreen />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen />
      )}

      {currentScreen === 'connect' && (
        <ConnectScreen />
      )}

      {currentScreen !== 'auth' && (
        <>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNavigate={navigateTo}
            currentScreen={currentScreen}
          />
          <BottomNavbar 
            currentScreen={currentScreen} 
            onNavigate={navigateTo} 
          />
        </>
      )}
    </View>
  );
}
