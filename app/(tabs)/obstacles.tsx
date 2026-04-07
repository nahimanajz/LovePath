import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function ObstaclesScreen(): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <View className="items-center gap-3">
        <Text className="text-h2 font-heading text-foreground">Obstacles</Text>
        <Text className="text-body font-body text-muted">Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}
