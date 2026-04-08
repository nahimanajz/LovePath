import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';

type SituationType = 'relationship_building' | 'early_dating' | 'recovering' | 'starting_over';

interface SituationOption {
  value: SituationType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SITUATIONS: SituationOption[] = [
  { value: 'relationship_building', label: 'In a relationship, building something real', icon: 'construct-outline' },
  { value: 'early_dating', label: 'Dating someone, figuring things out early', icon: 'heart-circle-outline' },
  { value: 'recovering', label: 'Recovering from betrayal or hurt', icon: 'refresh-outline' },
  { value: 'starting_over', label: 'Starting over, want to understand love better', icon: 'sunny-outline' },
];

function ProgressDots({ total, active }: { total: number; active: number }): JSX.Element {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { width: i === active ? 20 : 8, backgroundColor: i === active ? colors.primary : colors.border },
          ]}
        />
      ))}
    </View>
  );
}

export default function YourSituationScreen(): JSX.Element {
  const [selected, setSelected] = useState<SituationType | null>(null);
  const setSituation = useSessionStore((s) => s.setSituation);

  function handleContinue(): void {
    if (!selected) return;
    setSituation(selected);
    router.push('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <ProgressDots total={3} active={1} />
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>What describes you best?</Text>
          <Text style={styles.subtitle}>We'll tailor your experience.</Text>
        </View>

        {SITUATIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, isSelected ? styles.optionSelected : styles.optionDefault]}
              onPress={() => setSelected(option.value)}
              activeOpacity={0.7}
            >
              <Ionicons name={option.icon} size={20} color={isSelected ? colors.primary : colors.muted} style={{ marginRight: 12 }} />
              <Text style={styles.optionLabel}>{option.label}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}

        <View style={styles.spacerLg} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: selected ? colors.primary : colors.hint }]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  spacer: { width: 24 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  titleBlock: { marginTop: 24, marginBottom: 32 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 8 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { height: 8, borderRadius: radii.full },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.xl2,
    padding: 16,
    marginBottom: 12,
  },
  optionDefault: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  optionSelected: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.roseTint },
  optionLabel: { flex: 1, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  spacerLg: { height: 32 },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  ctaBtn: { width: '100%', borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
