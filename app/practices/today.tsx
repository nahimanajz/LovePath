import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { OBSTACLES } from '../../src/constants/obstacleGuide';
import { apiFetch, API } from '../../src/config/api';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
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

// All practices flattened with metadata
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

  // All past records to compute streak
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
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <TouchableOpacity onPress={() => setShowReflection(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="create-outline" size={22} color="#C0556A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Streak card */}
        <View className="bg-primary rounded-2xl p-4 mt-4 mb-5 flex-row items-center">
          <View className="flex-1">
            <Text className="text-white text-xs font-body opacity-80 mb-1">Current streak</Text>
            <Text className="text-white text-3xl font-heading">{streak}-day{streak !== 1 ? 's' : ''}</Text>
          </View>
          <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="flame" size={28} color="#FFFFFF" />
          </View>
        </View>

        {/* Date header */}
        <Text className="text-base font-heading text-foreground mb-1">{formatDate(today)}</Text>
        <Text className="text-sm font-body text-muted mb-5">
          {completed.length} of {ALL_PRACTICES.length} practices completed
        </Text>

        {isEmpty ? (
          /* Empty state */
          <View className="items-center py-12">
            <Ionicons name="checkmark-circle-outline" size={56} color="#B4B2A9" />
            <Text className="text-base font-heading text-foreground mt-4 mb-2">
              No practices completed yet
            </Text>
            <Text className="text-sm font-body text-muted text-center px-6 mb-6">
              Head to the Obstacle Guide and check off practices to see them here.
            </Text>
            <TouchableOpacity
              className="border border-primary rounded-full py-3 px-6 flex-row items-center"
              onPress={() => router.replace('/(tabs)/obstacles')}
            >
              <Text className="text-primary text-sm font-heading mr-1">Open Obstacle Guide</Text>
              <Ionicons name="arrow-forward" size={14} color="#C0556A" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Completed section */}
            <View className="mb-6">
              <Text className="text-xs font-heading text-muted tracking-widest uppercase mb-3">
                Completed — {completed.length}
              </Text>
              {completed.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  className="flex-row items-start mb-3 bg-card rounded-xl p-3 border border-border"
                  onPress={() => handleToggle(p.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkbox" size={18} color="#C0556A" style={{ marginRight: 10, marginTop: 1 }} />
                  <View className="flex-1">
                    <Text className="text-xs font-body text-muted mb-0.5">{p.obstacleTitle}</Text>
                    <Text className="text-sm font-body line-through text-muted">{p.text}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Remaining section */}
            {remaining.length > 0 && (
              <View className="mb-6">
                <Text className="text-xs font-heading text-muted tracking-widest uppercase mb-3">
                  Remaining — {remaining.length}
                </Text>
                {remaining.slice(0, 5).map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    className="flex-row items-start mb-3 bg-card rounded-xl p-3 border border-border"
                    onPress={() => handleToggle(p.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="square-outline" size={18} color="#B4B2A9" style={{ marginRight: 10, marginTop: 1 }} />
                    <View className="flex-1">
                      <Text className="text-xs font-body text-muted mb-0.5">{p.obstacleTitle}</Text>
                      <Text className="text-sm font-body text-foreground">{p.text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {remaining.length > 5 && (
                  <Text className="text-xs font-body text-muted text-center mt-1">
                    +{remaining.length - 5} more in the Obstacle Guide
                  </Text>
                )}
              </View>
            )}
          </>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Reflection CTA */}
      {!isEmpty && (
        <View className="px-5 pb-6">
          <TouchableOpacity
            className="w-full border border-primary rounded-full py-4 flex-row items-center justify-center"
            onPress={() => setShowReflection(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={18} color="#C0556A" style={{ marginRight: 8 }} />
            <Text className="text-primary text-base font-heading">Add reflection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reflection modal */}
      <Modal visible={showReflection} transparent animationType="slide" onRequestClose={() => setShowReflection(false)}>
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={() => setShowReflection(false)} />
        <View className="bg-background rounded-t-3xl px-5 pt-6 pb-10">
          <Text className="text-lg font-heading text-foreground mb-1">Today's reflection</Text>
          <Text className="text-xs font-body text-muted mb-4">{formatDate(today)}</Text>
          <TextInput
            className="bg-card border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground mb-6"
            placeholder="What shifted for you today? What did you notice?"
            placeholderTextColor="#B4B2A9"
            value={reflectionText}
            onChangeText={setReflectionText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={{ minHeight: 120 }}
          />
          <TouchableOpacity
            className="w-full bg-primary rounded-full py-4 items-center"
            onPress={handleSaveReflection}
            disabled={reflectionMutation.isPending}
            activeOpacity={0.85}
          >
            <Text className="text-white text-base font-heading">Save reflection</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
