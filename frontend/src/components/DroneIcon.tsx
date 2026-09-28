import React from 'react';
import Svg, { Path, Circle, Rect, Ellipse } from 'react-native-svg';

interface DroneIconProps {
  size?: number;
  color?: string;
}

export default function DroneIcon({ size = 24, color = '#1A744C' }: DroneIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 4 Diagonal Carbon Fiber Motor Arms */}
      <Path
        d="M6 6L18 18M18 6L6 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Center Drone Aerodynamic Body */}
      <Rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="2"
        fill={color}
      />

      {/* Optical Camera / Sensor Core */}
      <Circle
        cx="12"
        cy="12"
        r="1.3"
        fill="white"
      />

      {/* Top-Left Rotor Blade & Hub */}
      <Ellipse cx="5.5" cy="5.5" rx="3.5" ry="1.2" transform="rotate(-25 5.5 5.5)" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2" />
      <Circle cx="5.5" cy="5.5" r="1.5" fill={color} />

      {/* Top-Right Rotor Blade & Hub */}
      <Ellipse cx="18.5" cy="5.5" rx="3.5" ry="1.2" transform="rotate(25 18.5 5.5)" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2" />
      <Circle cx="18.5" cy="5.5" r="1.5" fill={color} />

      {/* Bottom-Left Rotor Blade & Hub */}
      <Ellipse cx="5.5" cy="18.5" rx="3.5" ry="1.2" transform="rotate(25 5.5 18.5)" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2" />
      <Circle cx="5.5" cy="18.5" r="1.5" fill={color} />

      {/* Bottom-Right Rotor Blade & Hub */}
      <Ellipse cx="18.5" cy="18.5" rx="3.5" ry="1.2" transform="rotate(-25 18.5 18.5)" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2" />
      <Circle cx="18.5" cy="18.5" r="1.5" fill={color} />
    </Svg>
  );
}
