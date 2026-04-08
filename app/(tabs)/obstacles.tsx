import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { OBSTACLES } from '../../src/constants/obstacleGuide';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { apiFetch, API } from '../../src/config/api';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { ObstaclePhase, ObstacleRecord } from '../../src/types';

type FilterTab = 'All' | ObstaclePhase;
const TABS: FilterTab[] = ['All', 'Perception', 'Action', 'Will'];

const PHASE_COLORS: Record<ObstaclePhase, { bg: string; text: string }> = {
  Perception: { bg: colors.purpleTint, text: colors.secondary },
  Action:     { bg: colors.tealTint,   text: '#268947' },
  Will:       { bg: colors.roseTint,   text: colors.primary },
};

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export default function ObstaclesScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const today = todayKey();

  const { data: records, isLoading } = useQuery({
    queryKey: ['obstacleRecords', userId, today],
    queryFn: () => apiFetch<ObstacleRecord[]>(`${API.obstacles}?userId=${userId}&date=${today}`),
  });

  const mutation = useMutation({
    mutationFn: (r: Omit<ObstacleRecord, 'id'> & { id?: number }) =>
      r.id
        ? apiFetch<ObstacleRecord>(`${API.obstacles}/${r.id}`, { method: 'PUT', body: JSON.stringify(r) })
        : apiFetch<ObstacleRecord>(API.obstacles, { method: 'POST', body: JSON.stringify(r) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['obstacleRecords', userId, today] }),
  });

  if (isLoading) return <LoadingScreen />;

  const record = records?.[0];
  const practices: Record<string, boolean> = record?.practices ?? {};

  function practiceKey(obstacleId: number, practiceIdx: number): string {
    return `${obstacleId}-${practiceIdx}`;
  }

  function handleToggle(obstacleId: number, practiceIdx: number): void {
    const key = practiceKey(obstacleId, practiceIdx);
    const next = { ...practices, [key]: !practices[key] };
    mutation.mutate({ userId, date: today, practices: next, ...(record?.id ? { id: record.id } : {}) } as ObstacleRecord & { id?: number });
  }

  function checkedCount(obstacleId: number): number {
    return OBSTACLES.find((o) => o.id === obstacleId)?.practices.reduce(
      (count, _, idx) => count + (practices[practiceKey(obstacleId, idx)] ? 1 : 0), 0,
    ) ?? 0;
  }

  const totalCompleted = OBSTACLES.reduce((sum, o) => sum + checkedCount(o.id), 0);
  const filtered = activeTab === 'All' ? OBSTACLES : OBSTACLES.filter((o) => o.phase === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Text style={styles.headerTitle}>LovePath</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Obstacle Guide</Text>
        <Text style={styles.subtitle}>Ryan Holiday's Stoic framework for love's hardships.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8 }}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.filterTab,
              { backgroundColor: activeTab === tab ? colors.primary : 'transparent', borderColor: activeTab === tab ? colors.primary : colors.border },
            ]}
          >
            <Text style={[styles.filterTabText, { color: activeTab === tab ? colors.white : colors.muted }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((obstacle) => {
          const isExpanded = expandedId === obstacle.id;
          const ps = PHASE_COLORS[obstacle.phase];
          const checked = checkedCount(obstacle.id);
          const total = obstacle.practices.length;

          return (
            <View key={obstacle.id} style={styles.card}>
              <TouchableOpacity style={styles.cardHeader} onPress={() => setExpandedId(isExpanded ? null : obstacle.id)} activeOpacity={0.7}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.phasePill, { backgroundColor: ps.bg }]}>
                    <Text style={[styles.phaseText, { color: ps.text }]}>{obstacle.phase.toUpperCase()}</Text>
                  </View>
                  <View style={styles.countRow}>
                    <Text style={styles.countText}>{checked}/{total}</Text>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
                  </View>
                </View>
                <Text style={styles.cardTitle}>{obstacle.title}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.cardBody}>
                  <View style={styles.divider} />
                  <Text style={styles.insightText}>{obstacle.insight}</Text>
                  <Text style={styles.practicesLabel}>Today's practices</Text>
                  {obstacle.practices.map((practice, idx) => {
                    const key = practiceKey(obstacle.id, idx);
                    const isChecked = practices[key] ?? false;
                    return (
                      <TouchableOpacity key={idx} style={styles.practiceRow} onPress={() => handleToggle(obstacle.id, idx)} activeOpacity={0.7}>
                        <Ionicons name={isChecked ? 'checkbox' : 'square-outline'} size={18} color={isChecked ? colors.primary : colors.hint} style={{ marginRight: 10, marginTop: 1 }} />
                        <Text style={[styles.practiceText, isChecked && styles.practiceChecked]}>{practice.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        {totalCompleted > 0 && (
          <Text style={styles.completedLabel}>{totalCompleted} practice{totalCompleted !== 1 ? 's' : ''} completed today</Text>
        )}
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/practices/today')} activeOpacity={0.85}>
          <Text style={styles.ctaText}>View today's completed practices</Text>
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
  titleBlock: { paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 4 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted },
  filterScroll: { paddingHorizontal: 20, marginBottom: 16, flexGrow: 0 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1 },
  filterTabText: { fontSize: fontSizes.sm, fontFamily: fonts.body },
  scroll: { flex: 1, paddingHorizontal: 20 },
  card: { backgroundColor: colors.card, borderRadius: radii.xl2, marginBottom: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardHeader: { padding: 16 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  phasePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full },
  phaseText: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countText: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  cardTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground },
  cardBody: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  insightText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground, lineHeight: 20, marginBottom: 16, fontStyle: 'italic' },
  practicesLabel: { fontSize: fontSizes.caption, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 12 },
  practiceRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  practiceText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  practiceChecked: { textDecorationLine: 'line-through', color: colors.muted },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  completedLabel: { textAlign: 'center', fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 12 },
  ctaBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
