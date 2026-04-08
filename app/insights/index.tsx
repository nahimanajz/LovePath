import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { INSIGHT_POOL, type InsightItem } from '../../src/constants/insightPool';
import { apiFetch, API } from '../../src/config/api';
import type { InsightCategory } from '../../src/types';

type FilterPill = 'All' | InsightCategory;

const PILLS: FilterPill[] = [
  'All', 'Love Languages', 'LovePath', 'Stoic', 'Betrayal', 'Rebuild', 'Ego',
];

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  Beam:    { bg: '#FDE8EC', text: '#C0556A' },
  Holiday: { bg: '#EEEDFE', text: '#7F77DD' },
  Chapman: { bg: '#E1F5EE', text: '#268947' },
};

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

/** Deterministic daily featured insight — rotates without repeating within 30 days */
function getFeaturedInsight(): InsightItem {
  const epoch = new Date('2026-01-01').getTime();
  const dayIndex = Math.floor((Date.now() - epoch) / 86_400_000);
  const idx = dayIndex % INSIGHT_POOL.length;
  return INSIGHT_POOL[idx];
}

export default function InsightFeedScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const [activeFilter, setActiveFilter] = useState<FilterPill>('All');
  const [reflectingOn, setReflectingOn] = useState<InsightItem | null>(null);
  const [journalText, setJournalText] = useState('');

  const journalMutation = useMutation({
    mutationFn: (body: { userId: number; date: string; text: string; insightId: number }) =>
      apiFetch(API.reflections, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      setReflectingOn(null);
      setJournalText('');
    },
    onError: () => Alert.alert('Save failed', 'Could not save your reflection. Please try again.'),
  });

  const featured = getFeaturedInsight();

  const filtered = activeFilter === 'All'
    ? INSIGHT_POOL
    : INSIGHT_POOL.filter((i) => i.category === activeFilter);

  // Show all except the featured one in the browse section
  const browse = filtered.filter((i) => i.id !== featured.id);

  function handleReflect(insight: InsightItem): void {
    setReflectingOn(insight);
    setJournalText('');
  }

  function handleSaveReflection(): void {
    if (!reflectingOn || !journalText.trim()) return;
    journalMutation.mutate({
      userId,
      date: todayKey(),
      text: journalText.trim(),
      insightId: reflectingOn.id,
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="px-5 mt-2 mb-4">
          <Text className="text-2xl font-heading text-foreground mb-1">Insights</Text>
          <Text className="text-sm font-body text-muted">Daily wisdom from Beam, Chapman, and Holiday.</Text>
        </View>

        {/* Featured insight card */}
        <View className="mx-5 mb-6 rounded-2xl p-5 bg-primary">
          <View className="flex-row items-center mb-3">
            <View className="px-2 py-0.5 rounded-full bg-white/20 mr-2">
              <Text className="text-xs font-heading text-white">Daily Wisdom</Text>
            </View>
            <Text className="text-xs font-body text-white opacity-70">{featured.source}</Text>
          </View>
          <Text className="text-xl font-heading text-white leading-7 mb-4">
            "{featured.text.length > 120 ? featured.text.slice(0, 120) + '…' : featured.text}"
          </Text>
          <TouchableOpacity
            className="flex-row items-center self-start bg-white/20 rounded-full px-4 py-2"
            onPress={() => handleReflect(featured)}
          >
            <Text className="text-sm font-heading text-white mr-1">Reflect</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Browse insights */}
        <Text className="text-base font-heading text-foreground px-5 mb-3">Browse Insights</Text>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 mb-4 flex-none"
          contentContainerStyle={{ gap: 8 }}
        >
          {PILLS.map((pill) => (
            <TouchableOpacity
              key={pill}
              onPress={() => setActiveFilter(pill)}
              className="px-4 py-1.5 rounded-full border"
              style={{
                backgroundColor: activeFilter === pill ? '#C0556A' : 'transparent',
                borderColor: activeFilter === pill ? '#C0556A' : '#E8E6E0',
              }}
            >
              <Text
                className="text-sm font-body"
                style={{ color: activeFilter === pill ? '#FFF' : '#888780' }}
              >
                {pill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Insight cards */}
        <View className="px-5 pb-8">
          {browse.map((insight) => {
            const sc = SOURCE_COLORS[insight.source] ?? SOURCE_COLORS.Beam;
            return (
              <View key={insight.id} className="bg-card rounded-2xl p-4 mb-3 border border-border">
                <View className="flex-row items-center mb-2 gap-2">
                  <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg }}>
                    <Text className="text-xs font-heading" style={{ color: sc.text }}>{insight.source}</Text>
                  </View>
                  <Text className="text-xs font-body text-muted">{insight.category}</Text>
                </View>
                <Text className="text-sm font-body text-foreground leading-5 mb-3">{insight.text}</Text>
                <TouchableOpacity
                  className="flex-row items-center self-start"
                  onPress={() => handleReflect(insight)}
                >
                  <Text className="text-sm font-heading text-primary mr-1">Reflect</Text>
                  <Ionicons name="arrow-forward" size={14} color="#C0556A" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Reflect journal modal */}
      <Modal
        visible={reflectingOn !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReflectingOn(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setReflectingOn(null)}
        />
        <View className="bg-background rounded-t-3xl px-5 pt-6 pb-10">
          {reflectingOn && (
            <>
              <Text className="text-lg font-heading text-foreground mb-2">Your reflection</Text>
              <View className="bg-card rounded-xl p-3 mb-4">
                <Text className="text-xs font-body text-muted italic">
                  "{reflectingOn.text.length > 100 ? reflectingOn.text.slice(0, 100) + '…' : reflectingOn.text}"
                </Text>
              </View>
              <TextInput
                className="bg-card border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground mb-5"
                placeholder="What does this mean for your relationship today?"
                placeholderTextColor="#B4B2A9"
                value={journalText}
                onChangeText={setJournalText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
              />
              <TouchableOpacity
                className="w-full bg-primary rounded-full py-4 items-center"
                onPress={handleSaveReflection}
                disabled={journalMutation.isPending || !journalText.trim()}
                activeOpacity={0.85}
              >
                <Text className="text-white text-base font-heading">Save reflection</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
