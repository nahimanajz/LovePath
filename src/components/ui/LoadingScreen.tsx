import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export function LoadingScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#C0556A" />
    </View>
  );
}
