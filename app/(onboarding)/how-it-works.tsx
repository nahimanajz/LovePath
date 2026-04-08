import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';

interface FrameworkCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  title: string;
  subtitle: string;
  source: string;
}

function FrameworkCard({ icon, iconColor, bgColor, title, subtitle, source }: FrameworkCardProps): JSX.Element {
  return (
    <View style={[styles.frameworkCard, { backgroundColor: bgColor }]}>
      <View style={styles.frameworkIcon}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.frameworkTitle}>{title}</Text>
        <Text style={styles.frameworkSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.frameworkSource}>{source}</Text>
    </View>
  );
}

interface ProgressDotsProps {
  total: number;
  active: number;
}

function ProgressDots({ total, active }: ProgressDotsProps): JSX.Element {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width: i === active ? 20 : 8,
              backgroundColor: i === active ? colors.primary : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function HowItWorksScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <ProgressDots total={3} active={0} />
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>How LovePath works</Text>
          <Text style={styles.subtitle}>Three proven frameworks. One clear picture.</Text>
        </View>

        <FrameworkCard icon="trending-up" iconColor={colors.primary} bgColor={colors.roseTint} title="LovePath stages" subtitle="Track your journey's growth" source="Joe Beam" />
        <FrameworkCard icon="person" iconColor={colors.secondary} bgColor={colors.purpleTint} title="Stoic obstacle guide" subtitle="Navigate conflict with calm" source="Ryan Holiday" />
        <FrameworkCard icon="heart" iconColor="#268947" bgColor={colors.tealTint} title="5 Love Languages" subtitle="Speak their heart's dialect" source="Gary Chapman" />

        <View style={styles.spacerLg} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(onboarding)/your-situation')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.skipText}>Skip intro</Text>
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
  frameworkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.xl2,
    padding: 16,
    marginBottom: 12,
  },
  frameworkIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flex1: { flex: 1 },
  frameworkTitle: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.foreground },
  frameworkSubtitle: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  frameworkSource: { fontSize: 10, fontFamily: fonts.body, color: colors.muted, fontStyle: 'italic' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { height: 8, borderRadius: radii.full },
  spacerLg: { height: 32 },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted },
});
