import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radii, shadow } from '../../styles/theme';
import type { Insight } from '../../types';

interface DailyInsightCardProps {
  insight: Insight | undefined;
  isLoading: boolean;
}

export function DailyInsightCard({ insight, isLoading }: DailyInsightCardProps): JSX.Element {
  return (
    <TouchableOpacity onPress={() => router.push('/insights/')} style={styles.card} activeOpacity={0.8}>
      <Text style={styles.label}>Daily Insight</Text>
      {isLoading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : insight ? (
        <>
          <Text style={styles.body} numberOfLines={4}>"{insight.text}"</Text>
          <View style={styles.footer}>
            <Text style={styles.muted}>— {insight.source}</Text>
            <Text style={styles.cta}>Reflect →</Text>
          </View>
        </>
      ) : (
        <Text style={styles.muted}>No insight for today.</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.purpleTint,
    borderRadius: radii.xl2,
    padding: 16,
    ...shadow.card,
  },
  label: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.secondary,
    marginBottom: 8,
  },
  body: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.foreground,
    marginBottom: 12,
  },
  muted: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cta: {
    fontSize: fontSizes.caption,
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
  },
});
