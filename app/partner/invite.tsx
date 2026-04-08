import { useState } from 'react';
import { View, Text, TouchableOpacity, Share, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { usersService } from '../../src/services/users';
import { apiFetch, API } from '../../src/config/api';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import type { PartnerInvite } from '../../src/types';

const FEATURES = [
  { icon: 'git-compare-outline', label: 'Side-by-side comparison', desc: 'See your Love Languages next to your partner\'s' },
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
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text className="text-2xl font-heading text-foreground mt-4 mb-1">Invite Your Partner</Text>
        <Text className="text-sm font-body text-muted mb-6">
          Connect profiles to unlock side-by-side insights and shared features.
        </Text>

        {isConnected ? (
          /* Already connected state */
          <View className="items-center py-8">
            <View className="w-20 h-20 rounded-full bg-rose-tint items-center justify-center mb-4">
              <Ionicons name="heart" size={36} color="#C0556A" />
            </View>
            <Text className="text-xl font-heading text-foreground mb-1">Connected!</Text>
            <Text className="text-sm font-body text-muted text-center px-8 mb-8">
              You and your partner are linked. All shared features are active.
            </Text>
            <TouchableOpacity
              className="border border-border rounded-full py-3 px-6"
              onPress={handleDisconnect}
            >
              <Text className="text-sm font-body text-muted">Disconnect partner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Heart illustration */}
            <View className="items-center py-8">
              <View className="w-24 h-24 rounded-full bg-rose-tint items-center justify-center">
                <Ionicons name="heart" size={44} color="#C0556A" />
              </View>
            </View>

            {/* Features list */}
            <View className="mb-6">
              <Text className="text-base font-heading text-foreground mb-4">Build this together</Text>
              <Text className="text-sm font-body text-muted mb-4">
                When both partners complete the Love Language quiz, we can unlock personalised insights for your unique dynamic.
              </Text>
              {FEATURES.map((f) => (
                <View key={f.label} className="flex-row items-start mb-3">
                  <View className="w-8 h-8 rounded-full bg-rose-tint items-center justify-center mr-3 mt-0.5">
                    <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={16} color="#C0556A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-heading text-foreground">{f.label}</Text>
                    <Text className="text-xs font-body text-muted">{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Invite code / expiry */}
            {activeInvite && (
              <View className="bg-card rounded-2xl p-4 mb-4 border border-border">
                <Text className="text-xs font-body text-muted mb-1">Invite link (expires in 7 days)</Text>
                <Text className="text-sm font-heading text-foreground" numberOfLines={1}>
                  {getInviteUrl(activeInvite.code)}
                </Text>
              </View>
            )}
          </>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* CTAs */}
      {!isConnected && (
        <View className="px-5 pb-6 gap-3">
          {!activeInvite ? (
            <TouchableOpacity
              className="w-full bg-primary rounded-full py-4 items-center"
              onPress={handleGetOrCreateInvite}
              disabled={createInvite.isPending}
              activeOpacity={0.85}
            >
              <Text className="text-white text-base font-heading">Generate invite link</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                className="w-full bg-primary rounded-full py-4 flex-row items-center justify-center"
                onPress={handleCopyLink}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-base font-heading">
                  {copied ? 'Copied!' : 'Copy invite link'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full rounded-full py-4 flex-row items-center justify-center"
                style={{ backgroundColor: '#7F77DD' }}
                onPress={handleShare}
                activeOpacity={0.85}
              >
                <Ionicons name="share-social-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text className="text-white text-base font-heading">Send via WhatsApp / SMS</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
