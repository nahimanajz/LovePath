import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSizes, radii } from '../../styles/theme';

type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertBoxProps {
  message: string;
  type?: AlertType;
  style?: object;
}

const typeColors: Record<AlertType, { bg: string; border: string; text: string }> = {
  info:    { bg: colors.purpleTint, border: colors.secondary, text: colors.secondary },
  warning: { bg: colors.amberTint,  border: colors.amber,     text: colors.amber },
  error:   { bg: colors.redTint,    border: colors.danger,    text: colors.danger },
  success: { bg: colors.tealTint,   border: colors.teal,      text: colors.teal },
};

export function AlertBox({ message, type = 'info', style }: AlertBoxProps) {
  const { bg, border, text } = typeColors[type];

  return (
    <View style={[styles.container, { backgroundColor: bg, borderLeftColor: border }, style]}>
      <Text style={[styles.message, { color: text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.input,
    padding: 16,
    borderLeftWidth: 4,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
  },
});
