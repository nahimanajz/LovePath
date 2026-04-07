import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { compatibilityService } from '../../src/services/compatibility';
import { usersService } from '../../src/services/users';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import type { DimensionKey, DimensionRatings, CompatibilityRecord } from '../../src/types';

const DIMENSIONS: { key: DimensionKey; label: string; description: string }[] = [
  { key: 'physical',     label: 'Physical',    description: 'Attraction and physical affection' },
  { key: 'intellectual', label: 'Intellectual', description: 'Shared curiosity and depth of conversation' },
  { key: 'emotional',    label: 'Emotional',   description: 'Safety, empathy, and emotional presence' },
  { key: 'values',       label: 'Values',      description: 'Core beliefs and life principles' },
  { key: 'lifeGoals',    label: 'Life Goals',  description: 'Where you both want to go in life' },
  { key: 'humor',        label: 'Humor',       description: 'Playfulness and levity together' },
];

const DEFAULT_RATINGS: DimensionRatings = {
  physical: 0, intellectual: 0, emotional: 0,
  values: 0, lifeGoals: 0, humor: 0,
};

const MAX_STARS = 5;
const GAP_THRESHOLD = 2;

function computeScore(user: DimensionRatings, partner: DimensionRatings): number {
  const total = Object.values(user).reduce((s, v) => s + v, 0)
    + Object.values(partner).reduce((s, v) => s + v, 0);
  const max = DIMENSIONS.length * MAX_STARS * 2;
  return max > 0 ? Math.round((total / max) * 100) : 0;
}

function scoreColor(pct: number): string {
  if (pct >= 70) return '#268947';
  if (pct >= 45) return '#EF9F27';
  return '#E24B4A';
}

interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
  color?: string;
}

