import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
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
import {
  getGreeting,
  formatTodayDate,
  computeEffortBalance,
  countOneSidedTrust,
  getTodayInsightIndex,
} from '../../src/utils/dashboardHelpers';

const FALLBACK_USER_ID = 1;

export default function HomeDashboard(): JSX.Element {
  const sessionUserId = useSessionStore((s) => s.userId);
  const userId = sessionUserId ?? FALLBACK_USER_ID;

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getById(userId),
  });

  const insightsQuery = useQuery({
    queryKey: ['insights'],
    queryFn: () => insightsService.getAll(),
  });

  const lovepathQuery = useQuery({
    queryKey: ['lovepath', userId],
    queryFn: () => lovepathService.getByUser(userId),
  });

  const effortQuery = useQuery({
    queryKey: ['effortBalance', userId],
    queryFn: () => effortService.getByUser(userId),
  });

  const trustQuery = useQuery({
    queryKey: ['trustCircle', userId],
    queryFn: () => trustService.getByUser(userId),
  });

  const quizQuery = useQuery({
    queryKey: ['quizResults', userId],
    queryFn: () => quizService.getByUser(userId),
  });

  const isCriticalLoading = userQuery.isLoading;
  const criticalError = userQuery.error;

  if (isCriticalLoading) return <LoadingScreen />;
  if (criticalError) {
    return (
      <ErrorScreen
        message={criticalError.message}
        onRetry={userQuery.refetch}
      />
    );
  }

  const user = userQuery.data;
  const insights = insightsQuery.data ?? [];
  const lovepathRecord = lovepathQuery.data?.[0];
  const effortRecord = effortQuery.data?.[0];
  const trustPeople = trustQuery.data ?? [];
  const latestQuiz = quizQuery.data?.[0] ?? null;

  const todayInsight =
    insights.length > 0 ? insights[getTodayInsightIndex(insights.length)] : undefined;

  const effortBalance = computeEffortBalance(effortRecord);
  const oneSidedCount = trustQuery.isLoading ? null : countOneSidedTrust(trustPeople);

  const primaryLanguage = latestQuiz?.primary ?? null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Header */}
        <View className="mb-6">
          <Text className="text-h1 font-heading text-foreground">
            {getGreeting()}{user?.name ? `, ${user.name}` : ''}
          </Text>
          <Text className="text-caption font-body text-muted mt-1">{formatTodayDate()}</Text>
          {!user?.partnerId && <PartnerChip />}
        </View>

        {/* Pillar Cards Grid */}
        <View className="mb-4">
          <Text className="text-h3 font-heading text-foreground mb-3">Your Pillars</Text>
          <View className="flex-row gap-3 mb-3">
            <LoveLanguageCard
              primaryLanguage={primaryLanguage}
              isLoading={quizQuery.isLoading}
            />
            <LovePathCard
              stage={lovepathRecord?.currentStage}
              isLoading={lovepathQuery.isLoading}
            />
          </View>
          <View className="flex-row gap-3">
            <EffortBalanceCard
              balancePct={effortBalance}
              isLoading={effortQuery.isLoading}
            />
            <TrustCircleCard
              oneSidedCount={oneSidedCount}
              isLoading={trustQuery.isLoading}
            />
          </View>
        </View>

        {/* Daily Insight */}
        <View className="mt-2">
          <Text className="text-h3 font-heading text-foreground mb-3">Today's Insight</Text>
          <DailyInsightCard
            insight={todayInsight}
            isLoading={insightsQuery.isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
