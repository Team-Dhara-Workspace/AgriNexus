import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StatusBar as RNStatusBar, Animated, Alert, ActivityIndicator } from 'react-native';
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
        style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-8 py-6">
            {/* Header section */}
            <View className="items-center mb-6">
              <Animated.View
                className="w-16 h-16 bg-[#1A744C] rounded-2xl items-center justify-center mb-4 shadow-md"
                style={{
                  transform: [
                    { translateX: slideAnim },
                    { scale: growAnim },
                    { rotate: spin }
                  ]
                }}
              >
                <Ionicons name="leaf" size={32} color="white" />
              </Animated.View>
              <Text className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
              </Text>
              <Text className="text-base text-gray-500 text-center">
                {isLogin
                  ? t('auth.signInSubtext')
                  : t('auth.joinSubtext')}
              </Text>
            </View>

            {/* Form section */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">

              {!isLogin && (
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">{t('auth.usernameLabel')}</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                    <Feather name="user" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder={t('auth.usernamePlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      value={username}
                      onChangeText={setUsername}
                    />
                  </View>
                </View>
              )}

              <View className="mb-3">
                <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">
                  {isLogin ? t('auth.emailLabel') : t('auth.emailOnlyLabel')}
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <Feather name="mail" size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder={isLogin ? t('auth.emailPlaceholder') : t('auth.emailOnlyPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType={isLogin ? "default" : "email-address"}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">
                  {isLogin ? t('auth.passwordLabel') : t('auth.newPasswordLabel')}
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <Feather name="lock" size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder={t('auth.passwordPlaceholder')}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                    <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {!isLogin && (
                <View className="mb-1">
                  <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">{t('auth.confirmPasswordLabel')}</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                    <Feather name="lock" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1">
                      <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {isLogin && (
                <TouchableOpacity className="self-end mb-3 mt-1">
                  <Text className="text-sm font-semibold text-[#18553F]">{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className={`bg-[#1A744C] rounded-xl py-3.5 items-center justify-center shadow-sm mt-3 active:bg-[#135939] transition-colors ${isLoading ? 'opacity-70' : ''}`}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    {isLogin ? t('auth.loginBtn') : t('auth.signUpBtn')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle Section */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600 text-base">
                {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text className="text-[#18553F] font-bold text-base">
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
