import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuizStore } from '../../src/store/quizStore';
import { LANGUAGE_LABELS } from '../../src/types';
import type { LanguageKey } from '../../src/types';

const LANGUAGE_ICONS: Record<LanguageKey, keyof typeof Ionicons.glyphMap> = {
  WA: 'chatbubble-outline',
  QT: 'time-outline',
  RG: 'gift-outline',
  AS: 'hand-left-outline',
  PT: 'heart-outline',
};

const LANGUAGE_DESCRIPTIONS: Record<LanguageKey, string> = {
  WA: 'You feel most loved through verbal expressions of love, praise, and encouragement.',
  QT: 'You feel most loved when someone gives you their full, undivided attention.',
  RG: 'You feel most loved through thoughtful gifts and meaningful symbols of love.',
  AS: 'You feel most loved when others go out of their way to help and serve you.',
  PT: 'You feel most loved through physical closeness, touch, and affection.',
};

interface LanguageBarProps {
  languageKey: LanguageKey;
  score: number;
  maxScore: number;
  isPrimary: boolean;
}

function LanguageBar({ languageKey, score, maxScore, isPrimary }: LanguageBarProps): JSX.Element {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center">
          <Ionicons
            name={LANGUAGE_ICONS[languageKey]}
            size={14}
            color={isPrimary ? '#C0556A' : '#888780'}
            style={{ marginRight: 6 }}
          />
          <Text
            className={`text-sm font-body ${
              isPrimary ? 'text-primary font-heading' : 'text-foreground'
            }`}
          >
            {LANGUAGE_LABELS[languageKey]}
          </Text>
        </View>
        <Text className="text-xs font-body text-muted">{score}</Text>
      </View>
      <View className="h-2 rounded-full bg-border">
        <View
          className={`h-2 rounded-full ${isPrimary ? 'bg-primary' : 'bg-hint'}`}
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}

export default function QuizResultsScreen(): JSX.Element {
  const result = useQuizStore((s) => s.result);

  if (!result) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-5">
        <Text className="text-base font-body text-muted text-center">
          No quiz results found. Take the quiz first.
        </Text>
        <TouchableOpacity
          className="mt-4 bg-primary rounded-full py-3 px-6"
          onPress={() => router.replace('/love-languages/intro')}
        >
          <Text className="text-white text-sm font-heading">Take Quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { primary, secondary, scores } = result;
  const maxScore = Math.max(...Object.values(scores));

  // Sort languages by score descending
  const sorted = (Object.entries(scores) as [LanguageKey, number][])
    .sort(([, a], [, b]) => b - a);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-center px-5 pt-4 pb-2">
          <Text className="text-sm font-heading text-primary">LovePath</Text>
        </View>

        {/* Avatar + name */}
        <View className="items-center mt-4 mb-6">
          <View className="w-16 h-16 rounded-full bg-rose-tint items-center justify-center mb-2">
            <Ionicons name="person" size={28} color="#C0556A" />
          </View>
          <Text className="text-lg font-heading text-foreground">Alex</Text>
          <Text className="text-xs font-body text-muted">
            {LANGUAGE_LABELS[primary]}
          </Text>
        </View>

        {/* Primary language hero card */}
        <View className="mx-5 bg-rose-tint rounded-2xl p-5 mb-4 items-center">
          <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mb-3">
            <Ionicons name={LANGUAGE_ICONS[primary]} size={22} color="#FFFFFF" />
          </View>
          <Text className="text-lg font-heading text-foreground mb-1">
            {LANGUAGE_LABELS[primary]}
          </Text>
          <Text className="text-xs font-body text-primary mb-2">Primary Language</Text>
          <Text className="text-sm font-body text-foreground text-center leading-5">
            {LANGUAGE_DESCRIPTIONS[primary]}
          </Text>
        </View>

        {/* Secondary language card */}
        <View className="mx-5 bg-purple-tint rounded-2xl p-4 mb-6 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center mr-3">
            <Ionicons name={LANGUAGE_ICONS[secondary]} size={18} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-heading text-foreground">
              {LANGUAGE_LABELS[secondary]}
            </Text>
            <Text className="text-xs font-body text-secondary">Secondary Language</Text>
          </View>
        </View>

        {/* Language Breakdown */}
        <View className="mx-5 mb-6">
          <Text className="text-base font-heading text-foreground mb-4">
            Language Breakdown
          </Text>
          {sorted.map(([key]) => (
            <LanguageBar
              key={key}
              languageKey={key}
              score={scores[key]}
              maxScore={maxScore}
              isPrimary={key === primary}
            />
          ))}
        </View>

        {/* CTA buttons */}
        <View className="mx-5">
          <TouchableOpacity
            className="w-full bg-primary rounded-full py-4 items-center mb-3"
            onPress={() => router.push('/partner/invite')}
            activeOpacity={0.85}
          >
            <Text className="text-white text-base font-heading">Invite Partner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-full border border-primary rounded-full py-4 items-center mb-3"
            onPress={() => router.push('/love-languages/comparison')}
            activeOpacity={0.85}
          >
            <Text className="text-primary text-base font-heading">See Compatibility</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-2"
            onPress={() => router.replace('/(tabs)/')}
          >
            <Text className="text-sm font-body text-muted">Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
