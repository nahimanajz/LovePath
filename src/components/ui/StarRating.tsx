import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../../styles/theme';

interface StarRatingProps {
  value: number; // 1–5
  onChange?: (v: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 24 }: StarRatingProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const icon = filled ? 'star' : 'star-outline';

        if (onChange) {
          return (
            <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7}>
              <Ionicons name={icon} size={size} color={colors.primary} />
            </TouchableOpacity>
          );
        }

        return <Ionicons key={star} name={icon} size={size} color={colors.primary} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
});
