import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { OBSTACLES } from '../../src/constants/obstacleGuide';
import { apiFetch, API } from '../../src/config/api';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { ObstacleRecord } from '../../src/types';

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function practiceKey(obstacleId: number, idx: number): string {
  return `${obstacleId}-${idx}`;
}

const ALL_PRACTICES = OBSTACLES.flatMap((o) =>
  o.practices.map((p, idx) => ({
    key: practiceKey(o.id, idx),
    text: p.text,
    obstacleTitle: o.title,
    phase: o.phase,
  })),
);

export default function DailyPracticeScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const today = todayKey();

  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');

  const { data: records, isLoading } = useQuery({
    queryKey: ['obstacleRecords', userId, today],
    queryFn: () =>
      apiFetch<ObstacleRecord[]>(`${API.obstacles}?userId=${userId}&date=${today}`),
  });

  const { data: allRecords } = useQuery({
    queryKey: ['obstacleRecords', userId],
    queryFn: () => apiFetch<ObstacleRecord[]>(`${API.obstacles}?userId=${userId}`),
  });

  const mutation = useMutation({
    mutationFn: (r: Omit<ObstacleRecord, 'id'> & { id?: number }) =>
      r.id
        ? apiFetch<ObstacleRecord>(`${API.obstacles}/${r.id}`, {
            method: 'PUT',
            body: JSON.stringify(r),
          })
        : apiFetch<ObstacleRecord>(API.obstacles, {
            method: 'POST',
            body: JSON.stringify(r),
          }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['obstacleRecords', userId, today] }),
  });

  const reflectionMutation = useMutation({
    mutationFn: (body: { userId: number; date: string; text: string }) =>
      apiFetch(API.reflections, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      setShowReflection(false);
      setReflectionText('');
    },
    onError: () => Alert.alert('Save failed', 'Could not save reflection. Please try again.'),
  });

  if (isLoading) return <LoadingScreen />;

  const record = records?.[0];
  const practices: Record<string, boolean> = record?.practices ?? {};

  function computeStreak(): number {
    if (!allRecords?.length) return 0;
    const dateSet = new Set(
      allRecords
        .filter((r) => Object.values(r.practices).some(Boolean))
        .map((r) => r.date),
    );
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const key = cursor.toISOString().split('T')[0];
      if (!dateSet.has(key)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function handleToggle(key: string): void {
    const next = { ...practices, [key]: !practices[key] };
    mutation.mutate({
      userId,
      date: today,
      practices: next,
      ...(record?.id ? { id: record.id } : {}),
    } as ObstacleRecord & { id?: number });
  }

  function handleSaveReflection(): void {
    if (!reflectionText.trim()) return;
    reflectionMutation.mutate({ userId, date: today, text: reflectionText.trim() });
  }

  const completed = ALL_PRACTICES.filter((p) => practices[p.key]);
  const remaining = ALL_PRACTICES.filter((p) => !practices[p.key]);
  const isEmpty = completed.length === 0;
  const streak = computeStreak();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LovePath</Text>
        <TouchableOpacity onPress={() => setShowReflection(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.streakCard}>
          <View style={styles.flex1}>
            <Text style={styles.streakSubtitle}>Current streak</Text>
            <Text style={styles.streakCount}>{streak}-day{streak !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.streakIconCircle}>
            <Ionicons name="flame" size={28} color={colors.white} />
          </View>
        </View>

        <Text style={styles.dateTitle}>{formatDate(today)}</Text>
        <Text style={styles.progressText}>
          {completed.length} of {ALL_PRACTICES.length} practices completed
        </Text>

        {isEmpty ? (
          <View style={styles.emptyBlock}>
            <Ionicons name="checkmark-circle-outline" size={56} color={colors.hint} />
            <Text style={styles.emptyTitle}>No practices completed yet</Text>
            <Text style={styles.emptyBody}>
              Head to the Obstacle Guide and check off practices to see them here.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace('/(tabs)/obstacles')}>
              <Text style={styles.emptyBtnText}>Open Obstacle Guide</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Completed — {completed.length}</Text>
              {completed.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={styles.practiceCard}
                  onPress={() => handleToggle(p.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkbox" size={18} color={colors.primary} style={{ marginRight: 10, marginTop: 1 }} />
                  <View style={styles.flex1}>
                    <Text style={styles.practiceCategory}>{p.obstacleTitle}</Text>
                    <Text style={styles.practiceDone}>{p.text}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {remaining.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>Remaining — {remaining.length}</Text>
                {remaining.slice(0, 5).map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={styles.practiceCard}
                    onPress={() => handleToggle(p.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="square-outline" size={18} color={colors.hint} style={{ marginRight: 10, marginTop: 1 }} />
                    <View style={styles.flex1}>
                      <Text style={styles.practiceCategory}>{p.obstacleTitle}</Text>
                      <Text style={styles.practiceText}>{p.text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {remaining.length > 5 && (
                  <Text style={styles.moreText}>+{remaining.length - 5} more in the Obstacle Guide</Text>
                )}
              </View>
            )}
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {!isEmpty && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.reflectBtn} onPress={() => setShowReflection(true)} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.reflectBtnText}>Add reflection</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showReflection} transparent animationType="slide" onRequestClose={() => setShowReflection(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowReflection(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Today's reflection</Text>
          <Text style={styles.sheetDate}>{formatDate(today)}</Text>
          <TextInput
            style={styles.journalInput}
            placeholder="What shifted for you today? What did you notice?"
            placeholderTextColor={colors.hint}
            value={reflectionText}
            onChangeText={setReflectionText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveReflection}
            disabled={reflectionMutation.isPending}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>Save reflection</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  streakCard: { backgroundColor: colors.primary, borderRadius: radii.xl2, padding: 16, marginTop: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
  streakSubtitle: { color: colors.white, fontSize: fontSizes.caption, fontFamily: fonts.body, opacity: 0.8, marginBottom: 4 },
  streakCount: { color: colors.white, fontSize: fontSizes.xl3, fontFamily: fonts.heading },
  streakIconCircle: { width: 56, height: 56, borderRadius: radii.full, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  dateTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 4 },
  progressText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 20 },
  emptyBlock: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 8 },
  emptyBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, textAlign: 'center', paddingHorizontal: 24, marginBottom: 24 },
  emptyBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: radii.full, paddingVertical: 12, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
  emptyBtnText: { color: colors.primary, fontSize: fontSizes.sm, fontFamily: fonts.heading, marginRight: 4 },
  sectionBlock: { marginBottom: 24 },
  sectionLabel: { fontSize: fontSizes.caption, fontFamily: fonts.heading, color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  practiceCard: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, backgroundColor: colors.card, borderRadius: radii.xl, padding: 12, borderWidth: 1, borderColor: colors.border },
  practiceCategory: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 2 },
  practiceDone: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, textDecorationLine: 'line-through' },
  practiceText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  moreText: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, textAlign: 'center', marginTop: 4 },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  reflectBtn: { width: '100%', borderWidth: 1, borderColor: colors.primary, borderRadius: radii.full, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  reflectBtnText: { color: colors.primary, fontSize: fontSizes.base, fontFamily: fonts.heading },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radii.xl3, borderTopRightRadius: radii.xl3, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: fontSizes.lg, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 4 },
  sheetDate: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 16 },
  journalInput: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radii.xl, paddingHorizontal: 16, paddingVertical: 12, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground, marginBottom: 24, minHeight: 120 },
  saveBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
