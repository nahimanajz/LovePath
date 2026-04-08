import React from 'react';
import { Text, View } from 'react-native';

type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertBoxProps {
  message: string;
  type?: AlertType;
  className?: string;
}

const typeStyles: Record<AlertType, { container: string; border: string; text: string }> = {
  info: {
    container: 'bg-purple-tint',
    border: 'border-secondary',
    text: 'text-secondary',
  },
  warning: {
    container: 'bg-amber-tint',
    border: 'border-amber',
    text: 'text-amber',
  },
  error: {
    container: 'bg-red-tint',
    border: 'border-danger',
    text: 'text-danger',
  },
  success: {
    container: 'bg-teal-tint',
    border: 'border-teal',
    text: 'text-teal',
  },
};

export function AlertBox({ message, type = 'info', className = '' }: AlertBoxProps) {
  const { container, border, text } = typeStyles[type];

  return (
    <View
      className={`rounded-[12px] p-4 ${container} ${border} ${className}`}
      style={{ borderLeftWidth: 4 }}
    >
      <Text className={`text-body ${text}`}>{message}</Text>
    </View>
  );
}
