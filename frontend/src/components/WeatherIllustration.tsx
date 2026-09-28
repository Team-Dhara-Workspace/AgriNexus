import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';

interface WeatherIllustrationProps {
  conditionId?: number;
  iconCode?: string;
  size?: number;
}

export default function WeatherIllustration({
  conditionId = 801,
  iconCode = '01d',
  size = 72,
}: WeatherIllustrationProps) {
  const isNight = iconCode.includes('n');

  // Partly Cloudy / Cloudy (like the screenshot)
  const isPartlyCloudy = conditionId > 800 && conditionId < 804;
  const isOvercast = conditionId >= 804;
  const isClear = conditionId === 800;
  const isRain = conditionId >= 300 && conditionId < 600;
  const isThunderstorm = conditionId >= 200 && conditionId < 300;
  const isSnow = conditionId >= 600 && conditionId < 700;

  if (isClear && !isNight) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Ionicons name="sunny" size={size * 0.65} color="#F59E0B" />
      </View>
    );
  }

  if (isClear && isNight) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Ionicons name="moon" size={size * 0.6} color="#6366F1" />
      </View>
    );
  }

  if (isPartlyCloudy && !isNight) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        {/* Sun in center-left / top-left */}
        <View style={{ position: 'absolute', top: size * 0.12, left: size * 0.14 }}>
          <Ionicons name="sunny" size={size * 0.52} color="#F59E0B" />
        </View>
        {/* Cloud overlapping bottom-right */}
        <View style={{ position: 'absolute', bottom: size * 0.12, right: size * 0.12 }}>
          <Ionicons name="cloud" size={size * 0.46} color="#475569" />
        </View>
      </View>
    );
  }

  if (isRain) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Ionicons name="rainy" size={size * 0.6} color="#3B82F6" />
      </View>
    );
  }

  if (isThunderstorm) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Ionicons name="thunderstorm" size={size * 0.6} color="#8B5CF6" />
      </View>
    );
  }

  if (isSnow) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Ionicons name="snow" size={size * 0.6} color="#38BDF8" />
      </View>
    );
  }

  // Default overcast or general cloud
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Ionicons name={isNight ? "cloudy-night" : "cloud"} size={size * 0.6} color="#64748B" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
