import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radii, shadow } from '../../styles/theme';

interface EffortBalanceCardProps {
  balancePct: number | null;
  isLoading: boolean;
}

export function EffortBalanceCard({ balancePct, isLoading }: EffortBalanceCardProps): JSX.Element {
  return (
    <TouchableOpacity onPress={() => router.push('/effort-balance/')} style={styles.card} activeOpacity={0.8}>
      <Text style={styles.label}>Effort Balance</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : balancePct !== null ? (
        <View style={styles.mt}>
          <Text style={styles.value}>{balancePct}%</Text>
          <Text style={styles.muted}>your share</Text>
        </View>
      ) : (
        <View style={styles.mt}>
          <Text style={[styles.muted, styles.mb]}>Not logged yet</Text>
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
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.foreground,
  },
  cta: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
  },
});
