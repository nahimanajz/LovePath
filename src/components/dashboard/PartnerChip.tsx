import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export function PartnerChip(): JSX.Element {
  return (
    <TouchableOpacity
      onPress={() => router.push('/partner/invite')}
      className="self-start border border-primary rounded-full px-4 py-2 mt-1"
      activeOpacity={0.7}
    >
      <Text className="text-primary text-caption font-body-medium">Invite partner →</Text>
    </TouchableOpacity>
  );
}
