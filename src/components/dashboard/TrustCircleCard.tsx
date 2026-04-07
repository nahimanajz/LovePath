import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

interface TrustCircleCardProps {
  oneSidedCount: number | null;
  isLoading: boolean;
}

export function TrustCircleCard({ oneSidedCount, isLoading }: TrustCircleCardProps): JSX.Element {
  const handlePress = (): void => {
    router.push('/trust-circle/');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-card rounded-2xl p-4 shadow-card flex-1"
      activeOpacity={0.8}
    >
      <Text className="text-caption font-body text-muted mb-1">Trust Circle</Text>
      {isLoading ? (
        <Text className="text-body font-body text-muted">Loading...</Text>
      ) : oneSidedCount !== null ? (
        <View className="mt-1">
          {oneSidedCount > 0 ? (
            <>
              <Text className="text-h2 font-heading text-danger">{oneSidedCount}</Text>
              <Text className="text-caption font-body text-muted">one-sided</Text>
            </>
          ) : (
            <Text className="text-body font-body text-teal">All balanced</Text>
          )}
        </View>
      ) : (
        <View className="mt-1">
          <Text className="text-body font-body text-muted mb-2">No data yet</Text>
          <Text className="text-primary text-caption font-body-medium">Start →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
