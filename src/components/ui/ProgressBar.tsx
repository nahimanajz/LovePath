import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../../styles/theme';

interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  style?: object;
}

export function ProgressBar({ value, color, style }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.track, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clampedValue}%`, backgroundColor: color ?? colors.primary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    height: 8,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: radii.full,
  },
});
