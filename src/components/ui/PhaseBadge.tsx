import React from 'react';
import { Text, View } from 'react-native';
import type { LovepathStage } from '../../types';

interface PhaseBadgeProps {
  phase: LovepathStage;
}

const phaseStyles: Record<LovepathStage, { container: string; text: string }> = {
  Attraction: {
    container: 'bg-rose-tint',
    text: 'text-primary',
  },
  Acceptance: {
    container: 'bg-purple-tint',
    text: 'text-secondary',
  },
  Attachment: {
    container: 'bg-teal-tint',
    text: 'text-teal',
  },
  Aspiration: {
    container: 'bg-amber-tint',
    text: 'text-amber',
  },
};

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const { container, text } = phaseStyles[phase];

  return (
    <View className={`px-3 py-1 rounded-full self-start ${container}`}>
      <Text className={`text-xs font-semibold ${text}`}>{phase}</Text>
    </View>
  );
}
