import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { OBSTACLES } from '../../src/constants/obstacleGuide';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { apiFetch, API } from '../../src/config/api';
import type { ObstaclePhase, ObstacleRecord } from '../../src/types';

type FilterTab = 'All' | ObstaclePhase;
const TABS: FilterTab[] = ['All', 'Perception', 'Action', 'Will'];

const PHASE_STYLES: Record<ObstaclePhase, { bg: string; text: string }> = {
  Perception: { bg: '#EEEDFE', text: '#7F77DD' },
  Action:     { bg: '#E1F5EE', text: '#268947' },
  Will:       { bg: '#FDE8EC', text: '#C0556A' },
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
    queryFn: () =>
      apiFetch<ObstacleRecord[]>(`${API.obstacles}?userId=${userId}&date=${today}`),
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

  if (isLoading) return <LoadingScreen />;

  const record = records?.[0];
  const practices: Record<string, boolean> = record?.practices ?? {};

  function practiceKey(obstacleId: number, practiceIdx: number): string {
    return `${obstacleId}-${practiceIdx}`;
  }

  function handleToggle(obstacleId: number, practiceIdx: number): void {
    const key = practiceKey(obstacleId, practiceIdx);
    const next = { ...practices, [key]: !practices[key] };
    mutation.mutate({
      userId,
      date: today,
      practices: next,
      ...(record?.id ? { id: record.id } : {}),
    } as ObstacleRecord & { id?: number });
  }

  function checkedCount(obstacleId: number): number {
    return OBSTACLES.find((o) => o.id === obstacleId)?.practices.reduce(
      (count, _, idx) => count + (practices[practiceKey(obstacleId, idx)] ? 1 : 0),
      0,
    ) ?? 0;
  }

  const totalCompleted = OBSTACLES.reduce((sum, o) => sum + checkedCount(o.id), 0);

  const filtered = activeTab === 'All'
    ? OBSTACLES
    : OBSTACLES.filter((o) => o.phase === activeTab);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <View className="w-6" />
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <View className="w-6" />
      </View>

      {/* Title */}
      <View className="px-5 mt-2 mb-4">
        <Text className="text-2xl font-heading text-foreground mb-1">Obstacle Guide</Text>
        <Text className="text-sm font-body text-muted">
          Ryan Holiday's Stoic framework for love's hardships.
        </Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 mb-4 flex-none"
        contentContainerStyle={{ gap: 8 }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-full border"
            style={{
              backgroundColor: activeTab === tab ? '#C0556A' : 'transparent',
              borderColor: activeTab === tab ? '#C0556A' : '#E8E6E0',
            }}
          >
            <Text
              className="text-sm font-body"
              style={{ color: activeTab === tab ? '#FFF' : '#888780' }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {filtered.map((obstacle) => {
          const isExpanded = expandedId === obstacle.id;
          const ps = PHASE_STYLES[obstacle.phase];
          const checked = checkedCount(obstacle.id);
          const total = obstacle.practices.length;

          return (
            <View key={obstacle.id} className="bg-card rounded-2xl mb-3 border border-border overflow-hidden">
              {/* Card header */}
              <TouchableOpacity
                className="p-4"
                onPress={() => setExpandedId(isExpanded ? null : obstacle.id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: ps.bg }}
                  >
                    <Text className="text-xs font-heading" style={{ color: ps.text }}>
                      {obstacle.phase.toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-body text-muted">{checked}/{total}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#888780"
                    />
                  </View>
                </View>
                <Text className="text-base font-heading text-foreground">{obstacle.title}</Text>
              </TouchableOpacity>

              {/* Expanded content */}
              {isExpanded && (
                <View className="px-4 pb-4">
                  <View className="h-px bg-border mb-4" />
                  <Text className="text-sm font-body text-foreground leading-5 mb-4 italic">
                    {obstacle.insight}
                  </Text>
                  <Text className="text-xs font-heading text-foreground mb-3">Today's practices</Text>
                  {obstacle.practices.map((practice, idx) => {
                    const key = practiceKey(obstacle.id, idx);
                    const isChecked = practices[key] ?? false;
                    return (
                      <TouchableOpacity
                        key={idx}
                        className="flex-row items-start mb-3"
                        onPress={() => handleToggle(obstacle.id, idx)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={isChecked ? 'checkbox' : 'square-outline'}
                          size={18}
                          color={isChecked ? '#C0556A' : '#B4B2A9'}
                          style={{ marginRight: 10, marginTop: 1 }}
                        />
                        <Text
                          className={`flex-1 text-sm font-body ${
                            isChecked ? 'line-through text-muted' : 'text-foreground'
                          }`}
                        >
                          {practice.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View className="h-4" />
      </ScrollView>

      {/* Footer CTA */}
      <View className="px-5 pb-6">
        {totalCompleted > 0 && (
          <Text className="text-center text-xs font-body text-muted mb-3">
            {totalCompleted} practice{totalCompleted !== 1 ? 's' : ''} completed today
          </Text>
        )}
        <TouchableOpacity
          className="w-full bg-primary rounded-full py-4 items-center"
          onPress={() => router.push('/practices/today')}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading">
            View today's completed practices
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
