import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radii, shadow } from '../../styles/theme';

interface TrustCircleCardProps {
  oneSidedCount: number | null;
  isLoading: boolean;
}

export function TrustCircleCard({ oneSidedCount, isLoading }: TrustCircleCardProps): JSX.Element {
  return (
    <TouchableOpacity onPress={() => router.push('/trust-circle/')} style={styles.card} activeOpacity={0.8}>
      <Text style={styles.label}>Trust Circle</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : oneSidedCount !== null ? (
        <View style={styles.mt}>
          {oneSidedCount > 0 ? (
            <>
              <Text style={styles.danger}>{oneSidedCount}</Text>
              <Text style={styles.muted}>one-sided</Text>
            </>
          ) : (
            <Text style={styles.balanced}>All balanced</Text>
          )}
        </View>
      ) : (
        <View style={styles.mt}>
          <Text style={[styles.muted, styles.mb]}>No data yet</Text>
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
  danger: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.danger,
  },
  balanced: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.teal,
  },
  cta: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
  },
});
