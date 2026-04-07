import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { effortService } from '../../src/services/effortBalance';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import type { EffortBehavior, EffortSliders, EffortBalanceRecord } from '../../src/types';

const BEHAVIORS: { key: EffortBehavior; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'initiating', label: 'Initiating connection',  icon: 'flash-outline' },
  { key: 'listening',  label: 'Active listening',       icon: 'ear-outline' },
  { key: 'planning',   label: 'Planning dates',         icon: 'calendar-outline' },
  { key: 'support',    label: 'Emotional support',      icon: 'heart-outline' },
  { key: 'honesty',    label: 'Honest communication',   icon: 'chatbubble-ellipses-outline' },
];

const DEFAULT_SLIDERS: EffortSliders = {
  initiating: 0, listening: 0, planning: 0, support: 0, honesty: 0,
};
const MAX_PER = 10;
const MAX_TOTAL = BEHAVIORS.length * MAX_PER;

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

function total(s: EffortSliders): number {
  return Object.values(s).reduce((a, b) => a + b, 0);
}

function balancePct(u: number, p: number): number {
  const sum = u + p;
  return sum === 0 ? 50 : Math.round((u / sum) * 100);
}

function status(pct: number): { label: string; color: string } {
  const diff = Math.abs(pct - 50);
  if (diff < 10) return { label: 'Balanced', color: '#268947' };
  if (diff < 20) return { label: 'Slight imbalance', color: '#EF9F27' };
  return { label: 'Significant imbalance', color: '#E24B4A' };
}

interface BarSliderProps {
  value: number;
  onInc: () => void;
  onDec: () => void;
  color: string;
}

function BarSlider({ value, onInc, onDec, color }: BarSliderProps): JSX.Element {
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

      <View className="flex-1 h-2 rounded-full bg-border">
        <View
          className="h-2 rounded-full"
          style={{ width: `${(value / MAX_PER) * 100}%`, backgroundColor: color }}
        />
      </View>

      <Text className="text-xs font-heading w-6 text-center" style={{ color }}>{value}</Text>

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

export default function EffortBalanceScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const weekOf = getMonday();

  const { data, isLoading } = useQuery({
    queryKey: ['effortBalance', userId],
    queryFn: () => effortService.getByUser(userId),
  });

  const mutation = useMutation({
    mutationFn: (r: Omit<EffortBalanceRecord, 'id'> & { id?: number }) => effortService.upsert(r),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['effortBalance', userId] }),
  });

  if (isLoading) return <LoadingScreen />;

  const existing = data?.find((r) => r.weekOf === weekOf) ?? data?.[0];
  const userS: EffortSliders = existing?.user ?? { ...DEFAULT_SLIDERS };
  const partnerS: EffortSliders = existing?.partner ?? { ...DEFAULT_SLIDERS };

  const uTotal = total(userS);
  const pTotal = total(partnerS);
  const pct = balancePct(uTotal, pTotal);
  const st = status(pct);
  const isEmpty = uTotal === 0 && pTotal === 0;

  function adjust(who: 'user' | 'partner', key: EffortBehavior, delta: number): void {
    const src = who === 'user' ? userS : partnerS;
    const next = Math.max(0, Math.min(MAX_PER, src[key] + delta));
    mutation.mutate({
      userId,
      weekOf,
      user:    who === 'user'    ? { ...userS,    [key]: next } : userS,
      partner: who === 'partner' ? { ...partnerS, [key]: next } : partnerS,
      ...(existing?.id ? { id: existing.id } : {}),
    } as EffortBalanceRecord & { id?: number });
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
        <Text className="text-2xl font-heading text-foreground mt-4 mb-1">Effort Balance</Text>
        <Text className="text-sm font-body text-muted mb-1">
          Track who is carrying the relationship this week.
        </Text>
        <Text className="text-xs font-body text-hint mb-5">
          Last updated: {weekOf}
        </Text>

        {isEmpty ? (
          <View className="items-center py-10 mb-6">
            <Ionicons name="scale-outline" size={48} color="#B4B2A9" />
            <Text className="text-base font-heading text-foreground mt-4 mb-2">No ratings yet</Text>
            <Text className="text-sm font-body text-muted text-center px-6">
              Use the controls below to rate how much each of you is contributing this week.
            </Text>
          </View>
        ) : (
          <View className="bg-card rounded-2xl p-4 mb-5 border border-border">
            <Text className="text-xs font-body text-muted mb-2 text-center tracking-widest uppercase">
              Balance this week
            </Text>
            <View className="h-3 rounded-full bg-border overflow-hidden mb-2">
              <View className="h-3 rounded-full bg-primary absolute left-0 top-0" style={{ width: `${pct}%` }} />
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs font-body text-primary">You {pct}%</Text>
              <Text className="text-xs font-body text-secondary">Partner {100 - pct}%</Text>
            </View>
            <Text className="text-sm font-heading text-center" style={{ color: st.color }}>{st.label}</Text>
          </View>
        )}

        {/* Imbalance insight */}
        {!isEmpty && Math.abs(pct - 50) >= 20 && (
          <View className="bg-amber-tint rounded-2xl p-4 mb-5 border border-amber-tint">
            <View className="flex-row items-center mb-1">
              <Ionicons name="warning-outline" size={14} color="#EF9F27" style={{ marginRight: 6 }} />
              <Text className="text-xs font-heading" style={{ color: '#EF9F27' }}>Imbalance alert</Text>
            </View>
            <Text className="text-sm font-body text-foreground">
              {pct >= 70
                ? 'You are carrying significantly more this week. Acknowledge it before it builds into resentment.'
                : 'Your partner is carrying more this week. Recognizing this openly prevents build-up.'}
            </Text>
          </View>
        )}

        {/* Your investment */}
        <View className="mb-2">
          <View className="flex-row items-center mb-3">
            <View className="w-2 h-2 rounded-full bg-primary mr-2" />
            <Text className="text-base font-heading text-foreground">Your investment</Text>
            <Text className="ml-auto text-xs font-heading text-primary">{uTotal}/{MAX_TOTAL}</Text>
          </View>
          {BEHAVIORS.map((b) => (
            <View key={`u-${b.key}`} className="mb-3">
              <View className="flex-row items-center mb-1">
                <Ionicons name={b.icon} size={14} color="#C0556A" style={{ marginRight: 6 }} />
                <Text className="text-sm font-body text-foreground">{b.label}</Text>
              </View>
              <BarSlider
                value={userS[b.key]}
                onInc={() => adjust('user', b.key, 1)}
                onDec={() => adjust('user', b.key, -1)}
                color="#C0556A"
              />
            </View>
          ))}
        </View>

        {/* Partner investment */}
        <View className="mt-4 mb-8">
          <View className="flex-row items-center mb-3">
            <View className="w-2 h-2 rounded-full bg-secondary mr-2" />
            <Text className="text-base font-heading text-foreground">Partner's investment</Text>
            <Text className="ml-auto text-xs font-heading text-secondary">{pTotal}/{MAX_TOTAL}</Text>
          </View>
          {BEHAVIORS.map((b) => (
            <View key={`p-${b.key}`} className="mb-3">
              <View className="flex-row items-center mb-1">
                <Ionicons name={b.icon} size={14} color="#7F77DD" style={{ marginRight: 6 }} />
                <Text className="text-sm font-body text-foreground">{b.label}</Text>
              </View>
              <BarSlider
                value={partnerS[b.key]}
                onInc={() => adjust('partner', b.key, 1)}
                onDec={() => adjust('partner', b.key, -1)}
                color="#7F77DD"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
