import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { rebuildService } from '../../src/services/rebuild';
import { usersService } from '../../src/services/users';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import type { RebuildBehavior, RebuildSliders, RebuildRecord } from '../../src/types';

const BEHAVIORS: { key: RebuildBehavior; label: string; description: string }[] = [
  { key: 'knowing',     label: 'Knowing',     description: "Understanding their inner world and goals" },
  { key: 'supporting',  label: 'Supporting',  description: "Showing up when it matters most" },
  { key: 'championing', label: 'Championing', description: "Actively promoting their growth and dreams" },
  { key: 'leading',     label: 'Leading',     description: "Initiating positive change" },
  { key: 'investing',   label: 'Investing',   description: "Putting real time and energy into them" },
];

const DEFAULT_SLIDERS: RebuildSliders = {
  knowing: 0, supporting: 0, championing: 0, leading: 0, investing: 0,
};

const MAX_PER = 10;
const MAX_TOTAL = BEHAVIORS.length * MAX_PER; // 50
const GAP_THRESHOLD = 30;

function scorePct(s: RebuildSliders): number {
  return Math.round((Object.values(s).reduce((a, b) => a + b, 0) / MAX_TOTAL) * 100);
}

interface BarControlProps {
  value: number;
  partnerValue: number;
  onInc: () => void;
  onDec: () => void;
  color: string;
}

function BarControl({ value, partnerValue, onInc, onDec, color }: BarControlProps): JSX.Element {
  return (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        onPress={onDec}
        disabled={value <= 0}
        className="w-7 h-7 rounded-full border border-border items-center justify-center"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="remove" size={14} color={value <= 0 ? '#D4D2CC' : '#1A1A1A'} />
      </TouchableOpacity>
      <View className="flex-1">
        <View className="h-1.5 rounded-full bg-border mb-1">
          <View className="h-1.5 rounded-full" style={{ width: `${(value / MAX_PER) * 100}%`, backgroundColor: color }} />
        </View>
        <View className="h-1.5 rounded-full bg-border opacity-40">
          <View className="h-1.5 rounded-full bg-secondary" style={{ width: `${(partnerValue / MAX_PER) * 100}%` }} />
        </View>
      </View>
      <Text className="text-xs font-heading w-5 text-right" style={{ color }}>{value}</Text>
      <TouchableOpacity
        onPress={onInc}
        disabled={value >= MAX_PER}
        className="w-7 h-7 rounded-full border border-border items-center justify-center"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="add" size={14} color={value >= MAX_PER ? '#D4D2CC' : '#1A1A1A'} />
      </TouchableOpacity>
    </View>
  );
}

export default function RebuildScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'user' | 'partner'>('user');

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getById(userId),
  });

  const rebuildQuery = useQuery({
    queryKey: ['rebuild', userId],
    queryFn: () => rebuildService.getByUser(userId),
  });

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
  const activeColor = activeView === 'user' ? '#C0556A' : '#7F77DD';

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
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <View className="w-6" />
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text className="text-2xl font-heading text-foreground mt-4 mb-1">Rebuild Together</Text>
        <Text className="text-sm font-body text-muted mb-4">
          Beam's Aspiration stage: both people champion each other's individual growth.
        </Text>

        {/* AI Coach card */}
        <View className="rounded-2xl p-4 mb-5" style={{ backgroundColor: '#E1F5EE' }}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="sparkles" size={14} color="#268947" style={{ marginRight: 6 }} />
            <Text className="text-xs font-heading" style={{ color: '#268947' }}>AI Coach</Text>
          </View>
          <Text className="text-sm font-body text-foreground italic">
            "Focus on something bigger than yourself — Holiday reminds us that championing your partner's dreams dissolves ego and deepens love."
          </Text>
        </View>

        {/* Gap warning */}
        {hasGap && (
          <View className="bg-amber-tint rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-1">
              <Ionicons name="warning-outline" size={14} color="#EF9F27" style={{ marginRight: 6 }} />
              <Text className="text-xs font-heading" style={{ color: '#EF9F27' }}>
                {gap}% contribution gap
              </Text>
            </View>
            <Text className="text-sm font-body text-foreground">
              {userPct > partnerPct
                ? 'You are contributing significantly more. Name this before it builds into resentment.'
                : 'Your partner is contributing more. Acknowledge it and redistribute.'}
            </Text>
          </View>
        )}

        {/* You / Partner toggle */}
        <View className="flex-row bg-card rounded-2xl p-1 mb-4 border border-border">
          <TouchableOpacity
            className="flex-1 py-2 rounded-xl items-center"
            style={{ backgroundColor: activeView === 'user' ? '#C0556A' : 'transparent' }}
            onPress={() => setActiveView('user')}
          >
            <Text className="text-sm font-heading" style={{ color: activeView === 'user' ? '#FFF' : '#888780' }}>
              {user?.name ?? 'You'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 rounded-xl items-center"
            style={{ backgroundColor: activeView === 'partner' ? '#7F77DD' : 'transparent' }}
            onPress={() => setActiveView('partner')}
          >
            <Text className="text-sm font-heading" style={{ color: activeView === 'partner' ? '#FFF' : '#888780' }}>
              Partner
            </Text>
          </TouchableOpacity>
        </View>

        {/* Behavioral Alignment */}
        <Text className="text-base font-heading text-foreground mb-3">Behavioral Alignment</Text>
        <View className="flex-row mb-1">
          <View className="w-3 h-1.5 rounded-full bg-primary mr-1.5 mt-0.5" />
          <Text className="text-xs font-body text-muted mr-4">{user?.name ?? 'You'}</Text>
          <View className="w-3 h-1.5 rounded-full bg-secondary mr-1.5 mt-0.5 opacity-40" />
          <Text className="text-xs font-body text-muted">Partner</Text>
        </View>

        <View className="mb-5">
          {BEHAVIORS.map((b) => (
            <View key={b.key} className="mb-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-sm font-body text-foreground">{b.label}</Text>
                <Text className="text-xs font-body text-muted">{b.description}</Text>
              </View>
              <BarControl
                value={currentS[b.key]}
                partnerValue={otherS[b.key]}
                onInc={() => adjust(b.key, 1)}
                onDec={() => adjust(b.key, -1)}
                color={activeColor}
              />
            </View>
          ))}
        </View>

        {/* Rebuild Score Board */}
        <Text className="text-base font-heading text-foreground mb-3">Rebuild Score Board</Text>
        <View className="bg-card rounded-2xl p-4 mb-8 border border-border">
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-xs font-body text-muted mb-1">{user?.name ?? 'You'}</Text>
              <Text className="text-4xl font-heading text-primary">{userPct}%</Text>
            </View>
            <View className="w-px bg-border" />
            <View className="flex-1 items-center">
              <Text className="text-xs font-body text-muted mb-1">Partner</Text>
              <Text className="text-4xl font-heading text-secondary">{partnerPct}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTAs */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          className="w-full border border-primary rounded-full py-4 items-center"
          onPress={() => router.push('/rebuild/ego-check')}
          activeOpacity={0.85}
        >
          <Text className="text-primary text-base font-heading">Check ego patterns</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
