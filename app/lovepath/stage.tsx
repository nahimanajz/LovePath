import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { lovepathService } from '../../src/services/lovepath';
import { LOVEPATH_STAGES } from '../../src/constants/lovepathStages';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { ErrorScreen } from '../../src/components/ui/ErrorScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { LovepathStage, LovepathStageRecord } from '../../src/types';

const STAGE_COLORS: Record<LovepathStage, { bg: string; text: string; border: string }> = {
  Attraction: { bg: colors.roseTint,   text: colors.primary,   border: colors.primary },
  Acceptance: { bg: colors.purpleTint, text: colors.secondary, border: colors.secondary },
  Attachment: { bg: colors.tealTint,   text: '#268947',        border: '#268947' },
  Aspiration: { bg: colors.amberTint,  text: colors.amber,     border: colors.amber },
};

const STAGE_ORDER: LovepathStage[] = ['Attraction', 'Acceptance', 'Attachment', 'Aspiration'];

export default function StageTrackerScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['lovepath', userId], queryFn: () => lovepathService.getByUser(userId) });

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<LovepathStageRecord> }) => lovepathService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lovepath', userId] }),
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const record = data?.[0];
  if (!record) return <ErrorScreen message="No stage data found." onRetry={refetch} />;

  const { currentStage, checklist } = record;
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);
  const currentChecklist: boolean[] = checklist[currentStage] ?? [false, false, false, false, false];
  const checkedCount = currentChecklist.filter(Boolean).length;
  const stageDef = LOVEPATH_STAGES.find((s) => s.stage === currentStage);
  const colors_ = STAGE_COLORS[currentStage];

  function handleToggle(idx: number): void {
    const next = [...currentChecklist];
    next[idx] = !next[idx];
    mutation.mutate({ id: record.id, payload: { checklist: { ...checklist, [currentStage]: next } } });
  }

  function handleStageChange(stage: LovepathStage): void {
    mutation.mutate({ id: record.id, payload: { currentStage: stage } });
  }

  function handleCTA(): void {
    if (checkedCount < 3) {
      router.push('/(tabs)/obstacles');
    } else {
      const nextIdx = currentStageIndex + 1;
      if (nextIdx < STAGE_ORDER.length) {
        Alert.alert('Advance Stage?', `Move to ${STAGE_ORDER[nextIdx]}?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Advance', onPress: () => handleStageChange(STAGE_ORDER[nextIdx]) },
        ]);
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LovePath</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Milestone Tracker</Text>
        <Text style={styles.subtitle}>Track your journey through Beam's four LovePath stages.</Text>

        <View style={styles.timelineBlock}>
          {STAGE_ORDER.map((stage, idx) => {
            const isActive = stage === currentStage;
            const isPast = idx < currentStageIndex;
            const c = STAGE_COLORS[stage];
            return (
              <TouchableOpacity key={stage} style={styles.timelineRow} onPress={() => handleStageChange(stage)} activeOpacity={0.7}>
                <View style={styles.timelineNodeCol}>
                  <View style={[styles.timelineNode, { backgroundColor: isActive || isPast ? c.bg : '#F1F1EE', borderColor: isActive ? c.border : isPast ? c.border : colors.border }]}>
                    {isPast ? (
                      <Ionicons name="checkmark" size={14} color={c.text} />
                    ) : isActive ? (
                      <View style={[styles.nodeDot, { backgroundColor: c.text }]} />
                    ) : (
                      <View style={[styles.nodeDot, { backgroundColor: colors.hint }]} />
                    )}
                  </View>
                  {idx < STAGE_ORDER.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <Text style={[styles.stageLabel, { color: isActive ? c.text : colors.muted, fontFamily: isActive ? fonts.heading : fonts.body }]}>
                  {stage}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {stageDef && (
          <View style={[styles.stageCard, { backgroundColor: colors_.bg }]}>
            <View style={styles.stageCardHeader}>
              <View style={[styles.stagePill, { backgroundColor: colors_.text }]}>
                <Text style={styles.stagePillText}>{currentStage}</Text>
              </View>
            </View>
            <Text style={styles.stageDesc}>{stageDef.description}</Text>

            {checkedCount < 2 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={14} color={colors.amber} style={{ marginRight: 6, marginTop: 1 }} />
                <Text style={styles.warningText}>{stageDef.warningSign}</Text>
              </View>
            )}

            <Text style={styles.checklistTitle}>Check off what's true right now</Text>
            {stageDef.checklist.map((item, idx) => {
              const checked = currentChecklist[idx] ?? false;
              return (
                <TouchableOpacity key={idx} style={styles.checklistRow} onPress={() => handleToggle(idx)} activeOpacity={0.7}>
                  <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={18} color={checked ? colors_.text : colors.hint} style={{ marginRight: 8, marginTop: 1 }} />
                  <Text style={[styles.checklistText, checked && styles.checklistChecked]}>{item}</Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.progressBlock}>
              <Text style={styles.progressLabel}>{checkedCount}/5 completed</Text>
              <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                <View style={[styles.progressFill, { width: `${(checkedCount / 5) * 100}%`, backgroundColor: colors_.text }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaBtn} onPress={handleCTA} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{checkedCount < 3 ? "What's blocking this stage?" : 'View next stage'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  spacer: { width: 24 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 24 },
  timelineBlock: { marginBottom: 24 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timelineNodeCol: { alignItems: 'center', marginRight: 12 },
  timelineNode: { width: 32, height: 32, borderRadius: radii.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nodeDot: { width: 8, height: 8, borderRadius: radii.full },
  timelineLine: { width: 2, height: 16, backgroundColor: colors.border, marginTop: 4 },
  stageLabel: { fontSize: fontSizes.sm },
  stageCard: { borderRadius: radii.xl2, padding: 20, marginBottom: 16 },
  stageCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stagePill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.full },
  stagePillText: { fontSize: fontSizes.caption, fontFamily: fonts.heading, color: colors.white },
  stageDesc: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground, marginBottom: 12 },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: radii.xl, padding: 12 },
  warningText: { flex: 1, fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.foreground },
  checklistTitle: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 12 },
  checklistRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  checklistText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  checklistChecked: { textDecorationLine: 'line-through', color: colors.muted },
  progressBlock: { marginTop: 12 },
  progressLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 4 },
  progressTrack: { height: 6, borderRadius: radii.full },
  progressFill: { height: 6, borderRadius: radii.full },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  ctaBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
