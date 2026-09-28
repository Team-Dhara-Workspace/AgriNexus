import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { BACKEND_URL } from '../config';

export type UserType = {
  id: number;
  username: string;
  email: string;
};

type AuthScreenProps = {
  onLoginSuccess: (user: UserType) => void;
};

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);

  // Animation state
  const growAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animation values
    growAnim.setValue(0);
    rotateAnim.setValue(-1);
    slideAnim.setValue(isLogin ? -150 : 150); // Start off-screen horizontally

    // Play farming grow & move animation
    Animated.parallel([
      Animated.spring(growAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [isLogin]);

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-45deg', '0deg', '45deg']
  });

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic inputs verification
    if (isLogin) {
      if (!email.trim() || !password) {
        Alert.alert(t('auth.validationError'), t('auth.enterEmailPassword'));
        return;
      }
    } else {
      if (!username.trim() || !email.trim() || !password || !confirmPassword) {
        Alert.alert(t('auth.validationError'), t('auth.allFieldsRequired'));
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert(t('auth.validationError'), t('auth.passwordsDoNotMatch'));
        return;
      }
    }

    setIsLoading(true);

    try {
      // Mock Login Implementation
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network request

      if (isLogin) {
        Alert.alert(t('auth.success'), t('auth.loggedInSuccess'));
        onLoginSuccess({ id: 1, username: 'MockUser', email: email.trim() || 'mock@example.com' });
      } else {
        Alert.alert(t('auth.success'), t('auth.accountCreated'), [
          { text: t('auth.ok'), onPress: () => setIsLogin(true) }
        ]);
        // Clear password fields on successful sign up
        setPassword('');
        setConfirmPassword('');
      }

      /* Uncomment this block to restore backend login
      const endpoint = isLogin ? `${BACKEND_URL}/users/login/` : `${BACKEND_URL}/users/signup/`;
      const body = isLogin
        ? { email_or_username: email.trim(), password }
        : { username: username.trim(), email: email.trim(), password, confirm_password: confirmPassword };

      console.log(`Sending authentication request to: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error('Failed to parse JSON response:', text);
        throw new Error(t('auth.serverInvalidResponse'));
      }

      if (response.status >= 200 && response.status < 300 && result.success) {
        if (isLogin) {
          Alert.alert(t('auth.success'), t('auth.loggedInSuccess'));
          onLoginSuccess(result.user);
        } else {
          Alert.alert(t('auth.success'), result.message || t('auth.accountCreated'), [
            { text: t('auth.ok'), onPress: () => setIsLogin(true) }
          ]);
          // Clear password fields on successful sign up
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const errorMessage = result?.error || result?.message || t('auth.authFailed');
        Alert.alert(t('auth.authError'), errorMessage);
      }
      */
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(t('auth.error'), error.message || t('auth.unableToConnect'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5FAF6]" style={Platform.OS === 'web' ? ({ height: '100vh' } as any) : undefined}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center px-6 py-10">
            
            {/* Header section */}
            <View className="items-center mb-8">
              <Animated.View
                className="w-16 h-16 bg-[#072C1E] rounded-2xl items-center justify-center mb-4 shadow-md border border-gray-800"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  transform: [
                    { translateX: slideAnim },
                    { scale: growAnim },
                    { rotate: spin }
                  ]
                }}
              >
                <Ionicons name="leaf" size={30} color="#10B981" />
              </Animated.View>

              <Text 
                className="text-3xl font-extrabold text-[#0B3D2E] tracking-tight mb-1.5 text-center"
                style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}
              >
                Agri<Text className="text-[#10B981]">Nexus</Text>
              </Text>

              <Text className="text-sm text-gray-500 text-center px-4 font-medium">
                {isLogin ? t('auth.signInSubtext') : t('auth.joinSubtext')}
              </Text>
            </View>

            {/* Form Card */}
            <View 
              className="bg-white p-7 rounded-3xl"
              style={{
                borderWidth: 2,
                borderColor: '#0F172A',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.14,
                shadowRadius: 14,
                elevation: 6,
              }}
            >
              {/* Segmented Tab Switcher */}
              <View className="bg-[#F1F5F9] p-1.5 rounded-full flex-row mb-6 border border-gray-100">
                <TouchableOpacity
                  className={`flex-1 py-2.5 rounded-full items-center justify-center ${
                    isLogin ? 'bg-[#072C1E] shadow-sm' : ''
                  }`}
                  onPress={() => setIsLogin(true)}
                >
                  <Text className={`text-xs font-bold ${isLogin ? 'text-white' : 'text-gray-600'}`}>
                    {t('auth.loginBtn')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-2.5 rounded-full items-center justify-center ${
                    !isLogin ? 'bg-[#072C1E] shadow-sm' : ''
                  }`}
                  onPress={() => setIsLogin(false)}
                >
                  <Text className={`text-xs font-bold ${!isLogin ? 'text-white' : 'text-gray-600'}`}>
                    {t('auth.signUpBtn')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Username Field (Sign Up Only) */}
              {!isLogin && (
                <View className="mb-4">
                  <Text className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-2 ml-1">
                    {t('auth.usernameLabel')}
                  </Text>
                  <View className="flex-row items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl px-4 py-3.5">
                    <Feather name="user" size={16} color="#0B3D2E" />
                    <TextInput
                      className="flex-1 ml-3 text-sm text-gray-900"
                      placeholder={t('auth.usernamePlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      value={username}
                      onChangeText={setUsername}
                    />
                  </View>
                </View>
              )}

              {/* Email / Username Field */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-2 ml-1">
                  {isLogin ? t('auth.emailLabel') : t('auth.emailOnlyLabel')}
                </Text>
                <View className="flex-row items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl px-4 py-3.5">
                  <Feather name="mail" size={16} color="#0B3D2E" />
                  <TextInput
                    className="flex-1 ml-3 text-sm text-gray-900"
                    placeholder={isLogin ? t('auth.emailPlaceholder') : t('auth.emailOnlyPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType={isLogin ? "default" : "email-address"}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-2 ml-1">
                  {isLogin ? t('auth.passwordLabel') : t('auth.newPasswordLabel')}
                </Text>
                <View className="flex-row items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl px-4 py-3.5">
                  <Feather name="lock" size={16} color="#0B3D2E" />
                  <TextInput
                    className="flex-1 ml-3 text-sm text-gray-900"
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                    <Feather name={showPassword ? "eye" : "eye-off"} size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Field (Sign Up Only) */}
              {!isLogin && (
                <View className="mb-3">
                  <Text className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-2 ml-1">
                    {t('auth.confirmPasswordLabel')}
                  </Text>
                  <View className="flex-row items-center bg-[#F8FAFC] border border-gray-200 rounded-2xl px-4 py-3.5">
                    <Feather name="shield" size={16} color="#0B3D2E" />
                    <TextInput
                      className="flex-1 ml-3 text-sm text-gray-900"
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1">
                      <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Forgot Password Link */}
              {isLogin && (
                <TouchableOpacity className="self-end mb-5 mt-1">
                  <Text className="text-xs font-bold text-[#0B3D2E]">{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              )}

              {/* Submit CTA Button */}
              <TouchableOpacity
                className={`bg-[#072C1E] rounded-full py-4 items-center justify-center shadow-md active:opacity-90 flex-row mt-3 ${isLoading ? 'opacity-70' : ''}`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white text-sm font-bold mr-2">
                      {isLogin ? `${t('auth.loginBtn')} to Account` : `${t('auth.signUpBtn')} Farmer Account`}
                    </Text>
                    <Feather name="arrow-right" size={16} color="#10B981" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle Footer */}
            <View className="flex-row justify-center items-center mt-8 mb-4">
              <Text className="text-gray-500 text-xs">
                {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="ml-1">
                <Text className="text-[#0B3D2E] font-extrabold text-xs">
                  {isLogin ? t('auth.signUpBtn') : t('auth.loginBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
