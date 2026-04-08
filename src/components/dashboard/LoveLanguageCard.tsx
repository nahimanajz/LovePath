import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radii, shadow } from '../../styles/theme';
import { LANGUAGE_LABELS, type LanguageKey } from '../../types';

interface LoveLanguageCardProps {
  primaryLanguage: LanguageKey | null | undefined;
  isLoading: boolean;
}

export function LoveLanguageCard({ primaryLanguage, isLoading }: LoveLanguageCardProps): JSX.Element {
  return (
    <TouchableOpacity onPress={() => router.push('/love-languages/intro')} style={styles.card} activeOpacity={0.8}>
      <Text style={styles.label}>Love Language</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : primaryLanguage ? (
        <Text style={styles.value} numberOfLines={2}>{LANGUAGE_LABELS[primaryLanguage]}</Text>
      ) : (
        <View style={styles.mt}>
          <Text style={[styles.muted, styles.mb]}>Not set yet</Text>
          <Text style={styles.cta}>Start →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.xl2,
    padding: 16,
    flex: 1,
    ...shadow.card,
  },
  label: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: 4,
  },
  muted: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  mt: { marginTop: 4 },
  mb: { marginBottom: 8 },
  value: {
    fontSize: fontSizes.base,
    fontFamily: fonts.heading,
    color: colors.foreground,
  },
  cta: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
  },
});
