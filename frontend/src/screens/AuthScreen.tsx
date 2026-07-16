import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StatusBar as RNStatusBar, Animated, Alert, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BACKEND_URL } from '../config';

type AuthScreenProps = {
  onLoginSuccess: () => void;
};

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
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
        Alert.alert('Validation Error', 'Please enter both email/username and password');
        return;
      }
    } else {
      if (!username.trim() || !email.trim() || !password || !confirmPassword) {
        Alert.alert('Validation Error', 'All fields are required');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Validation Error', 'Passwords do not match');
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
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (response.status >= 200 && response.status < 300 && result.success) {
        if (isLogin) {
          Alert.alert('Success', 'Logged in successfully!');
          onLoginSuccess();
        } else {
          Alert.alert('Success', 'Registered successfully! Please log in.', [
            { text: 'OK', onPress: () => setIsLogin(true) }
          ]);
          // Clear password fields on successful sign up
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const errMsg = result.error || 'Something went wrong. Please check your credentials.';
        Alert.alert('Authentication Failed', errMsg);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Network Error', error.message || 'Unable to connect to server. Please ensure the backend is running.');
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
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </Text>
              <Text className="text-base text-gray-500 text-center">
                {isLogin
                  ? 'Sign in to access your crop advisory dashboard'
                  : 'Join AgriNexus to empower your farming journey'}
              </Text>
            </View>

            {/* Form section */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">

              {!isLogin && (
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">Username</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                    <Feather name="user" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder="Enter your username"
                      placeholderTextColor="#9CA3AF"
                      value={username}
                      onChangeText={setUsername}
                    />
                  </View>
                </View>
              )}

              <View className="mb-3">
                <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">
                  {isLogin ? 'Email ID / Username' : 'Email ID'}
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <Feather name="mail" size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder={isLogin ? "Enter email or username" : "Enter your email ID"}
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
                  {isLogin ? 'Password' : 'New Password'}
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <Feather name="lock" size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-900"
                    placeholder="Enter your password"
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
                  <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">Confirm Password</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                    <Feather name="lock" size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-900"
                      placeholder="Confirm your password"
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
                  <Text className="text-sm font-semibold text-[#18553F]">Forgot Password?</Text>
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
                    {isLogin ? 'Login' : 'Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle Section */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600 text-base">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text className="text-[#18553F] font-bold text-base">
                  {isLogin ? 'Sign Up' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
