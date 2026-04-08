import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSizes } from '../../styles/theme';
import { Button } from './Button';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="warning-outline" size={48} color={colors.danger} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && <Button label="Try Again" onPress={onRetry} variant="outline" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  message: {
    color: colors.foreground,
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
});
