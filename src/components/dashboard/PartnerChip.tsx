import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radii } from '../../styles/theme';

export function PartnerChip(): JSX.Element {
  return (
    <TouchableOpacity
      onPress={() => router.push('/partner/invite')}
      style={styles.chip}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>Invite partner →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  label: {
    color: colors.primary,
    fontSize: fontSizes.caption,
    fontFamily: fonts.bodyMedium,
  },
});
