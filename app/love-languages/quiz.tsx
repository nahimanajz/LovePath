import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QUIZ_QUESTIONS } from '../../src/constants/quizQuestions';
import { useQuizStore } from '../../src/store/quizStore';
import { useSessionStore } from '../../src/store/session';
import { API, apiFetch } from '../../src/config/api';
import type { LanguageKey, LanguageScores, QuizResult } from '../../src/types';

type Selection = 'A' | 'B' | null;

export default function QuizScreen(): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Selection>(null);
  const [scores, setScores] = useState<LanguageScores>({
    WA: 0, QT: 0, RG: 0, AS: 0, PT: 0,
  });
  const setResult = useQuizStore((s) => s.setResult);
  const userId = useSessionStore((s) => s.userId) ?? 1;

  const question = QUIZ_QUESTIONS[currentIndex];
  const total = QUIZ_QUESTIONS.length;
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  const handleBack = useCallback((): void => {
    if (currentIndex === 0) {
      Alert.alert(
        'Leave Quiz?',
        'Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ],
      );
    } else {
      setCurrentIndex((i) => i - 1);
      setSelected(null);
    }
  }, [currentIndex]);

  async function handleNext(): Promise<void> {
    if (!selected) return;

    const chosenLanguage: LanguageKey =
      selected === 'A' ? question.optionA.language : question.optionB.language;

    const nextScores = { ...scores, [chosenLanguage]: scores[chosenLanguage] + 1 };
    setScores(nextScores);

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    } else {
      // Quiz complete — compute results
      const sorted = (Object.entries(nextScores) as [LanguageKey, number][])
        .sort(([, a], [, b]) => b - a);
      const primary = sorted[0][0];
      const secondary = sorted[1][0];

      setResult({ primary, secondary, scores: nextScores });

      try {
        await apiFetch<QuizResult>(API.quizResults, {
          method: 'POST',
          body: JSON.stringify({
            userId,
            primary,
            secondary,
            scores: nextScores,
            completedAt: new Date().toISOString(),
          }),
        });
      } catch {
        // Continue even if save fails in dev
      }

      router.replace('/love-languages/results');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-sm font-heading text-primary">LovePath</Text>
        <View className="w-8 h-8 rounded-full bg-rose-tint items-center justify-center">
          <Ionicons name="person" size={16} color="#C0556A" />
        </View>
      </View>

      {/* Progress */}
      <View className="flex-row items-center justify-between px-5 mt-2 mb-1">
        <Text className="text-xs font-body text-muted">
          Question {currentIndex + 1} of {total}
        </Text>
        <Text className="text-xs font-body text-primary">
          {progress}% Complete
        </Text>
      </View>
      <View className="mx-5 h-1.5 rounded-full bg-border mb-6">
        <View
          className="h-1.5 rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Question area */}
      <View className="flex-1 px-5">
        {/* Large question number */}
        <View className="bg-[#FFF5F6] rounded-2xl items-center justify-center py-8 mb-6">
          <Text className="text-6xl font-heading text-rose-tint mb-2">
            {currentIndex + 1}
          </Text>
          <Text className="text-base font-heading text-foreground text-center px-4">
            Which would mean more to you right now?
          </Text>
        </View>

        {/* Option A */}
        <TouchableOpacity
          className={`flex-row items-center rounded-2xl p-4 mb-3 border ${
            selected === 'A'
              ? 'border-primary border-2 bg-rose-tint'
              : 'border-border bg-card'
          }`}
          onPress={() => setSelected('A')}
          activeOpacity={0.7}
        >
          <View
            className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
              selected === 'A' ? 'bg-primary' : 'bg-border'
            }`}
          >
            <Text
              className={`text-sm font-heading ${
                selected === 'A' ? 'text-white' : 'text-muted'
              }`}
            >
              A
            </Text>
          </View>
          <Text className="flex-1 text-sm font-body text-foreground">
            {question.optionA.text}
          </Text>
          {selected === 'A' && (
            <Ionicons name="checkmark-circle" size={20} color="#C0556A" />
          )}
        </TouchableOpacity>

        {/* Option B */}
        <TouchableOpacity
          className={`flex-row items-center rounded-2xl p-4 mb-3 border ${
            selected === 'B'
              ? 'border-primary border-2 bg-rose-tint'
              : 'border-border bg-card'
          }`}
          onPress={() => setSelected('B')}
          activeOpacity={0.7}
        >
          <View
            className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
              selected === 'B' ? 'bg-primary' : 'bg-border'
            }`}
          >
            <Text
              className={`text-sm font-heading ${
                selected === 'B' ? 'text-white' : 'text-muted'
              }`}
            >
              B
            </Text>
          </View>
          <Text className="flex-1 text-sm font-body text-foreground">
            {question.optionB.text}
          </Text>
          {selected === 'B' && (
            <Ionicons name="checkmark-circle" size={20} color="#C0556A" />
          )}
        </TouchableOpacity>
      </View>

      {/* Next button */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          className={`w-full rounded-full py-4 flex-row items-center justify-center ${
            selected ? 'bg-primary' : 'bg-hint'
          }`}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading mr-2">
            {currentIndex === total - 1 ? 'See Results' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
