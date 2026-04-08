import { useState } from 'react';
import { View, Text, TouchableOpacity, Share, Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { usersService } from '../../src/services/users';
import { apiFetch, API } from '../../src/config/api';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { PartnerInvite } from '../../src/types';

const FEATURES = [
  { icon: 'git-compare-outline', label: 'Side-by-side comparison', desc: "See your Love Languages next to your partner's" },
  { icon: 'flag-outline',        label: 'Shared Milestones',        desc: 'Track your LovePath stage together' },
  { icon: 'chatbubbles-outline', label: 'Interaction Prompts',      desc: 'Custom conversation starters based on your styles' },
  { icon: 'heart-circle-outline',label: 'Effort Balance',           desc: 'Compare contributions from both sides' },
] as const;

function getInviteUrl(code: string): string {
  return `https://lovepath.app/invite/${code}`;
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

export default function PartnerInviteScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getById(userId),
  });

  const inviteQuery = useQuery({
    queryKey: ['partnerInvites', userId],
    queryFn: () => apiFetch<PartnerInvite[]>(`${API.partnerInvites}?userId=${userId}`),
  });

  const createInvite = useMutation({
    mutationFn: () => {
      const code = Math.random().toString(36).slice(2, 10).toUpperCase();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return apiFetch<PartnerInvite>(API.partnerInvites, {
        method: 'POST',
        body: JSON.stringify({ userId, code, expiresAt, accepted: false }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerInvites', userId] }),
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      apiFetch(`${API.users}/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ partnerId: null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  if (userQuery.isLoading || inviteQuery.isLoading) return <LoadingScreen />;

  const user = userQuery.data;
  const isConnected = user?.partnerId != null;

  const activeInvite = inviteQuery.data?.find(
    (i) => !i.accepted && !isExpired(i.expiresAt),
  );

  async function handleCopyLink(): Promise<void> {
    if (!activeInvite) return;
    await Clipboard.setStringAsync(getInviteUrl(activeInvite.code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare(): Promise<void> {
    if (!activeInvite) return;
    const url = getInviteUrl(activeInvite.code);
    await Share.share({
      message: `Join me on LovePath — understand love and build it together.\n\n${url}`,
      url,
    });
  }

  function handleDisconnect(): void {
    Alert.alert(
      'Disconnect partner?',
      'Partner comparison features will be unavailable until you reconnect. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => disconnectMutation.mutate() },
      ],
    );
  }

  async function handleGetOrCreateInvite(): Promise<void> {
    if (!activeInvite) {
      await createInvite.mutateAsync();
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
        <Text style={styles.title}>Invite Your Partner</Text>
        <Text style={styles.subtitle}>
          Connect profiles to unlock side-by-side insights and shared features.
        </Text>

        {isConnected ? (
          <View style={styles.connectedBlock}>
            <View style={styles.heartCircleLg}>
              <Ionicons name="heart" size={36} color={colors.primary} />
            </View>
            <Text style={styles.connectedTitle}>Connected!</Text>
            <Text style={styles.connectedBody}>
              You and your partner are linked. All shared features are active.
            </Text>
            <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect}>
              <Text style={styles.disconnectText}>Disconnect partner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.heroBlock}>
              <View style={styles.heartCircle}>
                <Ionicons name="heart" size={44} color={colors.primary} />
              </View>
            </View>

            <View style={styles.featureList}>
              <Text style={styles.featureTitle}>Build this together</Text>
              <Text style={styles.featureDesc}>
                When both partners complete the Love Language quiz, we can unlock personalised insights for your unique dynamic.
              </Text>
              {FEATURES.map((f) => (
                <View key={f.label} style={styles.featureRow}>
                  <View style={styles.featureIconCircle}>
                    <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={16} color={colors.primary} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                    <Text style={styles.featureSubtitle}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {activeInvite && (
              <View style={styles.inviteCard}>
                <Text style={styles.inviteCardLabel}>Invite link (expires in 7 days)</Text>
                <Text style={styles.inviteUrl} numberOfLines={1}>
                  {getInviteUrl(activeInvite.code)}
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {!isConnected && (
        <View style={styles.ctaBlock}>
          {!activeInvite ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleGetOrCreateInvite}
              disabled={createInvite.isPending}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Generate invite link</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyLink} activeOpacity={0.85}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={colors.white}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryBtnText}>{copied ? 'Copied!' : 'Copy invite link'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                <Ionicons name="share-social-outline" size={18} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Send via WhatsApp / SMS</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  spacer: { width: 24 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 24 },
  connectedBlock: { alignItems: 'center', paddingVertical: 32 },
  heartCircleLg: { width: 80, height: 80, borderRadius: radii.full, backgroundColor: colors.roseTint, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  connectedTitle: { fontSize: fontSizes.xl, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 4 },
  connectedBody: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, textAlign: 'center', paddingHorizontal: 32, marginBottom: 32 },
  disconnectBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingVertical: 12, paddingHorizontal: 24 },
  disconnectText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted },
  heroBlock: { alignItems: 'center', paddingVertical: 32 },
  heartCircle: { width: 96, height: 96, borderRadius: radii.full, backgroundColor: colors.roseTint, alignItems: 'center', justifyContent: 'center' },
  featureList: { marginBottom: 24 },
  featureTitle: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 16 },
  featureDesc: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  featureIconCircle: { width: 32, height: 32, borderRadius: radii.full, backgroundColor: colors.roseTint, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  flex1: { flex: 1 },
  featureLabel: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.foreground },
  featureSubtitle: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  inviteCard: { backgroundColor: colors.card, borderRadius: radii.xl2, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  inviteCardLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 4 },
  inviteUrl: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.foreground },
  ctaBlock: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  primaryBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  copyBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  shareBtn: { width: '100%', backgroundColor: colors.secondary, borderRadius: radii.button, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
