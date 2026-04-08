import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, fontSizes, radii } from '../../styles/theme';

interface SliderRowProps {
  label: string;
  value: number; // 0–10
  onChange?: (v: number) => void;
}

export function SliderRow({ label, value, onChange }: SliderRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.dots}>
        {Array.from({ length: 10 }, (_, i) => {
          const dotIndex = i + 1;
          const filled = dotIndex <= value;

          if (onChange) {
            return (
              <TouchableOpacity
                key={dotIndex}
                onPress={() => onChange(dotIndex)}
                activeOpacity={0.7}
                style={[styles.dot, { backgroundColor: filled ? colors.primary : colors.border }]}
              />
            );
          }

          return (
            <View
              key={dotIndex}
              style={[styles.dot, { backgroundColor: filled ? colors.primary : colors.border }]}
            />
          );
        })}
      </View>

      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    flex: 1,
    color: colors.foreground,
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  value: {
    color: colors.foreground,
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.sm,
    width: 20,
    textAlign: 'right',
  },
});
