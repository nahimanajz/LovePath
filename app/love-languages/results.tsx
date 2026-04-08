import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuizStore } from '../../src/store/quizStore';
import { LANGUAGE_LABELS } from '../../src/types';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { LanguageKey } from '../../src/types';

const LANGUAGE_ICONS: Record<LanguageKey, keyof typeof Ionicons.glyphMap> = {
  WA: 'chatbubble-outline', QT: 'time-outline', RG: 'gift-outline', AS: 'hand-left-outline', PT: 'heart-outline',
};

const LANGUAGE_DESCRIPTIONS: Record<LanguageKey, string> = {
  WA: 'You feel most loved through verbal expressions of love, praise, and encouragement.',
  QT: 'You feel most loved when someone gives you their full, undivided attention.',
  RG: 'You feel most loved through thoughtful gifts and meaningful symbols of love.',
  AS: 'You feel most loved when others go out of their way to help and serve you.',
  PT: 'You feel most loved through physical closeness, touch, and affection.',
};

function LanguageBar({ languageKey, score, maxScore, isPrimary }: { languageKey: LanguageKey; score: number; maxScore: number; isPrimary: boolean }): JSX.Element {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return (
    <View style={styles.barGroup}>
      <View style={styles.barHeader}>
        <View style={styles.barLabelRow}>
          <Ionicons name={LANGUAGE_ICONS[languageKey]} size={14} color={isPrimary ? colors.primary : colors.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.barLabel, isPrimary && styles.barLabelPrimary]}>{LANGUAGE_LABELS[languageKey]}</Text>
        </View>
        <Text style={styles.barScore}>{score}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: isPrimary ? colors.primary : colors.hint }]} />
      </View>
    </View>
  );
}

export default function QuizResultsScreen(): JSX.Element {
  const result = useQuizStore((s) => s.result);

  if (!result) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No quiz results found. Take the quiz first.</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.replace('/love-languages/intro')}>
          <Text style={styles.emptyBtnText}>Take Quiz</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { primary, secondary, scores } = result;
  const maxScore = Math.max(...Object.values(scores));
  const sorted = (Object.entries(scores) as [LanguageKey, number][]).sort(([, a], [, b]) => b - a);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LovePath</Text>
        </View>

        <View style={styles.avatarBlock}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          <Text style={styles.userName}>Alex</Text>
          <Text style={styles.userSub}>{LANGUAGE_LABELS[primary]}</Text>
        </View>

        <View style={styles.primaryCard}>
          <View style={styles.primaryIcon}>
            <Ionicons name={LANGUAGE_ICONS[primary]} size={22} color={colors.white} />
          </View>
          <Text style={styles.primaryName}>{LANGUAGE_LABELS[primary]}</Text>
          <Text style={styles.primaryTag}>Primary Language</Text>
          <Text style={styles.primaryDesc}>{LANGUAGE_DESCRIPTIONS[primary]}</Text>
        </View>

        <View style={styles.secondaryCard}>
          <View style={styles.secondaryIcon}>
            <Ionicons name={LANGUAGE_ICONS[secondary]} size={18} color={colors.white} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.secondaryName}>{LANGUAGE_LABELS[secondary]}</Text>
            <Text style={styles.secondaryTag}>Secondary Language</Text>
          </View>
        </View>

        <View style={styles.breakdownBlock}>
          <Text style={styles.breakdownTitle}>Language Breakdown</Text>
          {sorted.map(([key]) => (
            <LanguageBar key={key} languageKey={key} score={scores[key]} maxScore={maxScore} isPrimary={key === primary} />
          ))}
        </View>

        <View style={styles.ctaBlock}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/partner/invite')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Invite Partner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/love-languages/comparison')} activeOpacity={0.85}>
            <Text style={styles.outlineBtnText}>See Compatibility</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={() => router.replace('/(tabs)/')}>
            <Text style={styles.ghostText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyText: { fontSize: fontSizes.base, fontFamily: fonts.body, color: colors.muted, textAlign: 'center' },
  emptyBtn: { marginTop: 16, backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: colors.white, fontSize: fontSizes.sm, fontFamily: fonts.heading },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  avatarBlock: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  avatarCircle: { width: 64, height: 64, borderRadius: radii.full, backgroundColor: colors.roseTint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  userName: { fontSize: fontSizes.lg, fontFamily: fonts.heading, color: colors.foreground },
  userSub: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  primaryCard: { marginHorizontal: 20, backgroundColor: colors.roseTint, borderRadius: radii.xl2, padding: 20, marginBottom: 16, alignItems: 'center' },
  primaryIcon: { width: 48, height: 48, borderRadius: radii.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  primaryName: { fontSize: fontSizes.lg, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 4 },
  primaryTag: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.primary, marginBottom: 8 },
  primaryDesc: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground, textAlign: 'center', lineHeight: 20 },
  secondaryCard: { marginHorizontal: 20, backgroundColor: colors.purpleTint, borderRadius: radii.xl2, padding: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center' },
  secondaryIcon: { width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flex1: { flex: 1 },
  secondaryName: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.foreground },
  secondaryTag: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.secondary },
  breakdownBlock: { marginHorizontal: 20, marginBottom: 24 },
  breakdownTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 16 },
  barGroup: { marginBottom: 12 },
  barHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center' },
  barLabel: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  barLabelPrimary: { fontFamily: fonts.heading, color: colors.primary },
  barScore: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  barTrack: { height: 8, borderRadius: radii.full, backgroundColor: colors.border },
  barFill: { height: 8, borderRadius: radii.full },
  ctaBlock: { marginHorizontal: 20 },
  primaryBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
  outlineBtn: { width: '100%', borderWidth: 1, borderColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  outlineBtnText: { color: colors.primary, fontSize: fontSizes.base, fontFamily: fonts.heading },
  ghostBtn: { alignItems: 'center', paddingVertical: 8 },
  ghostText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted },
});
