import React from 'react';
import { Image, Text, View } from 'react-native';

interface AvatarCircleProps {
  name: string;
  uri?: string | null;
  size?: number;
  className?: string;
}

export function AvatarCircle({ name, uri, size = 48, className = '' }: AvatarCircleProps) {
  const initial = name.trim().charAt(0).toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <View
      className={`rounded-full bg-rose-tint items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Text
        className="text-primary font-semibold"
        style={{ fontSize: size * 0.4 }}
      >
        {initial}
      </Text>
    </View>
  );
}
