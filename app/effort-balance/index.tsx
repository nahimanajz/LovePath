import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { effortService } from '../../src/services/effortBalance';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { EffortBehavior, EffortSliders, EffortBalanceRecord } from '../../src/types';

const BEHAVIORS: { key: EffortBehavior; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'initiating', label: 'Initiating connection',  icon: 'flash-outline' },
  { key: 'listening',  label: 'Active listening',       icon: 'ear-outline' },
  { key: 'planning',   label: 'Planning dates',         icon: 'calendar-outline' },
  { key: 'support',    label: 'Emotional support',      icon: 'heart-outline' },
  { key: 'honesty',    label: 'Honest communication',   icon: 'chatbubble-ellipses-outline' },
];

const DEFAULT_SLIDERS: EffortSliders = { initiating: 0, listening: 0, planning: 0, support: 0, honesty: 0 };
const MAX_PER = 10;
const MAX_TOTAL = BEHAVIORS.length * MAX_PER;

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

function total(s: EffortSliders): number {
  return Object.values(s).reduce((a, b) => a + b, 0);
}

function balancePct(u: number, p: number): number {
  const sum = u + p;
  return sum === 0 ? 50 : Math.round((u / sum) * 100);
}

function status(pct: number): { label: string; color: string } {
  const diff = Math.abs(pct - 50);
  if (diff < 10) return { label: 'Balanced', color: '#268947' };
  if (diff < 20) return { label: 'Slight imbalance', color: colors.amber };
  return { label: 'Significant imbalance', color: colors.danger };
}

