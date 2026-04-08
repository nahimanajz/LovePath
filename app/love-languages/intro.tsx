import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';

function CheckItem({ text }: { text: string }): JSX.Element {
  return (
    <View style={styles.checkItem}>
      <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

export default function QuizIntroScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LovePath</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <Text style={styles.heroText}>How do you{'\n'}<Text style={styles.heroItalic}>truly</Text> feel loved?</Text>
        </View>

        <Text style={styles.body}>
          Based on Gary Chapman's revolutionary framework, discovering your Love Language helps you build deeper, more meaningful connections.
        </Text>

        <View style={styles.iconsRow}>
          {(['chatbubble-outline', 'hand-left-outline', 'heart-outline', 'gift-outline', 'time-outline'] as const).map((icon) => (
            <View key={icon} style={styles.iconCircle}>
              <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
          ))}
        </View>

        <View style={styles.languagesCard}>
          <Text style={styles.languagesTitle}>The 5 Languages</Text>
          <Text style={styles.languagesBody}>Everyone gives and receives love differently. Words of Affirmation, Acts of Service, Receiving Gifts, Quality Time, and Physical Touch.</Text>
        </View>

        <Text style={styles.expectTitle}>What to expect</Text>
        <CheckItem text="30 questions focused on your preferences" />
        <CheckItem text="Approximately 5 minutes to complete" />
        <CheckItem text="Reveals your primary and secondary languages" />
        <CheckItem text="Invite a partner to compare and sync results" />

        <View style={{ height: 32 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/love-languages/quiz')} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  heroBlock: { marginTop: 32, marginBottom: 24 },
  heroText: { fontSize: fontSizes.xl3, fontFamily: fonts.heading, color: colors.foreground, textAlign: 'center', lineHeight: 40 },
  heroItalic: { fontStyle: 'italic' },
  body: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 8 },
  iconsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 32 },
  iconCircle: { width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.roseTint, alignItems: 'center', justifyContent: 'center' },
  languagesCard: { backgroundColor: colors.card, borderRadius: radii.xl2, padding: 16, marginBottom: 24 },
  languagesTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 8 },
  languagesBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, lineHeight: 20 },
  expectTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 16 },
  checkItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  checkText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  ctaBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
