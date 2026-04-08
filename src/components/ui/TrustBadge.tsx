import React from 'react';
import { Text, View } from 'react-native';
import type { TrustStatus } from '../../types';

interface TrustBadgeProps {
  status: TrustStatus;
}

const statusStyles: Record<TrustStatus, { container: string; text: string }> = {
  Mutual: {
    container: 'bg-teal-tint',
    text: 'text-teal',
  },
  Watch: {
    container: 'bg-amber-tint',
    text: 'text-amber',
  },
  'One-sided': {
    container: 'bg-red-tint',
    text: 'text-danger',
  },
};

export function TrustBadge({ status }: TrustBadgeProps) {
  const { container, text } = statusStyles[status];

  return (
    <View className={`px-3 py-1 rounded-full self-start ${container}`}>
      <Text className={`text-xs font-semibold ${text}`}>{status}</Text>
    </View>
  );
}
