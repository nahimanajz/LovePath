import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { usersService } from '../../src/services/users';
import { quizService } from '../../src/services/quizResults';
import { LANGUAGE_LABELS } from '../../src/types';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { LanguageKey, LanguageScores } from '../../src/types';

const LANGUAGE_ORDER: LanguageKey[] = ['WA', 'QT', 'RG', 'AS', 'PT'];

const LANGUAGE_COLORS: Record<LanguageKey, string> = {
  WA: colors.primary, QT: colors.secondary, RG: '#268947', AS: colors.amber, PT: colors.danger,
};

function computeMatch(a: LanguageScores, b: LanguageScores, primaryA: LanguageKey, primaryB: LanguageKey): number {
  const diff = Math.abs(a[primaryA] - b[primaryB]);
  return Math.max(0, Math.min(100, 100 - diff * 5));
}

function matchColor(pct: number): string {
  if (pct >= 80) return '#268947';
  if (pct >= 50) return colors.amber;
  return colors.danger;
}

function Avatar({ name, size = 48 }: { name: string; size?: number }): JSX.Element {
  return (
    <View style={[styles.avatarCircle, { width: size, height: size }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4, color: colors.primary }]}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export default function ComparisonScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;

  const userQuery = useQuery({ queryKey: ['user', userId], queryFn: () => usersService.getById(userId) });
  const quizQuery = useQuery({ queryKey: ['quizResults', userId], queryFn: () => quizService.getByUser(userId) });

  const user = userQuery.data;
  const partnerId = user?.partnerId;

  const partnerQuery = useQuery({ queryKey: ['user', partnerId], queryFn: () => usersService.getById(partnerId!), enabled: !!partnerId });
  const partnerQuizQuery = useQuery({ queryKey: ['quizResults', partnerId], queryFn: () => quizService.getByUser(partnerId!), enabled: !!partnerId });

  if (userQuery.isLoading || quizQuery.isLoading) return <LoadingScreen />;

  const myQuiz = quizQuery.data?.[0];
  const partner = partnerQuery.data;
  const partnerQuiz = partnerQuizQuery.data?.[0];

  if (!partnerId) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color={colors.hint} />
        <Text style={styles.emptyTitle}>No partner connected</Text>
        <Text style={styles.emptyBody}>Invite your partner to compare your Love Languages.</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/partner/invite')}>
          <Text style={styles.emptyBtnText}>Invite Partner</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!partnerQuiz) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={48} color={colors.hint} />
        <Text style={styles.emptyTitle}>{partner?.name ?? 'Your partner'} hasn't taken the quiz yet</Text>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/partner/invite')}>
          <Text style={styles.outlineBtnText}>Send reminder</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const matchPct = myQuiz ? computeMatch(myQuiz.scores, partnerQuiz.scores, myQuiz.primary, partnerQuiz.primary) : 0;
  const mColor = matchColor(matchPct);
  const maxScore = 12;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LovePath</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="share-outline" size={22} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarsRow}>
          <View style={styles.avatarItem}>
            <Avatar name={user?.name ?? 'A'} size={56} />
            <Text style={styles.avatarName}>{user?.name ?? 'You'}</Text>
            <Text style={styles.avatarLang}>{myQuiz ? LANGUAGE_LABELS[myQuiz.primary] : '—'}</Text>
          </View>
          <View style={styles.avatarItem}>
            <View style={[styles.partnerCircle, { width: 56, height: 56 }]}>
              <Text style={styles.partnerInitial}>{partner?.name?.charAt(0) ?? 'J'}</Text>
            </View>
            <Text style={styles.avatarName}>{partner?.name ?? 'Partner'}</Text>
            <Text style={styles.avatarLang}>{LANGUAGE_LABELS[partnerQuiz.primary]}</Text>
          </View>
        </View>

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Compatibility Score</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scorePct, { color: mColor }]}>{matchPct}%</Text>
            <Ionicons name="heart" size={24} color={mColor} style={{ marginLeft: 6 }} />
          </View>
          <Text style={styles.scoreDesc}>
            {matchPct >= 80 ? 'Strong alignment' : matchPct >= 50 ? 'Some key differences in expression' : 'Significant gap — talk about it'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Language Breakdown</Text>
        {LANGUAGE_ORDER.map((key) => {
          const myScore = myQuiz?.scores[key] ?? 0;
          const partnerScore = partnerQuiz.scores[key];
          return (
            <View key={key} style={styles.langRow}>
              <View style={styles.langHeader}>
                <Text style={styles.langLabel}>{LANGUAGE_LABELS[key]}</Text>
                <Text style={styles.langScores}>{myScore} / {partnerScore}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(myScore / maxScore) * 100}%`, backgroundColor: LANGUAGE_COLORS[key] }]} />
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(partnerScore / maxScore) * 100}%`, backgroundColor: LANGUAGE_COLORS[key], opacity: 0.4 }]} />
              </View>
            </View>
          );
        })}

        {myQuiz && (
          <View style={styles.gapCard}>
            <Text style={[styles.gapTitle, { color: colors.amber }]}>The gap that matters</Text>
            <Text style={styles.gapBody}>
              You value <Text style={styles.bold}>{LANGUAGE_LABELS[myQuiz.primary]}</Text> most, while {partner?.name ?? 'your partner'} values{' '}
              <Text style={styles.bold}>{LANGUAGE_LABELS[partnerQuiz.primary]}</Text>. Speaking each other's language bridges this gap.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyTitle: { fontSize: fontSizes.lg, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 8, textAlign: 'center' },
  emptyBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: colors.white, fontSize: fontSizes.sm, fontFamily: fonts.heading },
  outlineBtn: { marginTop: 16, borderWidth: 1, borderColor: colors.primary, borderRadius: radii.button, paddingVertical: 12, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
  outlineBtnText: { color: colors.primary, fontSize: fontSizes.sm, fontFamily: fonts.heading, marginRight: 4 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  avatarsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 24, gap: 32 },
  avatarItem: { alignItems: 'center' },
  avatarCircle: { borderRadius: radii.full, backgroundColor: colors.roseTint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading },
  partnerCircle: { borderRadius: radii.full, backgroundColor: colors.purpleTint, alignItems: 'center', justifyContent: 'center' },
  partnerInitial: { fontFamily: fonts.heading, color: colors.secondary, fontSize: fontSizes.xl2 },
  avatarName: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.foreground, marginTop: 4 },
  avatarLang: { fontSize: 10, fontFamily: fonts.body, color: colors.muted },
  scoreBlock: { alignItems: 'center', marginBottom: 32 },
  scoreLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'center' },
  scorePct: { fontFamily: fonts.heading, fontSize: 48 },
  scoreDesc: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginTop: 4 },
  sectionTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 16 },
  langRow: { marginBottom: 16 },
  langHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  langLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.foreground },
  langScores: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  barTrack: { height: 6, borderRadius: radii.full, backgroundColor: colors.border, marginBottom: 4 },
  barFill: { height: 6, borderRadius: radii.full },
  gapCard: { backgroundColor: colors.amberTint, borderRadius: radii.xl2, padding: 16, marginBottom: 32 },
  gapTitle: { fontSize: fontSizes.caption, fontFamily: fonts.heading, marginBottom: 4 },
  gapBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  bold: { fontFamily: fonts.heading },
});