function StarRating({ value, onChange, color = '#C0556A' }: StarRatingProps): JSX.Element {
  return (
    <View className="flex-row gap-1">
      {Array.from({ length: MAX_STARS }).map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i + 1)} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
          <Ionicons
            name={i < value ? 'star' : 'star-outline'}
            size={20}
            color={i < value ? color : '#D4D2CC'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function CompatibilityScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'user' | 'partner'>('user');

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getById(userId),
  });

  const compatQuery = useQuery({
    queryKey: ['compatibility', userId],
    queryFn: () => compatibilityService.getByUser(userId),
  });

  const mutation = useMutation({
    mutationFn: (record: Omit<CompatibilityRecord, 'id'> & { id?: number }) =>
      compatibilityService.upsert(record),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compatibility', userId] }),
  });

  if (userQuery.isLoading || compatQuery.isLoading) return <LoadingScreen />;

  const user = userQuery.data;
  const existing = compatQuery.data?.[0];

  const userRatings: DimensionRatings = existing?.ratings?.user ?? { ...DEFAULT_RATINGS };
  const partnerRatings: DimensionRatings = existing?.ratings?.partner ?? { ...DEFAULT_RATINGS };

  const overallPct = computeScore(userRatings, partnerRatings);
  const oColor = scoreColor(overallPct);

  function handleRate(dim: DimensionKey, value: number): void {
    const next = {
      userId,
      ratings: {
        user: activeView === 'user' ? { ...userRatings, [dim]: value } : userRatings,
        partner: activeView === 'partner' ? { ...partnerRatings, [dim]: value } : partnerRatings,
      },
      ...(existing?.id ? { id: existing.id } : {}),
    };
    mutation.mutate(next);
  }

  function handleBridge(): void {
    const gaps = DIMENSIONS.filter(
      (d) => Math.abs(userRatings[d.key] - partnerRatings[d.key]) > GAP_THRESHOLD,
    );
    if (gaps.length === 0) {
      Alert.alert('Great alignment!', 'No significant gaps found. Keep nurturing each dimension.');
    } else {
      const names = gaps.map((d) => d.label).join(', ');
      Alert.alert(
        'Gaps to address',
        `${names} ${gaps.length === 1 ? 'shows' : 'show'} a significant gap. Consider opening a conversation about ${gaps.length === 1 ? 'this dimension' : 'these dimensions'}.`,
      );
    }
  }

  const currentRatings = activeView === 'user' ? userRatings : partnerRatings;
  const otherRatings   = activeView === 'user' ? partnerRatings : userRatings;
  const hasGaps = DIMENSIONS.some(
    (d) => Math.abs(userRatings[d.key] - partnerRatings[d.key]) > GAP_THRESHOLD
      && userRatings[d.key] > 0 && partnerRatings[d.key] > 0,
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <View className="w-6" />
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <View
          className="px-2 py-0.5 rounded-full"
          style={{ backgroundColor: oColor + '22' }}
        >
          <Text className="text-xs font-heading" style={{ color: oColor }}>{overallPct}%</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text className="text-2xl font-heading text-foreground mt-4 mb-1">Compatibility Deep Dive</Text>
        <Text className="text-sm font-body text-muted mb-5">
          Explore your relationship through its fundamental dimensions of intimacy and growth.
        </Text>

        {/* You / Partner toggle */}
        <View className="flex-row bg-card rounded-2xl p-1 mb-6 border border-border">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2 rounded-xl"
            style={{ backgroundColor: activeView === 'user' ? '#C0556A' : 'transparent' }}
            onPress={() => setActiveView('user')}
          >
            <Ionicons name="person" size={14} color={activeView === 'user' ? '#FFF' : '#888780'} style={{ marginRight: 4 }} />
            <Text className="text-sm font-heading" style={{ color: activeView === 'user' ? '#FFF' : '#888780' }}>
              {user?.name ?? 'You'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2 rounded-xl"
            style={{ backgroundColor: activeView === 'partner' ? '#7F77DD' : 'transparent' }}
            onPress={() => setActiveView('partner')}
          >
            <Ionicons name="people" size={14} color={activeView === 'partner' ? '#FFF' : '#888780'} style={{ marginRight: 4 }} />
            <Text className="text-sm font-heading" style={{ color: activeView === 'partner' ? '#FFF' : '#888780' }}>
              Partner
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dimensions */}
        {DIMENSIONS.map((dim) => {
          const myVal = currentRatings[dim.key];
          const theirVal = otherRatings[dim.key];
          const gap = Math.abs(myVal - theirVal);
          const hasGap = gap > GAP_THRESHOLD && theirVal > 0 && myVal > 0;
          const dotColor = hasGap ? '#E24B4A' : activeView === 'user' ? '#C0556A' : '#7F77DD';

          return (
            <View key={dim.key} className="mb-5">
              <View className="flex-row items-start mb-2">
                <View
                  className="w-2.5 h-2.5 rounded-full mt-1.5 mr-3"
                  style={{ backgroundColor: dotColor }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-heading text-foreground">{dim.label}</Text>
                  <Text className="text-xs font-body text-muted">{dim.description}</Text>
                </View>
              </View>
              <View className="ml-5 flex-row items-center justify-between">
                <StarRating
                  value={myVal}
                  onChange={(v) => handleRate(dim.key, v)}
                  color={activeView === 'user' ? '#C0556A' : '#7F77DD'}
                />
                {hasGap && (
                  <View className="flex-row items-center">
                    <Ionicons name="warning" size={12} color="#EF9F27" style={{ marginRight: 2 }} />
                    <Text className="text-xs font-body" style={{ color: '#EF9F27' }}>Gap</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Overview */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-heading text-foreground">Overview</Text>
            <Text className="text-sm font-heading" style={{ color: oColor }}>{overallPct}%</Text>
          </View>
          {DIMENSIONS.map((dim) => {
            const uVal = userRatings[dim.key];
            const pVal = partnerRatings[dim.key];
            return (
              <View key={dim.key} className="mb-2">
                <Text className="text-xs font-body text-muted mb-0.5">{dim.label}</Text>
                <View className="h-1.5 rounded-full bg-border mb-0.5">
                  <View className="h-1.5 rounded-full bg-primary" style={{ width: `${(uVal / MAX_STARS) * 100}%` }} />
                </View>
                <View className="h-1.5 rounded-full bg-border">
                  <View
                    className="h-1.5 rounded-full bg-secondary"
                    style={{ width: `${(pVal / MAX_STARS) * 100}%`, opacity: 0.6 }}
                  />
                </View>
              </View>
            );
          })}
          <View className="flex-row mt-3 gap-4">
            <View className="flex-row items-center">
              <View className="w-3 h-1.5 rounded-full bg-primary mr-1.5" />
              <Text className="text-xs font-body text-muted">{user?.name ?? 'You'}</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-1.5 rounded-full bg-secondary mr-1.5" style={{ opacity: 0.6 }} />
              <Text className="text-xs font-body text-muted">Partner</Text>
            </View>
          </View>
        </View>

        {/* Gap warning */}
        {hasGaps && (
          <View className="bg-amber-tint rounded-2xl p-4 mb-6 border border-amber-tint">
            <View className="flex-row items-center mb-1">
              <Ionicons name="warning-outline" size={14} color="#EF9F27" style={{ marginRight: 6 }} />
              <Text className="text-xs font-heading" style={{ color: '#EF9F27' }}>Significant gaps detected</Text>
            </View>
            <Text className="text-sm font-body text-foreground">
              A gap of more than {GAP_THRESHOLD} stars in any dimension signals that a conversation — not just effort — is needed.
            </Text>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* CTA */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          className="w-full bg-primary rounded-full py-4 flex-row items-center justify-center"
          onPress={handleBridge}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading mr-2">How to bridge</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
