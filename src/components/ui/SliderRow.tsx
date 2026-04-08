import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SliderRowProps {
  label: string;
  value: number; // 0–10
  onChange?: (v: number) => void;
}

export function SliderRow({ label, value, onChange }: SliderRowProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Text className="text-foreground text-body flex-1">{label}</Text>

      <View className="flex-row gap-1 items-center">
        {Array.from({ length: 10 }, (_, i) => {
          const dotIndex = i + 1;
          const filled = dotIndex <= value;

          if (onChange) {
            return (
              <TouchableOpacity
                key={dotIndex}
                onPress={() => onChange(dotIndex)}
                activeOpacity={0.7}
                className={`w-2 h-2 rounded-full ${filled ? 'bg-primary' : 'bg-border'}`}
              />
            );
          }

          return (
            <View
              key={dotIndex}
              className={`w-2 h-2 rounded-full ${filled ? 'bg-primary' : 'bg-border'}`}
            />
          );
        })}
      </View>

      <Text className="text-foreground text-body-md w-5 text-right">{value}</Text>
    </View>
  );
}
