import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSizes, radii } from '../../styles/theme';
import type { TrustStatus } from '../../types';

interface TrustBadgeProps {
  status: TrustStatus;
}

const statusColors: Record<TrustStatus, { bg: string; text: string }> = {
  Mutual:      { bg: colors.tealTint, text: colors.teal },
  Watch:       { bg: colors.amberTint, text: colors.amber },
  'One-sided': { bg: colors.redTint,  text: colors.danger },
};

export function TrustBadge({ status }: TrustBadgeProps) {
  const { bg, text } = statusColors[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.heading,
  },
});
