import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

interface EffortBalanceCardProps {
  balancePct: number | null;
  isLoading: boolean;
}

export function EffortBalanceCard({ balancePct, isLoading }: EffortBalanceCardProps): JSX.Element {
  const handlePress = (): void => {
    router.push('/effort-balance/');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-card rounded-2xl p-4 shadow-card flex-1"
      activeOpacity={0.8}
    >
      <Text className="text-caption font-body text-muted mb-1">Effort Balance</Text>
      {isLoading ? (
        <Text className="text-body font-body text-muted">Loading...</Text>
      ) : balancePct !== null ? (
        <View className="mt-1">
          <Text className="text-h2 font-heading text-foreground">{balancePct}%</Text>
          <Text className="text-caption font-body text-muted">your share</Text>
        </View>
      ) : (
        <View className="mt-1">
          <Text className="text-body font-body text-muted mb-2">Not logged yet</Text>
          <Text className="text-primary text-caption font-body-medium">Start →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
