import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface StarRatingProps {
  value: number; // 1–5
  onChange?: (v: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 24 }: StarRatingProps) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const icon = filled ? 'star' : 'star-outline';

        if (onChange) {
          return (
            <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7}>
              <Ionicons name={icon} size={size} color="#C0556A" />
            </TouchableOpacity>
          );
        }

        return <Ionicons key={star} name={icon} size={size} color="#C0556A" />;
      })}
    </View>
  );
}
