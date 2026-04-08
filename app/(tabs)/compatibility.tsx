import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { compatibilityService } from '../../src/services/compatibility';
import { usersService } from '../../src/services/users';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { DimensionKey, DimensionRatings, CompatibilityRecord } from '../../src/types';

const DIMENSIONS: { key: DimensionKey; label: string; description: string }[] = [
  { key: 'physical',     label: 'Physical',    description: 'Attraction and physical affection' },
  { key: 'intellectual', label: 'Intellectual', description: 'Shared curiosity and depth of conversation' },
  { key: 'emotional',    label: 'Emotional',   description: 'Safety, empathy, and emotional presence' },
  { key: 'values',       label: 'Values',      description: 'Core beliefs and life principles' },
  { key: 'lifeGoals',    label: 'Life Goals',  description: 'Where you both want to go in life' },
  { key: 'humor',        label: 'Humor',       description: 'Playfulness and levity together' },
];

const DEFAULT_RATINGS: DimensionRatings = { physical: 0, intellectual: 0, emotional: 0, values: 0, lifeGoals: 0, humor: 0 };
const MAX_STARS = 5;
const GAP_THRESHOLD = 2;

function computeScore(user: DimensionRatings, partner: DimensionRatings): number {
  const total = Object.values(user).reduce((s, v) => s + v, 0) + Object.values(partner).reduce((s, v) => s + v, 0);
  const max = DIMENSIONS.length * MAX_STARS * 2;
  return max > 0 ? Math.round((total / max) * 100) : 0;
}

function scoreColor(pct: number): string {
  if (pct >= 70) return '#268947';
  if (pct >= 45) return colors.amber;
  return colors.danger;
}