function BarSlider({ value, onInc, onDec, color }: { value: number; onInc: () => void; onDec: () => void; color: string }): JSX.Element {
  return (
    <View style={styles.sliderRow}>
      <TouchableOpacity onPress={onDec} disabled={value <= 0} style={styles.sliderBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="remove" size={14} color={value <= 0 ? '#D4D2CC' : colors.foreground} />
      </TouchableOpacity>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderFill, { width: `${(value / MAX_PER) * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.sliderValue, { color }]}>{value}</Text>
      <TouchableOpacity onPress={onInc} disabled={value >= MAX_PER} style={styles.sliderBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="add" size={14} color={value >= MAX_PER ? '#D4D2CC' : colors.foreground} />
      </TouchableOpacity>
    </View>
  );
}

export default function EffortBalanceScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const weekOf = getMonday();

  const { data, isLoading } = useQuery({ queryKey: ['effortBalance', userId], queryFn: () => effortService.getByUser(userId) });

  const mutation = useMutation({
    mutationFn: (r: Omit<EffortBalanceRecord, 'id'> & { id?: number }) => effortService.upsert(r),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['effortBalance', userId] }),
  });

  if (isLoading) return <LoadingScreen />;

  const existing = data?.find((r) => r.weekOf === weekOf) ?? data?.[0];
  const userS: EffortSliders = existing?.user ?? { ...DEFAULT_SLIDERS };
  const partnerS: EffortSliders = existing?.partner ?? { ...DEFAULT_SLIDERS };

  const uTotal = total(userS);
  const pTotal = total(partnerS);
  const pct = balancePct(uTotal, pTotal);
  const st = status(pct);
  const isEmpty = uTotal === 0 && pTotal === 0;

  function adjust(who: 'user' | 'partner', key: EffortBehavior, delta: number): void {
    const src = who === 'user' ? userS : partnerS;
    const next = Math.max(0, Math.min(MAX_PER, src[key] + delta));
    mutation.mutate({
      userId, weekOf,
      user:    who === 'user'    ? { ...userS,    [key]: next } : userS,
      partner: who === 'partner' ? { ...partnerS, [key]: next } : partnerS,
      ...(existing?.id ? { id: existing.id } : {}),
    } as EffortBalanceRecord & { id?: number });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LovePath</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Effort Balance</Text>
        <Text style={styles.subtitle}>Track who is carrying the relationship this week.</Text>
        <Text style={styles.weekLabel}>Last updated: {weekOf}</Text>

        {isEmpty ? (
          <View style={styles.emptyBlock}>
            <Ionicons name="scale-outline" size={48} color={colors.hint} />
            <Text style={styles.emptyTitle}>No ratings yet</Text>
            <Text style={styles.emptyBody}>Use the controls below to rate how much each of you is contributing this week.</Text>
          </View>
        ) : (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Balance this week</Text>
            <View style={styles.balanceTrack}>
              <View style={[styles.balanceFill, { width: `${pct}%` }]} />
            </View>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceSide, { color: colors.primary }]}>You {pct}%</Text>
              <Text style={[styles.balanceSide, { color: colors.secondary }]}>Partner {100 - pct}%</Text>
            </View>
            <Text style={[styles.statusLabel, { color: st.color }]}>{st.label}</Text>
          </View>
        )}

        {!isEmpty && Math.abs(pct - 50) >= 20 && (
          <View style={styles.imbalanceCard}>
            <View style={styles.imbalanceHeader}>
              <Ionicons name="warning-outline" size={14} color={colors.amber} style={{ marginRight: 6 }} />
              <Text style={[styles.imbalanceTitle, { color: colors.amber }]}>Imbalance alert</Text>
            </View>
            <Text style={styles.imbalanceBody}>
              {pct >= 70
                ? 'You are carrying significantly more this week. Acknowledge it before it builds into resentment.'
                : 'Your partner is carrying more this week. Recognizing this openly prevents build-up.'}
            </Text>
          </View>
        )}

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.sectionTitle}>Your investment</Text>
            <Text style={[styles.sectionTotal, { color: colors.primary }]}>{uTotal}/{MAX_TOTAL}</Text>
          </View>
          {BEHAVIORS.map((b) => (
            <View key={`u-${b.key}`} style={styles.behaviorItem}>
              <View style={styles.behaviorLabel}>
                <Ionicons name={b.icon} size={14} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.behaviorText}>{b.label}</Text>
              </View>
              <BarSlider value={userS[b.key]} onInc={() => adjust('user', b.key, 1)} onDec={() => adjust('user', b.key, -1)} color={colors.primary} />
            </View>
          ))}
        </View>

        <View style={[styles.sectionBlock, styles.partnerBlock]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
            <Text style={styles.sectionTitle}>Partner's investment</Text>
            <Text style={[styles.sectionTotal, { color: colors.secondary }]}>{pTotal}/{MAX_TOTAL}</Text>
          </View>
          {BEHAVIORS.map((b) => (
            <View key={`p-${b.key}`} style={styles.behaviorItem}>
              <View style={styles.behaviorLabel}>
                <Ionicons name={b.icon} size={14} color={colors.secondary} style={{ marginRight: 6 }} />
                <Text style={styles.behaviorText}>{b.label}</Text>
              </View>
              <BarSlider value={partnerS[b.key]} onInc={() => adjust('partner', b.key, 1)} onDec={() => adjust('partner', b.key, -1)} color={colors.secondary} />
            </View>
          ))}
        </View>
      </ScrollView>
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
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 4 },
  weekLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.hint, marginBottom: 20 },
  emptyBlock: { alignItems: 'center', paddingVertical: 40, marginBottom: 24 },
  emptyTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 8 },
  emptyBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, textAlign: 'center', paddingHorizontal: 24 },
  balanceCard: { backgroundColor: colors.card, borderRadius: radii.xl2, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  balanceLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 8, textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase' },
  balanceTrack: { height: 12, borderRadius: radii.full, backgroundColor: colors.border, overflow: 'hidden', marginBottom: 8 },
  balanceFill: { height: 12, borderRadius: radii.full, backgroundColor: colors.primary, position: 'absolute', left: 0, top: 0 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  balanceSide: { fontSize: fontSizes.caption, fontFamily: fonts.body },
  statusLabel: { fontSize: fontSizes.sm, fontFamily: fonts.heading, textAlign: 'center' },
  imbalanceCard: { backgroundColor: colors.amberTint, borderRadius: radii.xl2, padding: 16, marginBottom: 20 },
  imbalanceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  imbalanceTitle: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  imbalanceBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  sectionBlock: { marginBottom: 8 },
  partnerBlock: { marginTop: 16, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: radii.full, marginRight: 8 },
  sectionTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground },
  sectionTotal: { marginLeft: 'auto', fontSize: fontSizes.caption, fontFamily: fonts.heading },
  behaviorItem: { marginBottom: 12 },
  behaviorLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  behaviorText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderBtn: { width: 28, height: 28, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  sliderTrack: { flex: 1, height: 8, borderRadius: radii.full, backgroundColor: colors.border },
  sliderFill: { height: 8, borderRadius: radii.full },
  sliderValue: { fontSize: fontSizes.caption, fontFamily: fonts.heading, width: 24, textAlign: 'center' },
});
