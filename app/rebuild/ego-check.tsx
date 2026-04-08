import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { egoService } from '../../src/services/egoChecks';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';

const EGO_PATTERNS = [
  'I need to feel loved before I give love',
  "I feel diminished by my partner's success or praise from others",
  'I withhold warmth when I feel ignored or underappreciated',
  'I need acknowledgement to keep investing in the relationship',
  'I avoid apologising to protect my image',
  'I keep a mental score of past wrongs to use later',
];

const AFFIRMATION =
  '"Ego is the enemy of the very performance it is trying to protect." — Ryan Holiday\n\nThe relationship is not about winning. It is about building something bigger than yourself.';

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function alertConfig(count: number): { label: string; body: string; color: string; bg: string } {
  if (count === 0) {
    return {
      label: 'Clear today',
      body: 'No ego patterns active. Keep this awareness through the day.',
      color: '#268947',
      bg: colors.tealTint,
    };
  }
  if (count <= 2) {
    return {
      label: 'Ego pattern detected',
      body: `${count} pattern${count > 1 ? 's' : ''} checked. Notice these without judgement — awareness is the first step.`,
      color: colors.amber,
      bg: colors.amberTint,
    };
  }
  if (count <= 4) {
    return {
      label: 'Ego Warning',
      body: `${count} patterns active. Your ego is significantly affecting your relationship delivery. Consider working through Obstacle 6.`,
      color: '#E97F27',
      bg: '#FDEBD8',
    };
  }
  return {
    label: 'Ego Critical',
    body: `${count} patterns active. Ego is critically blocking reconnection. This is the obstacle that cannot be avoided.`,
    color: colors.danger,
    bg: colors.roseTint,
  };
}

export default function EgoCheckScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const today = todayKey();

  const { data, isLoading } = useQuery({
    queryKey: ['egoChecks', userId, today],
    queryFn: () => egoService.getByUser(userId),
  });

  const mutation = useMutation({
    mutationFn: (r: { patterns: boolean[]; existingId?: number }) =>
      r.existingId
        ? egoService.update(r.existingId, { patterns: r.patterns })
        : egoService.create({ userId, date: today, patterns: r.patterns }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['egoChecks', userId, today] }),
  });

  if (isLoading) return <LoadingScreen />;

  const existing = data?.find((r) => r.date === today);
  const patterns: boolean[] = existing?.patterns ?? Array(EGO_PATTERNS.length).fill(false);
  const checkedCount = patterns.filter(Boolean).length;
  const alert = alertConfig(checkedCount);

  function handleToggle(idx: number): void {
    const next = patterns.map((v, i) => (i === idx ? !v : v));
    mutation.mutate({ patterns: next, existingId: existing?.id });
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
        <Text style={styles.title}>Ego Check</Text>
        <Text style={styles.subtitle}>
          Holiday and Beam both identify ego — not incompatibility — as the primary destroyer of deep love.
        </Text>

        <View style={[styles.alertCard, { backgroundColor: alert.bg }]}>
          <View style={styles.alertHeader}>
            <Ionicons
              name={checkedCount === 0 ? 'checkmark-circle-outline' : 'warning-outline'}
              size={14}
              color={alert.color}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.alertLabel, { color: alert.color }]}>{alert.label}</Text>
          </View>
          <Text style={styles.alertBody}>{alert.body}</Text>
        </View>

        <Text style={styles.checkTitle}>Check what applies to you right now</Text>
        <Text style={styles.checkSubtitle}>Today only. Results are not shared with your partner.</Text>

        {EGO_PATTERNS.map((pattern, idx) => {
          const checked = patterns[idx] ?? false;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.patternCard}
              onPress={() => handleToggle(idx)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={checked ? 'checkbox' : 'square-outline'}
                size={20}
                color={checked ? colors.primary : colors.hint}
                style={{ marginRight: 12, marginTop: 1 }}
              />
              <Text style={[styles.patternText, checked && styles.patternChecked]}>
                {pattern}
              </Text>
            </TouchableOpacity>
          );
        })}

        {checkedCount > 0 && (
          <View style={styles.affirmCard}>
            <Text style={styles.affirmTitle}>Reflect on this</Text>
            <Text style={styles.affirmText}>{AFFIRMATION}</Text>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push('/(tabs)/obstacles')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>How to work through ego →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  spacer: { width: 24 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 20 },
  alertCard: { borderRadius: radii.xl2, padding: 16, marginBottom: 20 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  alertLabel: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  alertBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  checkTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 12 },
  checkSubtitle: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 16 },
  patternCard: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, backgroundColor: colors.card, borderRadius: radii.xl, padding: 16, borderWidth: 1, borderColor: colors.border },
  patternText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  patternChecked: { color: colors.muted, textDecorationLine: 'line-through' },
  affirmCard: { backgroundColor: colors.roseTint, borderRadius: radii.xl2, padding: 16, marginBottom: 24, marginTop: 8 },
  affirmTitle: { fontSize: fontSizes.caption, fontFamily: fonts.heading, color: colors.primary, marginBottom: 8 },
  affirmText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground, lineHeight: 20, fontStyle: 'italic' },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  ctaBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
