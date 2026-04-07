import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { LANGUAGE_LABELS, type LanguageKey } from '../../types';

interface LoveLanguageCardProps {
  primaryLanguage: LanguageKey | null | undefined;
  isLoading: boolean;
}

export function LoveLanguageCard({ primaryLanguage, isLoading }: LoveLanguageCardProps): JSX.Element {
  const handlePress = (): void => {
    router.push('/love-languages/intro');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-card rounded-2xl p-4 shadow-card flex-1"
      activeOpacity={0.8}
    >
      <Text className="text-caption font-body text-muted mb-1">Love Language</Text>
      {isLoading ? (
        <Text className="text-body font-body text-muted">Loading...</Text>
      ) : primaryLanguage ? (
        <Text className="text-h3 font-heading text-foreground" numberOfLines={2}>
          {LANGUAGE_LABELS[primaryLanguage]}
        </Text>
      ) : (
        <View className="mt-1">
          <Text className="text-body font-body text-muted mb-2">Not set yet</Text>
          <Text className="text-primary text-caption font-body-medium">Start →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
