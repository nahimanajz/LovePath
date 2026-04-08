import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { useSessionStore } from '../../src/store/session';
import { usersService } from '../../src/services/users';
import { insightsService } from '../../src/services/insights';
import { lovepathService } from '../../src/services/lovepath';
import { effortService } from '../../src/services/effortBalance';
import { trustService } from '../../src/services/trustCircle';
import { quizService } from '../../src/services/quizResults';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { ErrorScreen } from '../../src/components/ui/ErrorScreen';
import { PartnerChip } from '../../src/components/dashboard/PartnerChip';
import { LoveLanguageCard } from '../../src/components/dashboard/LoveLanguageCard';
import { LovePathCard } from '../../src/components/dashboard/LovePathCard';
import { EffortBalanceCard } from '../../src/components/dashboard/EffortBalanceCard';
import { TrustCircleCard } from '../../src/components/dashboard/TrustCircleCard';
import { DailyInsightCard } from '../../src/components/dashboard/DailyInsightCard';
import { getGreeting, formatTodayDate, computeEffortBalance, countOneSidedTrust, getTodayInsightIndex } from '../../src/utils/dashboardHelpers';
import { colors, fonts, fontSizes } from '../../src/styles/theme';

const FALLBACK_USER_ID = 1;

export default function HomeDashboard(): JSX.Element {
  const sessionUserId = useSessionStore((s) => s.userId);
  const userId = sessionUserId ?? FALLBACK_USER_ID;

  const userQuery = useQuery({ queryKey: ['user', userId], queryFn: () => usersService.getById(userId) });
  const insightsQuery = useQuery({ queryKey: ['insights'], queryFn: () => insightsService.getAll() });
  const lovepathQuery = useQuery({ queryKey: ['lovepath', userId], queryFn: () => lovepathService.getByUser(userId) });
  const effortQuery = useQuery({ queryKey: ['effortBalance', userId], queryFn: () => effortService.getByUser(userId) });
  const trustQuery = useQuery({ queryKey: ['trustCircle', userId], queryFn: () => trustService.getByUser(userId) });
  const quizQuery = useQuery({ queryKey: ['quizResults', userId], queryFn: () => quizService.getByUser(userId) });

  if (userQuery.isLoading) return <LoadingScreen />;
  if (userQuery.error) return <ErrorScreen message={userQuery.error.message} onRetry={userQuery.refetch} />;

  const user = userQuery.data;
  const insights = insightsQuery.data ?? [];
  const lovepathRecord = lovepathQuery.data?.[0];
  const effortRecord = effortQuery.data?.[0];
  const trustPeople = trustQuery.data ?? [];
  const latestQuiz = quizQuery.data?.[0] ?? null;

  const todayInsight = insights.length > 0 ? insights[getTodayInsightIndex(insights.length)] : undefined;
  const effortBalance = computeEffortBalance(effortRecord);
  const oneSidedCount = trustQuery.isLoading ? null : countOneSidedTrust(trustPeople);
  const primaryLanguage = latestQuiz?.primary ?? null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>{getGreeting()}{user?.name ? `, ${user.name}` : ''}</Text>
          <Text style={styles.date}>{formatTodayDate()}</Text>
          {!user?.partnerId && <PartnerChip />}
        </View>

        <View style={styles.pillarsBlock}>
          <Text style={styles.sectionTitle}>Your Pillars</Text>
          <View style={styles.cardRow}>
            <LoveLanguageCard primaryLanguage={primaryLanguage} isLoading={quizQuery.isLoading} />
            <LovePathCard stage={lovepathRecord?.currentStage} isLoading={lovepathQuery.isLoading} />
          </View>
          <View style={styles.cardRow}>
            <EffortBalanceCard balancePct={effortBalance} isLoading={effortQuery.isLoading} />
            <TrustCircleCard oneSidedCount={oneSidedCount} isLoading={trustQuery.isLoading} />
          </View>
        </View>

        <View style={styles.insightBlock}>
          <Text style={styles.sectionTitle}>Today's Insight</Text>
          <DailyInsightCard insight={todayInsight} isLoading={insightsQuery.isLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  greetingBlock: { marginBottom: 24 },
  greeting: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground },
  date: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginTop: 4 },
  pillarsBlock: { marginBottom: 16 },
  sectionTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 12 },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  insightBlock: { marginTop: 8 },
});
