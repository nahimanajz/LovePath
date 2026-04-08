import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';

interface BookPillProps {
  author: string;
}

function BookPill({ author }: BookPillProps): JSX.Element {
  return (
    <View style={styles.bookPill}>
      <Text style={styles.bookPillText}>{author}</Text>
    </View>
  );
}

export default function SplashScreen(): JSX.Element {
  const onGetStarted =() => router.push('/(onboarding)/how-it-works')
  const onLogin = () => router.push('/(auth)/login')
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.logoCircle}>
          <Ionicons name="chatbubble-ellipses" size={40} color={colors.primary} />
        </View>

        <Text style={styles.brand}>LovePath</Text>

        <Text style={styles.tagline}>Understand love. Build it together.</Text>

        <Text style={styles.attributionLabel}>Informed by the wisdom of</Text>
        <View style={styles.pillRow}>
          <BookPill author="Joe Beam" />
          <BookPill author="Ryan Holiday" />
          <BookPill author="Gary Chapman" />
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>

        <View style={styles.signInRow}>
          <Text style={styles.signInLabel}>Already have an account? </Text>
          <TouchableOpacity onPress={onLogin}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: radii.full,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brand: {
    fontSize: fontSizes.xl4,
    fontFamily: fonts.heading,
    color: colors.brandDark,
    marginBottom: 8,
  },
  tagline: {
    fontSize: fontSizes.base,
    fontFamily: fonts.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 48,
  },
  attributionLabel: {
    fontSize: 10,
    fontFamily: fonts.body,
    color: colors.hint,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  pillRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 48 },
  bookPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  bookPillText: { fontSize: fontSizes.caption, color: colors.muted, fontFamily: fonts.body },
  ctaButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
  signInRow: { flexDirection: 'row', alignItems: 'center' },
  signInLabel: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted },
  signInLink: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.primary },
});
