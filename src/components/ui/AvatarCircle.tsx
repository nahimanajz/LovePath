import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../../styles/theme';

interface AvatarCircleProps {
  name: string;
  uri?: string | null;
  size?: number;
  style?: object;
}

export function AvatarCircle({ name, uri, size = 48, style }: AvatarCircleProps) {
  const initial = name.trim().charAt(0).toUpperCase();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.circle, { width: size, height: size }, style]}
      />
    );
  }

  return (
    <View style={[styles.circle, styles.placeholder, { width: size, height: size }, style]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radii.full,
  },
  placeholder: {
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.primary,
    fontFamily: fonts.heading,
  },
});
