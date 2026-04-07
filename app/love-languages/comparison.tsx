import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { usersService } from '../../src/services/users';
import { quizService } from '../../src/services/quizResults';
import { LANGUAGE_LABELS } from '../../src/types';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import type { LanguageKey, LanguageScores } from '../../src/types';

const LANGUAGE_ORDER: LanguageKey[] = ['WA', 'QT', 'RG', 'AS', 'PT'];

const LANGUAGE_COLORS: Record<LanguageKey, string> = {
  WA: '#C0556A',
  QT: '#7F77DD',
  RG: '#268947',
  AS: '#EF9F27',
  PT: '#E24B4A',
};

function computeMatch(a: LanguageScores, b: LanguageScores, primaryA: LanguageKey, primaryB: LanguageKey): number {
  const diff = Math.abs(a[primaryA] - b[primaryB]);
  return Math.max(0, Math.min(100, 100 - diff * 5));
}

function matchColor(pct: number): string {
  if (pct >= 80) return '#268947';
  if (pct >= 50) return '#EF9F27';
  return '#E24B4A';
}

interface AvatarProps {
  name: string;
  size?: number;
}

function Avatar({ name, size = 48 }: AvatarProps): JSX.Element {
  return (
    <View
      className="rounded-full bg-rose-tint items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Text className="font-heading text-primary" style={{ fontSize: size * 0.4 }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

export default function ComparisonScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getById(userId),
  });

  const quizQuery = useQuery({
    queryKey: ['quizResults', userId],
    queryFn: () => quizService.getByUser(userId),
  });

  const user = userQuery.data;
  const partnerId = user?.partnerId;

  const partnerQuery = useQuery({
    queryKey: ['user', partnerId],
    queryFn: () => usersService.getById(partnerId!),
    enabled: !!partnerId,
  });

  const partnerQuizQuery = useQuery({
    queryKey: ['quizResults', partnerId],
    queryFn: () => quizService.getByUser(partnerId!),
    enabled: !!partnerId,
  });

  if (userQuery.isLoading || quizQuery.isLoading) return <LoadingScreen />;

  const myQuiz = quizQuery.data?.[0];
  const partner = partnerQuery.data;
  const partnerQuiz = partnerQuizQuery.data?.[0];

  // No partner connected
  if (!partnerId) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-5">
        <Ionicons name="people-outline" size={48} color="#B4B2A9" />
        <Text className="text-lg font-heading text-foreground mt-4 mb-2">No partner connected</Text>
        <Text className="text-sm font-body text-muted text-center mb-6">
          Invite your partner to compare your Love Languages.
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-full py-3 px-6"
          onPress={() => router.push('/partner/invite')}
        >
          <Text className="text-white text-sm font-heading">Invite Partner</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Partner hasn't taken quiz
  if (!partnerQuiz) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-5">
        <Ionicons name="time-outline" size={48} color="#B4B2A9" />
        <Text className="text-lg font-heading text-foreground mt-4 mb-2">
          {partner?.name ?? 'Your partner'} hasn't taken the quiz yet
        </Text>
        <TouchableOpacity
          className="mt-4 border border-primary rounded-full py-3 px-6 flex-row items-center"
          onPress={() => router.push('/partner/invite')}
        >
          <Text className="text-primary text-sm font-heading mr-1">Send reminder</Text>
          <Ionicons name="arrow-forward" size={14} color="#C0556A" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const matchPct = myQuiz
    ? computeMatch(myQuiz.scores, partnerQuiz.scores, myQuiz.primary, partnerQuiz.primary)
    : 0;
  const mColor = matchColor(matchPct);
  const maxScore = 12; // max possible score for any language

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="share-outline" size={22} color="#888780" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Avatars */}
        <View className="flex-row items-center justify-center mt-4 mb-6 gap-8">
          <View className="items-center">
            <Avatar name={user?.name ?? 'A'} size={56} />
            <Text className="text-xs font-body text-foreground mt-1">{user?.name ?? 'You'}</Text>
            <Text className="text-[10px] font-body text-muted">
              {myQuiz ? LANGUAGE_LABELS[myQuiz.primary] : '—'}
            </Text>
          </View>
          <View className="items-center">
            <View className="w-14 h-14 rounded-full bg-purple-tint items-center justify-center">
              <Text className="font-heading text-secondary text-2xl">
                {partner?.name?.charAt(0) ?? 'J'}
              </Text>
            </View>
            <Text className="text-xs font-body text-foreground mt-1">{partner?.name ?? 'Partner'}</Text>
            <Text className="text-[10px] font-body text-muted">
              {LANGUAGE_LABELS[partnerQuiz.primary]}
            </Text>
          </View>
        </View>

        {/* Compatibility Score */}
        <View className="items-center mb-8">
          <Text className="text-xs font-body text-muted tracking-widest uppercase mb-1">
            Compatibility Score
          </Text>
          <View className="flex-row items-center">
            <Text className="font-heading text-5xl" style={{ color: mColor }}>
              {matchPct}%
            </Text>
            <Ionicons name="heart" size={24} color={mColor} style={{ marginLeft: 6 }} />
          </View>
          <Text className="text-xs font-body text-muted mt-1">
            {matchPct >= 80
              ? 'Strong alignment'
              : matchPct >= 50
              ? 'Some key differences in expression'
              : 'Significant gap — talk about it'}
          </Text>
        </View>

        {/* Language Breakdown comparison */}
        <Text className="text-base font-heading text-foreground mb-4">Language Breakdown</Text>
        {LANGUAGE_ORDER.map((key) => {
          const myScore = myQuiz?.scores[key] ?? 0;
          const partnerScore = partnerQuiz.scores[key];
          const max = Math.max(myScore, partnerScore, 1);
          return (
            <View key={key} className="mb-4">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-body text-foreground">{LANGUAGE_LABELS[key]}</Text>
                <Text className="text-xs font-body text-muted">
                  {myScore} / {partnerScore}
                </Text>
              </View>
              {/* My bar */}
              <View className="h-1.5 rounded-full bg-border mb-1">
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${(myScore / maxScore) * 100}%`,
                    backgroundColor: LANGUAGE_COLORS[key],
                  }}
                />
              </View>
              {/* Partner bar */}
              <View className="h-1.5 rounded-full bg-border">
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${(partnerScore / maxScore) * 100}%`,
                    backgroundColor: LANGUAGE_COLORS[key],
                    opacity: 0.4,
                  }}
                />
              </View>
            </View>
          );
        })}

        {/* Gap insight */}
        {myQuiz && (
          <View className="bg-amber-tint rounded-2xl p-4 mb-8 border border-amber-tint">
            <Text className="text-xs font-heading text-amber mb-1">The gap that matters</Text>
            <Text className="text-sm font-body text-foreground">
              You value <Text className="font-heading">{LANGUAGE_LABELS[myQuiz.primary]}</Text> most,
              while {partner?.name ?? 'your partner'} values{' '}
              <Text className="font-heading">{LANGUAGE_LABELS[partnerQuiz.primary]}</Text>.
              Speaking each other's language bridges this gap.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
