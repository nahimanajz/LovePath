import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { INSIGHT_POOL, type InsightItem } from '../../src/constants/insightPool';
import { apiFetch, API } from '../../src/config/api';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { InsightCategory } from '../../src/types';

type FilterPill = 'All' | InsightCategory;

const PILLS: FilterPill[] = ['All', 'Love Languages', 'LovePath', 'Stoic', 'Betrayal', 'Rebuild', 'Ego'];

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  Beam:    { bg: colors.roseTint,   text: colors.primary },
  Holiday: { bg: colors.purpleTint, text: colors.secondary },
  Chapman: { bg: colors.tealTint,   text: '#268947' },
};

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getFeaturedInsight(): InsightItem {
  const epoch = new Date('2026-01-01').getTime();
  const dayIndex = Math.floor((Date.now() - epoch) / 86_400_000);
  return INSIGHT_POOL[dayIndex % INSIGHT_POOL.length];
}

export default function InsightFeedScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const [activeFilter, setActiveFilter] = useState<FilterPill>('All');
  const [reflectingOn, setReflectingOn] = useState<InsightItem | null>(null);
  const [journalText, setJournalText] = useState('');

  const journalMutation = useMutation({
    mutationFn: (body: { userId: number; date: string; text: string; insightId: number }) =>
      apiFetch(API.reflections, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { setReflectingOn(null); setJournalText(''); },
    onError: () => Alert.alert('Save failed', 'Could not save your reflection. Please try again.'),
  });

  const featured = getFeaturedInsight();
  const filtered = activeFilter === 'All' ? INSIGHT_POOL : INSIGHT_POOL.filter((i) => i.category === activeFilter);
  const browse = filtered.filter((i) => i.id !== featured.id);

  function handleSaveReflection(): void {
    if (!reflectingOn || !journalText.trim()) return;
    journalMutation.mutate({ userId, date: todayKey(), text: journalText.trim(), insightId: reflectingOn.id });
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
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Daily wisdom from Beam, Chapman, and Holiday.</Text>
        </View>

        <View style={styles.featuredCard}>
          <View style={styles.featuredHeader}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Daily Wisdom</Text>
            </View>
            <Text style={styles.featuredSource}>{featured.source}</Text>
          </View>
          <Text style={styles.featuredText}>"{featured.text.length > 120 ? featured.text.slice(0, 120) + '…' : featured.text}"</Text>
          <TouchableOpacity style={styles.reflectBtn} onPress={() => setReflectingOn(featured)}>
            <Text style={styles.reflectBtnText}>Reflect</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.browseTitle}>Browse Insights</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll} contentContainerStyle={{ gap: 8 }}>
          {PILLS.map((pill) => (
            <TouchableOpacity
              key={pill}
              onPress={() => setActiveFilter(pill)}
              style={[styles.pill, { backgroundColor: activeFilter === pill ? colors.primary : 'transparent', borderColor: activeFilter === pill ? colors.primary : colors.border }]}
            >
              <Text style={[styles.pillText, { color: activeFilter === pill ? colors.white : colors.muted }]}>{pill}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.insightList}>
          {browse.map((insight) => {
            const sc = SOURCE_COLORS[insight.source] ?? SOURCE_COLORS.Beam;
            return (
              <View key={insight.id} style={styles.insightCard}>
                <View style={styles.insightCardHeader}>
                  <View style={[styles.sourceBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.sourceBadgeText, { color: sc.text }]}>{insight.source}</Text>
                  </View>
                  <Text style={styles.categoryText}>{insight.category}</Text>
                </View>
                <Text style={styles.insightText}>{insight.text}</Text>
                <TouchableOpacity style={styles.insightReflectBtn} onPress={() => setReflectingOn(insight)}>
                  <Text style={styles.insightReflectText}>Reflect</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={reflectingOn !== null} transparent animationType="slide" onRequestClose={() => setReflectingOn(null)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setReflectingOn(null)} />
        <View style={styles.sheet}>
          {reflectingOn && (
            <>
              <Text style={styles.sheetTitle}>Your reflection</Text>
              <View style={styles.quoteCard}>
                <Text style={styles.quoteText}>"{reflectingOn.text.length > 100 ? reflectingOn.text.slice(0, 100) + '…' : reflectingOn.text}"</Text>
              </View>
              <TextInput
                style={styles.journalInput}
                placeholder="What does this mean for your relationship today?"
                placeholderTextColor={colors.hint}
                value={journalText}
                onChangeText={setJournalText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveReflection}
                disabled={journalMutation.isPending || !journalText.trim()}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>Save reflection</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  spacer: { width: 24 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  scroll: { flex: 1 },
  titleBlock: { paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 4 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted },
  featuredCard: { marginHorizontal: 20, marginBottom: 24, borderRadius: radii.xl2, padding: 20, backgroundColor: colors.primary },
  featuredHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featuredBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8 },
  featuredBadgeText: { fontSize: fontSizes.caption, fontFamily: fonts.heading, color: colors.white },
  featuredSource: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.white, opacity: 0.7 },
  featuredText: { fontSize: fontSizes.xl, fontFamily: fonts.heading, color: colors.white, lineHeight: 28, marginBottom: 16 },
  reflectBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.full, paddingHorizontal: 16, paddingVertical: 8 },
  reflectBtnText: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.white, marginRight: 4 },
  browseTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, paddingHorizontal: 20, marginBottom: 12 },
  pillsScroll: { paddingHorizontal: 20, marginBottom: 16, flexGrow: 0 },
  pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1 },
  pillText: { fontSize: fontSizes.sm, fontFamily: fonts.body },
  insightList: { paddingHorizontal: 20, paddingBottom: 32 },
  insightCard: { backgroundColor: colors.card, borderRadius: radii.xl2, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  insightCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  sourceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full },
  sourceBadgeText: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  categoryText: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  insightText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground, lineHeight: 20, marginBottom: 12 },
  insightReflectBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  insightReflectText: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary, marginRight: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radii.xl3, borderTopRightRadius: radii.xl3, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: fontSizes.lg, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 8 },
  quoteCard: { backgroundColor: colors.card, borderRadius: radii.xl, padding: 12, marginBottom: 16 },
  quoteText: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, fontStyle: 'italic' },
  journalInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.foreground,
    marginBottom: 20,
    minHeight: 120,
  },
  saveBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