function StarRating({ value, onChange, color = colors.primary }: { value: number; onChange: (v: number) => void; color?: string }): JSX.Element {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: MAX_STARS }).map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i + 1)} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
          <Ionicons name={i < value ? 'star' : 'star-outline'} size={20} color={i < value ? color : '#D4D2CC'} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CompatibilityScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'user' | 'partner'>('user');

  const userQuery = useQuery({ queryKey: ['user', userId], queryFn: () => usersService.getById(userId) });
  const compatQuery = useQuery({ queryKey: ['compatibility', userId], queryFn: () => compatibilityService.getByUser(userId) });

  const mutation = useMutation({
    mutationFn: (record: Omit<CompatibilityRecord, 'id'> & { id?: number }) => compatibilityService.upsert(record),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compatibility', userId] }),
  });

  if (userQuery.isLoading || compatQuery.isLoading) return <LoadingScreen />;

  const user = userQuery.data;
  const existing = compatQuery.data?.[0];
  const userRatings: DimensionRatings = existing?.ratings?.user ?? { ...DEFAULT_RATINGS };
  const partnerRatings: DimensionRatings = existing?.ratings?.partner ?? { ...DEFAULT_RATINGS };
  const overallPct = computeScore(userRatings, partnerRatings);
  const oColor = scoreColor(overallPct);

  function handleRate(dim: DimensionKey, value: number): void {
    mutation.mutate({
      userId,
      ratings: {
        user: activeView === 'user' ? { ...userRatings, [dim]: value } : userRatings,
        partner: activeView === 'partner' ? { ...partnerRatings, [dim]: value } : partnerRatings,
      },
      ...(existing?.id ? { id: existing.id } : {}),
    });
  }

  function handleBridge(): void {
    const gaps = DIMENSIONS.filter((d) => Math.abs(userRatings[d.key] - partnerRatings[d.key]) > GAP_THRESHOLD);
    if (gaps.length === 0) {
      Alert.alert('Great alignment!', 'No significant gaps found. Keep nurturing each dimension.');
    } else {
      const names = gaps.map((d) => d.label).join(', ');
      Alert.alert('Gaps to address', `${names} ${gaps.length === 1 ? 'shows' : 'show'} a significant gap.`);
    }
  }

  const currentRatings = activeView === 'user' ? userRatings : partnerRatings;
  const otherRatings   = activeView === 'user' ? partnerRatings : userRatings;
  const hasGaps = DIMENSIONS.some((d) => Math.abs(userRatings[d.key] - partnerRatings[d.key]) > GAP_THRESHOLD && userRatings[d.key] > 0 && partnerRatings[d.key] > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Text style={styles.headerTitle}>LovePath</Text>
        <View style={[styles.scoreBadge, { backgroundColor: oColor + '22' }]}>
          <Text style={[styles.scoreBadgeText, { color: oColor }]}>{overallPct}%</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Compatibility Deep Dive</Text>
        <Text style={styles.subtitle}>Explore your relationship through its fundamental dimensions.</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: activeView === 'user' ? colors.primary : 'transparent' }]}
            onPress={() => setActiveView('user')}
          >
            <Ionicons name="person" size={14} color={activeView === 'user' ? colors.white : colors.muted} style={{ marginRight: 4 }} />
            <Text style={[styles.toggleText, { color: activeView === 'user' ? colors.white : colors.muted }]}>{user?.name ?? 'You'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: activeView === 'partner' ? colors.secondary : 'transparent' }]}
            onPress={() => setActiveView('partner')}
          >
            <Ionicons name="people" size={14} color={activeView === 'partner' ? colors.white : colors.muted} style={{ marginRight: 4 }} />
            <Text style={[styles.toggleText, { color: activeView === 'partner' ? colors.white : colors.muted }]}>Partner</Text>
          </TouchableOpacity>
        </View>

        {DIMENSIONS.map((dim) => {
          const myVal = currentRatings[dim.key];
          const theirVal = otherRatings[dim.key];
          const gap = Math.abs(myVal - theirVal);
          const hasGap = gap > GAP_THRESHOLD && theirVal > 0 && myVal > 0;
          const dotColor = hasGap ? colors.danger : activeView === 'user' ? colors.primary : colors.secondary;
          return (
            <View key={dim.key} style={styles.dimRow}>
              <View style={styles.dimHeader}>
                <View style={[styles.dimDot, { backgroundColor: dotColor }]} />
                <View style={styles.flex1}>
                  <Text style={styles.dimLabel}>{dim.label}</Text>
                  <Text style={styles.dimDesc}>{dim.description}</Text>
                </View>
              </View>
              <View style={styles.dimRating}>
                <StarRating value={myVal} onChange={(v) => handleRate(dim.key, v)} color={activeView === 'user' ? colors.primary : colors.secondary} />
                {hasGap && (
                  <View style={styles.gapFlag}>
                    <Ionicons name="warning" size={12} color={colors.amber} style={{ marginRight: 2 }} />
                    <Text style={[styles.gapText, { color: colors.amber }]}>Gap</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <View style={styles.overviewBlock}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <Text style={[styles.overviewPct, { color: oColor }]}>{overallPct}%</Text>
          </View>
          {DIMENSIONS.map((dim) => {
            const uVal = userRatings[dim.key];
            const pVal = partnerRatings[dim.key];
            return (
              <View key={dim.key} style={styles.barGroup}>
                <Text style={styles.barLabel}>{dim.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(uVal / MAX_STARS) * 100}%`, backgroundColor: colors.primary }]} />
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(pVal / MAX_STARS) * 100}%`, backgroundColor: colors.secondary, opacity: 0.6 }]} />
                </View>
              </View>
            );
          })}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>{user?.name ?? 'You'}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary, opacity: 0.6 }]} />
              <Text style={styles.legendText}>Partner</Text>
            </View>
          </View>
        </View>

        {hasGaps && (
          <View style={[styles.gapWarning, { backgroundColor: colors.amberTint }]}>
            <View style={styles.gapWarningHeader}>
              <Ionicons name="warning-outline" size={14} color={colors.amber} style={{ marginRight: 6 }} />
              <Text style={[styles.gapWarningTitle, { color: colors.amber }]}>Significant gaps detected</Text>
            </View>
            <Text style={styles.gapWarningBody}>A gap of more than {GAP_THRESHOLD} stars signals that a conversation is needed.</Text>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaBtn} onPress={handleBridge} activeOpacity={0.85}>
          <Text style={styles.ctaText}>How to bridge</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  spacer: { width: 24 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full },
  scoreBadgeText: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  scroll: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 20 },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.xl2,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: radii.xl },
  toggleText: { fontSize: fontSizes.sm, fontFamily: fonts.heading },
  dimRow: { marginBottom: 20 },
  dimHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  dimDot: { width: 10, height: 10, borderRadius: radii.full, marginTop: 6, marginRight: 12 },
  flex1: { flex: 1 },
  dimLabel: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.foreground },
  dimDesc: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  dimRating: { marginLeft: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  starRow: { flexDirection: 'row', gap: 4 },
  gapFlag: { flexDirection: 'row', alignItems: 'center' },
  gapText: { fontSize: fontSizes.caption, fontFamily: fonts.body },
  overviewBlock: { marginBottom: 24 },
  overviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  overviewTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground },
  overviewPct: { fontSize: fontSizes.sm, fontFamily: fonts.heading },
  barGroup: { marginBottom: 8 },
  barLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 2 },
  barTrack: { height: 6, borderRadius: radii.full, backgroundColor: colors.border, marginBottom: 2 },
  barFill: { height: 6, borderRadius: radii.full },
  legendRow: { flexDirection: 'row', marginTop: 12, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 12, height: 6, borderRadius: radii.full, marginRight: 6 },
  legendText: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  gapWarning: { borderRadius: radii.xl2, padding: 16, marginBottom: 24 },
  gapWarningHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  gapWarningTitle: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  gapWarningBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  ctaBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading, marginRight: 8 },
});
