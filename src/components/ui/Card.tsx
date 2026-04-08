import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, shadow } from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: object;
}

export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    ...shadow.card,
  },
});
