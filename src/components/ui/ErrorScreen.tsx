import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorScreenProps) {
  return (
    <View className="flex-1 bg-background items-center justify-center px-screen-x gap-4">
      <Ionicons name="warning-outline" size={48} color="#E24B4A" />
      <Text className="text-foreground text-h3 text-center">{message}</Text>
      {onRetry && (
        <Button label="Try Again" onPress={onRetry} variant="outline" />
      )}
    </View>
  );
}
