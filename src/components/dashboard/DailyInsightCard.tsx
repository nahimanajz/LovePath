import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import type { Insight } from '../../types';

interface DailyInsightCardProps {
  insight: Insight | undefined;
  isLoading: boolean;
}

export function DailyInsightCard({ insight, isLoading }: DailyInsightCardProps): JSX.Element {
  const handlePress = (): void => {
    router.push('/insights/');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-purple-tint rounded-2xl p-4 shadow-card"
      activeOpacity={0.8}
    >
      <Text className="text-caption font-body-medium text-secondary mb-2">Daily Insight</Text>
      {isLoading ? (
        <Text className="text-body font-body text-muted">Loading...</Text>
      ) : insight ? (
        <>
          <Text className="text-body font-body text-foreground mb-3" numberOfLines={4}>
            "{insight.text}"
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-caption font-body text-muted">— {insight.source}</Text>
            <Text className="text-primary text-caption font-body-medium">Reflect →</Text>
          </View>
        </>
      ) : (
        <Text className="text-body font-body text-muted">No insight for today.</Text>
      )}
    </TouchableOpacity>
  );
}
