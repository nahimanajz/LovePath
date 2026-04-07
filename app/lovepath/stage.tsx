import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { lovepathService } from '../../src/services/lovepath';
import { LOVEPATH_STAGES } from '../../src/constants/lovepathStages';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { ErrorScreen } from '../../src/components/ui/ErrorScreen';
import type { LovepathStage, LovepathStageRecord } from '../../src/types';

const STAGE_COLORS: Record<LovepathStage, { bg: string; text: string; border: string }> = {
  Attraction:  { bg: '#FDE8EC', text: '#C0556A', border: '#C0556A' },
  Acceptance:  { bg: '#EEEDFE', text: '#7F77DD', border: '#7F77DD' },
  Attachment:  { bg: '#E1F5EE', text: '#268947', border: '#268947' },
  Aspiration:  { bg: '#FAEEDA', text: '#EF9F27', border: '#EF9F27' },
};

const STAGE_ORDER: LovepathStage[] = ['Attraction', 'Acceptance', 'Attachment', 'Aspiration'];

export default function StageTrackerScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lovepath', userId],
    queryFn: () => lovepathService.getByUser(userId),
  });

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<LovepathStageRecord> }) =>
      lovepathService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lovepath', userId] }),
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const record = data?.[0];
  if (!record) return <ErrorScreen message="No stage data found." onRetry={refetch} />;

  const { currentStage, checklist } = record;
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);
  const currentChecklist: boolean[] = checklist[currentStage] ?? [false, false, false, false, false];
  const checkedCount = currentChecklist.filter(Boolean).length;
  const stageDef = LOVEPATH_STAGES.find((s) => s.stage === currentStage);
  const colors = STAGE_COLORS[currentStage];

  function handleToggle(idx: number): void {
    const next = [...currentChecklist];
    next[idx] = !next[idx];
    mutation.mutate({
      id: record.id,
      payload: { checklist: { ...checklist, [currentStage]: next } },
    });
  }

  function handleStageChange(stage: LovepathStage): void {
    mutation.mutate({ id: record.id, payload: { currentStage: stage } });
  }

  function handleCTA(): void {
    if (checkedCount < 3) {
      router.push('/obstacles');
    } else {
      const nextIdx = currentStageIndex + 1;
      if (nextIdx < STAGE_ORDER.length) {
        Alert.alert(
          'Advance Stage?',
          `Move to ${STAGE_ORDER[nextIdx]}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Advance',
              onPress: () => handleStageChange(STAGE_ORDER[nextIdx]),
            },
          ],
        );
      }
    }
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

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-heading text-foreground mt-4 mb-1">Milestone Tracker</Text>
        <Text className="text-sm font-body text-muted mb-6">
          Track your journey through Beam's four LovePath stages.
        </Text>

        {/* Timeline */}
        <View className="mb-6">
          {STAGE_ORDER.map((stage, idx) => {
            const isActive = stage === currentStage;
            const isPast = idx < currentStageIndex;
            const c = STAGE_COLORS[stage];
            return (
              <TouchableOpacity
                key={stage}
                className="flex-row items-center mb-3"
                onPress={() => handleStageChange(stage)}
                activeOpacity={0.7}
              >
                {/* Timeline node */}
                <View className="items-center mr-3">
                  <View
                    className="w-8 h-8 rounded-full border-2 items-center justify-center"
                    style={{
                      backgroundColor: isActive || isPast ? c.bg : '#F1F1EE',
                      borderColor: isActive ? c.border : isPast ? c.border : '#E8E6E0',
                    }}
                  >
                    {isPast ? (
                      <Ionicons name="checkmark" size={14} color={c.text} />
                    ) : isActive ? (
                      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: c.text }} />
                    ) : (
                      <View className="w-2 h-2 rounded-full bg-hint" />
                    )}
                  </View>
                  {idx < STAGE_ORDER.length - 1 && (
                    <View className="w-0.5 h-4 bg-border mt-1" />
                  )}
                </View>
                {/* Stage label */}
                <Text
                  className={`text-sm ${isActive ? 'font-heading' : 'font-body'}`}
                  style={{ color: isActive ? c.text : '#888780' }}
                >
                  {stage}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active stage card */}
        {stageDef && (
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: colors.bg }}
          >
            <View className="flex-row items-center mb-2">
              <View
                className="px-3 py-1 rounded-full mr-2"
                style={{ backgroundColor: colors.text }}
              >
                <Text className="text-xs font-heading text-white">{currentStage}</Text>
              </View>
            </View>
            <Text className="text-sm font-body text-foreground mb-3">{stageDef.description}</Text>

            {/* Warning sign */}
            {checkedCount < 2 && (
              <View className="flex-row items-start mb-3 bg-white/50 rounded-xl p-3">
                <Ionicons name="warning-outline" size={14} color="#EF9F27" style={{ marginRight: 6, marginTop: 1 }} />
                <Text className="flex-1 text-xs font-body text-foreground">{stageDef.warningSign}</Text>
              </View>
            )}

            {/* Checklist */}
            <Text className="text-sm font-heading text-foreground mb-3">
              Check off what's true right now
            </Text>
            {stageDef.checklist.map((item, idx) => {
              const checked = currentChecklist[idx] ?? false;
              return (
                <TouchableOpacity
                  key={idx}
                  className="flex-row items-start mb-2"
                  onPress={() => handleToggle(idx)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={18}
                    color={checked ? colors.text : '#B4B2A9'}
                    style={{ marginRight: 8, marginTop: 1 }}
                  />
                  <Text
                    className={`flex-1 text-sm font-body ${checked ? 'line-through text-muted' : 'text-foreground'}`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Progress */}
            <View className="mt-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs font-body text-muted">{checkedCount}/5 completed</Text>
              </View>
              <View className="h-1.5 rounded-full bg-white/60">
                <View
                  className="h-1.5 rounded-full"
                  style={{ width: `${(checkedCount / 5) * 100}%`, backgroundColor: colors.text }}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          className="w-full bg-primary rounded-full py-4 items-center"
          onPress={handleCTA}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading">
            {checkedCount < 3 ? "What's blocking this stage?" : 'View next stage'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
