import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function CompatibilityScreen(): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <View className="items-center gap-3">
        <Text className="text-h2 font-heading text-foreground">Compatibility</Text>
        <Text className="text-body font-body text-muted">Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}
