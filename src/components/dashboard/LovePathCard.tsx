import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radii, shadow } from '../../styles/theme';
import { PhaseBadge } from '../ui/PhaseBadge';
import type { LovepathStage } from '../../types';

interface LovePathCardProps {
  stage: LovepathStage | null | undefined;
  isLoading: boolean;
}

export function LovePathCard({ stage, isLoading }: LovePathCardProps): JSX.Element {
  return (
    <TouchableOpacity onPress={() => router.push('/lovepath/stage')} style={styles.card} activeOpacity={0.8}>
      <Text style={styles.label}>LovePath Stage</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : stage ? (
        <View style={styles.mt}>
          <PhaseBadge phase={stage} />
        </View>
      ) : (
        <View style={styles.mt}>
          <Text style={[styles.muted, styles.mb]}>Not started</Text>
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
  cta: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
  },
});
