import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { PhaseBadge } from '../ui/PhaseBadge';
import type { LovepathStage } from '../../types';

interface LovePathCardProps {
  stage: LovepathStage | null | undefined;
  isLoading: boolean;
}

export function LovePathCard({ stage, isLoading }: LovePathCardProps): JSX.Element {
  const handlePress = (): void => {
    router.push('/lovepath/stage');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-card rounded-2xl p-4 shadow-card flex-1"
      activeOpacity={0.8}
    >
      <Text className="text-caption font-body text-muted mb-1">LovePath Stage</Text>
      {isLoading ? (
        <Text className="text-body font-body text-muted">Loading...</Text>
      ) : stage ? (
        <View className="mt-1">
          <PhaseBadge phase={stage} />
        </View>
      ) : (
        <View className="mt-1">
          <Text className="text-body font-body text-muted mb-2">Not started</Text>
          <Text className="text-primary text-caption font-body-medium">Start →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
