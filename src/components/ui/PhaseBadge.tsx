import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSizes, radii } from '../../styles/theme';
import type { LovepathStage } from '../../types';

interface PhaseBadgeProps {
  phase: LovepathStage;
}

const phaseColors: Record<LovepathStage, { bg: string; text: string }> = {
  Attraction: { bg: colors.roseTint,   text: colors.primary },
  Acceptance: { bg: colors.purpleTint, text: colors.secondary },
  Attachment: { bg: colors.tealTint,   text: colors.teal },
  Aspiration: { bg: colors.amberTint,  text: colors.amber },
};

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const { bg, text } = phaseColors[phase];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{phase}</Text>
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
