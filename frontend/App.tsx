import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './src/screens/ChatScreen';
import PestDetectionScreen from './src/screens/PestDetectionScreen';
import Sidebar from './src/components/Sidebar';
import AuthScreen, { UserType } from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketScreen from './src/screens/MarketScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import BottomNavbar from './src/components/BottomNavbar';
import { BACKEND_URL } from './src/config';

export type ScreenType = 'chat' | 'pest' | 'auth' | 'home' | 'market' | 'profile' | 'connect';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('auth');
  const [user, setUser] = useState<UserType | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

  const navigateTo = (screen: ScreenType) => {
    // Enforce login requirement: non-authenticated users are returned to auth screen
    if (!user && screen !== 'auth') {
      setCurrentScreen('auth');
      setIsSidebarOpen(false);
      return;
    }
    setCurrentScreen(screen);
    setIsSidebarOpen(false);
  };

  const handleLoginSuccess = (loggedInUser: UserType) => {
    setUser(loggedInUser);
    setCurrentScreen('home');
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
      setUser(null);
      setCurrentSessionId(null);
      setCurrentScreen('auth');
    }
  };

  const triggerSidebarRefresh = () => {
    setSidebarRefreshTrigger(prev => prev + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />

      {currentScreen === 'auth' && (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      )}

      {currentScreen === 'chat' && (
        <ChatScreen
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
          user={user}
          currentSessionId={currentSessionId}
          setCurrentSessionId={setCurrentSessionId}
          onRefreshSessions={triggerSidebarRefresh}
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
            userId={user?.id}
            currentSessionId={currentSessionId}
            onSelectSession={(sessionId) => setCurrentSessionId(sessionId)}
            onNewChat={() => setCurrentSessionId(null)}
            refreshTrigger={sidebarRefreshTrigger}
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
