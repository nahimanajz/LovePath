import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { egoService } from '../../src/services/egoChecks';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';

const EGO_PATTERNS = [
  'I need to feel loved before I give love',
  'I feel diminished by my partner\'s success or praise from others',
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
      bg: '#E1F5EE',
    };
  }
  if (count <= 2) {
    return {
      label: 'Ego pattern detected',
      body: `${count} pattern${count > 1 ? 's' : ''} checked. Notice these without judgement — awareness is the first step.`,
      color: '#EF9F27',
      bg: '#FAEEDA',
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
    color: '#E24B4A',
    bg: '#FDEAE8',
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
        {/* Title */}
        <Text className="text-2xl font-heading text-foreground mt-4 mb-1">Ego Check</Text>
        <Text className="text-sm font-body text-muted mb-5">
          Holiday and Beam both identify ego — not incompatibility — as the primary destroyer of deep love.
        </Text>

        {/* Dynamic alert */}
        <View
          className="rounded-2xl p-4 mb-5"
          style={{ backgroundColor: alert.bg }}
        >
          <View className="flex-row items-center mb-1">
            <Ionicons
              name={checkedCount === 0 ? 'checkmark-circle-outline' : 'warning-outline'}
              size={14}
              color={alert.color}
              style={{ marginRight: 6 }}
            />
            <Text className="text-xs font-heading" style={{ color: alert.color }}>{alert.label}</Text>
          </View>
          <Text className="text-sm font-body text-foreground">{alert.body}</Text>
        </View>

        {/* Patterns list */}
        <Text className="text-base font-heading text-foreground mb-3">
          Check what applies to you right now
        </Text>
        <Text className="text-xs font-body text-muted mb-4">
          Today only. Results are not shared with your partner.
        </Text>

        {EGO_PATTERNS.map((pattern, idx) => {
          const checked = patterns[idx] ?? false;
          return (
            <TouchableOpacity
              key={idx}
              className="flex-row items-start mb-4 bg-card rounded-xl p-4 border border-border"
              onPress={() => handleToggle(idx)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={checked ? 'checkbox' : 'square-outline'}
                size={20}
                color={checked ? '#C0556A' : '#B4B2A9'}
                style={{ marginRight: 12, marginTop: 1 }}
              />
              <Text
                className={`flex-1 text-sm font-body ${checked ? 'text-muted line-through' : 'text-foreground'}`}
              >
                {pattern}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Affirmation card */}
        {checkedCount > 0 && (
          <View className="bg-rose-tint rounded-2xl p-4 mb-6 mt-2">
            <Text className="text-xs font-heading text-primary mb-2">Reflect on this</Text>
            <Text className="text-sm font-body text-foreground leading-5 italic">{AFFIRMATION}</Text>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* CTAs */}
      <View className="px-5 pb-6 gap-3">
        <TouchableOpacity
          className="w-full bg-primary rounded-full py-4 items-center"
          onPress={() => router.push('/(tabs)/obstacles')}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading">How to work through ego →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
