import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  className?: string;
}

export function ProgressBar({ value, color, className = '' }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <View className={`bg-border h-2 rounded-full overflow-hidden ${className}`}>
      <View
        className={`h-2 rounded-full ${color ? '' : 'bg-primary'}`}
        style={{
          width: `${clampedValue}%`,
          ...(color ? { backgroundColor: color } : {}),
        }}
      />
    </View>
  );
}
