import { useState, useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QUIZ_QUESTIONS } from '../../src/constants/quizQuestions';
import { useQuizStore } from '../../src/store/quizStore';
import { useSessionStore } from '../../src/store/session';
import { API, apiFetch } from '../../src/config/api';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { LanguageKey, LanguageScores, QuizResult } from '../../src/types';

type Selection = 'A' | 'B' | null;

export default function QuizScreen(): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Selection>(null);
  const [scores, setScores] = useState<LanguageScores>({ WA: 0, QT: 0, RG: 0, AS: 0, PT: 0 });
  const setResult = useQuizStore((s) => s.setResult);
  const userId = useSessionStore((s) => s.userId) ?? 1;

  const question = QUIZ_QUESTIONS[currentIndex];
  const total = QUIZ_QUESTIONS.length;
  const progress = Math.round(((currentIndex + 1) / total) * 100);

  const handleBack = useCallback((): void => {
    if (currentIndex === 0) {
      Alert.alert('Leave Quiz?', 'Your progress will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      setCurrentIndex((i) => i - 1);
      setSelected(null);
    }
  }, [currentIndex]);

  async function handleNext(): Promise<void> {
    if (!selected) return;
    const chosenLanguage: LanguageKey = selected === 'A' ? question.optionA.language : question.optionB.language;
    const nextScores = { ...scores, [chosenLanguage]: scores[chosenLanguage] + 1 };
    setScores(nextScores);

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    } else {
      const sorted = (Object.entries(nextScores) as [LanguageKey, number][]).sort(([, a], [, b]) => b - a);
      const primary = sorted[0][0];
      const secondary = sorted[1][0];
      setResult({ primary, secondary, scores: nextScores });
      try {
        await apiFetch<QuizResult>(API.quizResults, {
          method: 'POST',
          body: JSON.stringify({ userId, primary, secondary, scores: nextScores, completedAt: new Date().toISOString() }),
        });
      } catch { /* Continue even if save fails */ }
      router.replace('/love-languages/results');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LovePath</Text>
        <View style={styles.avatarSmall}>
          <Ionicons name="person" size={16} color={colors.primary} />
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Question {currentIndex + 1} of {total}</Text>
        <Text style={styles.progressPct}>{progress}% Complete</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.body}>
        <View style={styles.questionBox}>
          <Text style={styles.questionNumber}>{currentIndex + 1}</Text>
          <Text style={styles.questionText}>Which would mean more to you right now?</Text>
        </View>

        {(['A', 'B'] as const).map((opt) => {
          const option = opt === 'A' ? question.optionA : question.optionB;
          const isSelected = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.optionCard, isSelected ? styles.optionSelected : styles.optionDefault]}
              onPress={() => setSelected(opt)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionBadge, { backgroundColor: isSelected ? colors.primary : colors.border }]}>
                <Text style={[styles.optionBadgeText, { color: isSelected ? colors.white : colors.muted }]}>{opt}</Text>
              </View>
              <Text style={styles.optionText}>{option.text}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: selected ? colors.primary : colors.hint }]}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>{currentIndex === total - 1 ? 'See Results' : 'Next'}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  avatarSmall: { width: 32, height: 32, borderRadius: radii.full, backgroundColor: colors.roseTint, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 4 },
  progressLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  progressPct: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.primary },
  progressTrack: { marginHorizontal: 20, height: 6, borderRadius: radii.full, backgroundColor: colors.border, marginBottom: 24 },
  progressFill: { height: 6, borderRadius: radii.full, backgroundColor: colors.primary },
  body: { flex: 1, paddingHorizontal: 20 },
  questionBox: { backgroundColor: '#FFF5F6', borderRadius: radii.xl2, alignItems: 'center', justifyContent: 'center', paddingVertical: 32, marginBottom: 24 },
  questionNumber: { fontSize: fontSizes.xl6, fontFamily: fonts.heading, color: colors.roseTint, marginBottom: 8 },
  questionText: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, textAlign: 'center', paddingHorizontal: 16 },
  optionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: radii.xl2, padding: 16, marginBottom: 12 },
  optionDefault: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  optionSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.roseTint },
  optionBadge: { width: 32, height: 32, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionBadgeText: { fontSize: fontSizes.sm, fontFamily: fonts.heading },
  optionText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  nextBtn: { width: '100%', borderRadius: radii.button, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  nextText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading, marginRight: 8 },
});
