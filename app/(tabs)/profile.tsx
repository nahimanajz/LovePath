import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSessionStore } from '../../src/store/session';
import { useQuizStore } from '../../src/store/quizStore';
import { usersService } from '../../src/services/users';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { LANGUAGE_LABELS } from '../../src/types';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';

const APP_VERSION: string = (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

function SettingsRow({ icon, label, onPress, color = colors.foreground }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; color?: string }): JSX.Element {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsIcon}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.settingsLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.hint} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const clearSession = useSessionStore((s) => s.clearSession);
  const clearQuiz = useQuizStore((s) => s.clearResult);
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showRetakeModal, setShowRetakeModal] = useState(false);

  const { data: user, isLoading } = useQuery({ queryKey: ['user', userId], queryFn: () => usersService.getById(userId) });

  const updateUserMutation = useMutation({
    mutationFn: (data: { primaryLanguage: null; languageScores: null }) => usersService.update(userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', userId] }),
  });

  if (isLoading) return <LoadingScreen />;

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() ?? 'ME';
  const primaryLanguage = user?.primaryLanguage ? LANGUAGE_LABELS[user.primaryLanguage as keyof typeof LANGUAGE_LABELS] : null;

  function handleSignOut(): void {
    Alert.alert('Sign out?', 'You will be returned to the welcome screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => { clearSession(); clearQuiz(); queryClient.clear(); router.replace('/(onboarding)/'); } },
    ]);
  }

  function handleRetakeQuiz(): void {
    setShowRetakeModal(false);
    clearQuiz();
    updateUserMutation.mutate({ primaryLanguage: null, languageScores: null });
    router.push('/love-languages/quiz');
  }

  function handleDeleteAccount(): void {
    if (deleteConfirmText !== 'DELETE') return;
    Alert.alert('Account deleted', 'All data has been removed.', [{ text: 'OK', onPress: () => { clearSession(); router.replace('/(onboarding)/'); } }]);
    setShowDeleteModal(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Text style={styles.headerTitle}>LovePath</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={10} color={colors.white} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'You'}</Text>
          {user?.partnerId ? (
            <Text style={styles.partnerStatus}>Connected with partner</Text>
          ) : (
            <TouchableOpacity onPress={() => router.push('/partner/invite')}>
              <Text style={styles.connectLink}>Connect with partner →</Text>
            </TouchableOpacity>
          )}
        </View>

        {primaryLanguage && (
          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>Relationship Insight</Text>
            <View style={styles.insightRow}>
              <View>
                <Text style={styles.insightSubLabel}>Your love language</Text>
                <Text style={styles.insightValue}>{primaryLanguage}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRetakeModal(true)} style={styles.retakeBtn}>
                <Text style={styles.retakeBtnText}>Retake quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionLabel}>Relationship</Text>
        <View style={styles.settingsCard}>
          <SettingsRow icon="people-outline" label="Partner Details" onPress={() => router.push('/partner/invite')} />
          <SettingsRow icon="calendar-outline" label="Anniversary & Milestones" onPress={() => Alert.alert('Coming soon', 'Anniversary tracking is on the roadmap.')} />
        </View>

        <Text style={styles.sectionLabel}>Data & Privacy</Text>
        <View style={styles.settingsCard}>
          <SettingsRow icon="lock-closed-outline" label="Security Settings" onPress={() => Alert.alert('Security', 'Password change coming soon.')} />
          <SettingsRow icon="download-outline" label="Export Data" onPress={() => Alert.alert('Export', 'Data export will be emailed to you.')} />
          <SettingsRow icon="trash-outline" label="Delete Account" onPress={() => setShowDeleteModal(true)} color={colors.danger} />
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.settingsCard}>
          <View style={styles.versionRow}>
            <View style={styles.greenDot} />
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
          <SettingsRow icon="help-circle-outline" label="Help Center" onPress={() => Alert.alert('Help', 'Visit lovepath.app/help for support.')} />
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showRetakeModal} transparent animationType="slide" onRequestClose={() => setShowRetakeModal(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowRetakeModal(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Retake the quiz?</Text>
          <Text style={styles.sheetBody}>Your current love language result will be cleared. You can retake the quiz to get an updated result.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRetakeQuiz}>
            <Text style={styles.primaryBtnText}>Yes, retake quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRetakeModal(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showDeleteModal} transparent animationType="slide" onRequestClose={() => setShowDeleteModal(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowDeleteModal(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Delete account?</Text>
          <Text style={styles.sheetBody}>All your data will be permanently removed. This cannot be undone. Type DELETE to confirm.</Text>
          <TextInput
            style={styles.deleteInput}
            placeholder="Type DELETE to confirm"
            placeholderTextColor={colors.hint}
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: deleteConfirmText === 'DELETE' ? colors.danger : colors.border }]}
            onPress={handleDeleteAccount}
            disabled={deleteConfirmText !== 'DELETE'}
          >
            <Text style={[styles.primaryBtnText, { color: deleteConfirmText === 'DELETE' ? colors.white : colors.hint }]}>Delete my account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
  scroll: { flex: 1, paddingHorizontal: 20 },
  avatarBlock: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: radii.full, backgroundColor: colors.roseTint, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.primary },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: radii.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: fontSizes.xl, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 2 },
  partnerStatus: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  connectLink: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.primary },
  insightCard: { backgroundColor: colors.roseTint, borderRadius: radii.xl2, padding: 16, marginBottom: 20 },
  insightLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 4, letterSpacing: 2, textTransform: 'uppercase' },
  insightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  insightSubLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  insightValue: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.primary },
  retakeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1, borderColor: colors.primary },
  retakeBtnText: { fontSize: fontSizes.caption, fontFamily: fonts.heading, color: colors.primary },
  sectionLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  settingsCard: { backgroundColor: colors.card, borderRadius: radii.xl2, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingsIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingsLabel: { flex: 1, fontSize: fontSizes.sm, fontFamily: fonts.body },
  versionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  greenDot: { width: 8, height: 8, borderRadius: radii.full, backgroundColor: '#22C55E', marginRight: 12, marginLeft: 2 },
  versionText: { flex: 1, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
  signOutBtn: { alignItems: 'center', paddingVertical: 16, marginBottom: 32 },
  signOutText: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radii.xl3, borderTopRightRadius: radii.xl3, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: fontSizes.lg, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 8 },
  sheetBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 24 },
  deleteInput: {
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
  },
  primaryBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted },
});
