import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { rebuildService } from '../../src/services/rebuild';
import { usersService } from '../../src/services/users';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { RebuildBehavior, RebuildSliders, RebuildRecord } from '../../src/types';

const BEHAVIORS: { key: RebuildBehavior; label: string; description: string }[] = [
  { key: 'knowing',     label: 'Knowing',     description: "Understanding their inner world and goals" },
  { key: 'supporting',  label: 'Supporting',  description: "Showing up when it matters most" },
  { key: 'championing', label: 'Championing', description: "Actively promoting their growth and dreams" },
  { key: 'leading',     label: 'Leading',     description: "Initiating positive change" },
  { key: 'investing',   label: 'Investing',   description: "Putting real time and energy into them" },
];

const DEFAULT_SLIDERS: RebuildSliders = { knowing: 0, supporting: 0, championing: 0, leading: 0, investing: 0 };
const MAX_PER = 10;
const MAX_TOTAL = BEHAVIORS.length * MAX_PER;
const GAP_THRESHOLD = 30;

function scorePct(s: RebuildSliders): number {
  return Math.round((Object.values(s).reduce((a, b) => a + b, 0) / MAX_TOTAL) * 100);
}

function BarControl({ value, partnerValue, onInc, onDec, color }: { value: number; partnerValue: number; onInc: () => void; onDec: () => void; color: string }): JSX.Element {
  return (
    <View style={styles.barControlRow}>
      <TouchableOpacity onPress={onDec} disabled={value <= 0} style={styles.barBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="remove" size={14} color={value <= 0 ? '#D4D2CC' : colors.foreground} />
      </TouchableOpacity>
      <View style={styles.barFlex}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${(value / MAX_PER) * 100}%`, backgroundColor: color }]} />
        </View>
        <View style={[styles.barTrack, { opacity: 0.4 }]}>
          <View style={[styles.barFill, { width: `${(partnerValue / MAX_PER) * 100}%`, backgroundColor: colors.secondary }]} />
        </View>
      </View>
      <Text style={[styles.barValue, { color }]}>{value}</Text>
      <TouchableOpacity onPress={onInc} disabled={value >= MAX_PER} style={styles.barBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="add" size={14} color={value >= MAX_PER ? '#D4D2CC' : colors.foreground} />
      </TouchableOpacity>
    </View>
  );
}

export default function RebuildScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'user' | 'partner'>('user');

  const userQuery = useQuery({ queryKey: ['user', userId], queryFn: () => usersService.getById(userId) });
  const rebuildQuery = useQuery({ queryKey: ['rebuild', userId], queryFn: () => rebuildService.getByUser(userId) });

  const mutation = useMutation({
    mutationFn: (r: Omit<RebuildRecord, 'id'> & { id?: number }) => rebuildService.upsert(r),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rebuild', userId] }),
    onError: () => Alert.alert('Save failed', 'Could not save. Please try again.'),
  });

  if (userQuery.isLoading || rebuildQuery.isLoading) return <LoadingScreen />;

  const user = userQuery.data;
  const existing = rebuildQuery.data?.[0];
  const userS: RebuildSliders = existing?.user ?? { ...DEFAULT_SLIDERS };
  const partnerS: RebuildSliders = existing?.partner ?? { ...DEFAULT_SLIDERS };

  const userPct = scorePct(userS);
  const partnerPct = scorePct(partnerS);
  const gap = Math.abs(userPct - partnerPct);
  const hasGap = gap > GAP_THRESHOLD;
  const currentS = activeView === 'user' ? userS : partnerS;
  const otherS = activeView === 'user' ? partnerS : userS;
  const activeColor = activeView === 'user' ? colors.primary : colors.secondary;

  function adjust(key: RebuildBehavior, delta: number): void {
    const src = activeView === 'user' ? userS : partnerS;
    const next = Math.max(0, Math.min(MAX_PER, src[key] + delta));
    mutation.mutate({
      userId,
      user:    activeView === 'user'    ? { ...userS,    [key]: next } : userS,
      partner: activeView === 'partner' ? { ...partnerS, [key]: next } : partnerS,
      ...(existing?.id ? { id: existing.id } : {}),
    } as RebuildRecord & { id?: number });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Text style={styles.headerTitle}>LovePath</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Rebuild Together</Text>
        <Text style={styles.subtitle}>Beam's Aspiration stage: both people champion each other's individual growth.</Text>

        <View style={[styles.coachCard, { backgroundColor: colors.tealTint }]}>
          <View style={styles.coachHeader}>
            <Ionicons name="sparkles" size={14} color="#268947" style={{ marginRight: 6 }} />
            <Text style={[styles.coachLabel, { color: '#268947' }]}>AI Coach</Text>
          </View>
          <Text style={styles.coachBody}>"Focus on something bigger than yourself — Holiday reminds us that championing your partner's dreams dissolves ego and deepens love."</Text>
        </View>

        {hasGap && (
          <View style={styles.gapCard}>
            <View style={styles.gapHeader}>
              <Ionicons name="warning-outline" size={14} color={colors.amber} style={{ marginRight: 6 }} />
              <Text style={[styles.gapTitle, { color: colors.amber }]}>{gap}% contribution gap</Text>
            </View>
            <Text style={styles.gapBody}>
              {userPct > partnerPct
                ? 'You are contributing significantly more. Name this before it builds into resentment.'
                : 'Your partner is contributing more. Acknowledge it and redistribute.'}
            </Text>
          </View>
        )}

        <View style={styles.toggleRow}>
          <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: activeView === 'user' ? colors.primary : 'transparent' }]} onPress={() => setActiveView('user')}>
            <Text style={[styles.toggleText, { color: activeView === 'user' ? colors.white : colors.muted }]}>{user?.name ?? 'You'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, { backgroundColor: activeView === 'partner' ? colors.secondary : 'transparent' }]} onPress={() => setActiveView('partner')}>
            <Text style={[styles.toggleText, { color: activeView === 'partner' ? colors.white : colors.muted }]}>Partner</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Behavioral Alignment</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>{user?.name ?? 'You'}</Text>
          <View style={[styles.legendDot, styles.legendDotSecondary]} />
          <Text style={styles.legendText}>Partner</Text>
        </View>

        <View style={styles.behaviorsBlock}>
          {BEHAVIORS.map((b) => (
            <View key={b.key} style={styles.behaviorRow}>
              <View style={styles.behaviorHeader}>
                <Text style={styles.behaviorLabel}>{b.label}</Text>
                <Text style={styles.behaviorDesc}>{b.description}</Text>
              </View>
              <BarControl value={currentS[b.key]} partnerValue={otherS[b.key]} onInc={() => adjust(b.key, 1)} onDec={() => adjust(b.key, -1)} color={activeColor} />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Rebuild Score Board</Text>
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreCell}>
              <Text style={styles.scoreName}>{user?.name ?? 'You'}</Text>
              <Text style={[styles.scoreValue, { color: colors.primary }]}>{userPct}%</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreCell}>
              <Text style={styles.scoreName}>Partner</Text>
              <Text style={[styles.scoreValue, { color: colors.secondary }]}>{partnerPct}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/rebuild/ego-check')} activeOpacity={0.85}>
          <Text style={styles.outlineBtnText}>Check ego patterns</Text>
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
  scroll: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 16 },
  coachCard: { borderRadius: radii.xl2, padding: 16, marginBottom: 20 },
  coachHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  coachLabel: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  coachBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground, fontStyle: 'italic' },
  gapCard: { backgroundColor: colors.amberTint, borderRadius: radii.xl2, padding: 16, marginBottom: 16 },
  gapHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  gapTitle: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  gapBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radii.xl2,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: radii.xl, alignItems: 'center' },
  toggleText: { fontSize: fontSizes.sm, fontFamily: fonts.heading },
  sectionTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendDot: { width: 12, height: 6, borderRadius: radii.full, backgroundColor: colors.primary, marginRight: 6 },
  legendDotSecondary: { backgroundColor: colors.secondary, opacity: 0.4, marginLeft: 16 },
  legendText: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginRight: 16 },
  behaviorsBlock: { marginBottom: 20 },
  behaviorRow: { marginBottom: 16 },
  behaviorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  behaviorLabel: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  behaviorDesc: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  barControlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBtn: { width: 28, height: 28, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  barFlex: { flex: 1 },
  barTrack: { height: 6, borderRadius: radii.full, backgroundColor: colors.border, marginBottom: 4 },
  barFill: { height: 6, borderRadius: radii.full },
  barValue: { fontSize: fontSizes.caption, fontFamily: fonts.heading, width: 20, textAlign: 'right' },
  scoreCard: { backgroundColor: colors.card, borderRadius: radii.xl2, padding: 16, marginBottom: 32, borderWidth: 1, borderColor: colors.border },
  scoreRow: { flexDirection: 'row' },
  scoreCell: { flex: 1, alignItems: 'center' },
  scoreName: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 4 },
  scoreValue: { fontSize: fontSizes.xl4, fontFamily: fonts.heading },
  scoreDivider: { width: 1, backgroundColor: colors.border },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  outlineBtn: { width: '100%', borderWidth: 1, borderColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  outlineBtnText: { color: colors.primary, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
