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
import { BACKEND_URL } from './src/config';

export type ScreenType = 'chat' | 'pest' | 'auth' | 'home' | 'market' | 'profile' | 'connect';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('auth');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/users/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.success) {
        console.log('Logged out successfully from backend');
      } else {
        console.warn('Backend logout failed:', result.error);
      }
    } catch (error) {
      console.error('Error logging out from backend:', error);
    } finally {
      setCurrentScreen('auth');
    }
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
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'pest' && (
        <PestDetectionScreen onOpenSidebar={() => setIsSidebarOpen(true)} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen onNavigate={navigateTo} onLogout={handleLogout} />
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
