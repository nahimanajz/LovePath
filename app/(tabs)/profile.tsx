import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
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

const APP_VERSION: string = (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

function SettingsRow({ icon, label, onPress, color = '#1A1A1A' }: SettingsRowProps): JSX.Element {
  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-border"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 rounded-lg bg-card items-center justify-center mr-3">
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="flex-1 text-sm font-body" style={{ color }}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color="#B4B2A9" />
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

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersService.getById(userId),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { primaryLanguage: null; languageScores: null }) =>
      usersService.update(userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', userId] }),
  });

  if (isLoading) return <LoadingScreen />;

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'ME';

  const primaryLanguage = user?.primaryLanguage
    ? LANGUAGE_LABELS[user.primaryLanguage as keyof typeof LANGUAGE_LABELS]
    : null;

  function handleSignOut(): void {
    Alert.alert('Sign out?', 'You will be returned to the welcome screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          clearSession();
          clearQuiz();
          queryClient.clear();
          router.replace('/(onboarding)/');
        },
      },
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
    Alert.alert(
      'Account deleted',
      'All data has been removed.',
      [{ text: 'OK', onPress: () => { clearSession(); router.replace('/(onboarding)/'); } }],
    );
    setShowDeleteModal(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <View className="w-6" />
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View className="items-center mt-6 mb-6">
          <View className="relative mb-3">
            <View className="w-20 h-20 rounded-full bg-rose-tint items-center justify-center">
              <Text className="text-2xl font-heading text-primary">{initials}</Text>
            </View>
            <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary items-center justify-center">
              <Ionicons name="pencil" size={10} color="#FFF" />
            </View>
          </View>
          <Text className="text-xl font-heading text-foreground mb-0.5">{user?.name ?? 'You'}</Text>
          {user?.partnerId ? (
            <Text className="text-xs font-body text-muted">
              Connected with partner
            </Text>
          ) : (
            <TouchableOpacity onPress={() => router.push('/partner/invite')}>
              <Text className="text-xs font-body text-primary">Connect with partner →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Love Language insight */}
        {primaryLanguage && (
          <View className="bg-rose-tint rounded-2xl p-4 mb-5">
            <Text className="text-xs font-body text-muted mb-1 uppercase tracking-widest">
              Relationship Insight
            </Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-body text-muted">Your love language</Text>
                <Text className="text-base font-heading text-primary">{primaryLanguage}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowRetakeModal(true)}
                className="px-3 py-1.5 rounded-full border border-primary"
              >
                <Text className="text-xs font-heading text-primary">Retake quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Relationship section */}
        <Text className="text-xs font-body text-muted tracking-widest uppercase mb-2">Relationship</Text>
        <View className="bg-card rounded-2xl px-4 mb-5 border border-border">
          <SettingsRow
            icon="people-outline"
            label="Partner Details"
            onPress={() => router.push('/partner/invite')}
          />
          <SettingsRow
            icon="calendar-outline"
            label="Anniversary & Milestones"
            onPress={() => Alert.alert('Coming soon', 'Anniversary tracking is on the roadmap.')}
          />
        </View>

        {/* Data & Privacy */}
        <Text className="text-xs font-body text-muted tracking-widest uppercase mb-2">Data & Privacy</Text>
        <View className="bg-card rounded-2xl px-4 mb-5 border border-border">
          <SettingsRow
            icon="lock-closed-outline"
            label="Security Settings"
            onPress={() => Alert.alert('Security', 'Password change coming soon.')}
          />
          <SettingsRow
            icon="download-outline"
            label="Export Data"
            onPress={() => Alert.alert('Export', 'Data export will be emailed to you.')}
          />
          <SettingsRow
            icon="trash-outline"
            label="Delete Account"
            onPress={() => setShowDeleteModal(true)}
            color="#E24B4A"
          />
        </View>

        {/* About */}
        <Text className="text-xs font-body text-muted tracking-widest uppercase mb-2">About</Text>
        <View className="bg-card rounded-2xl px-4 mb-5 border border-border">
          <View className="flex-row items-center py-3 border-b border-border">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-3 ml-0.5" />
            <Text className="flex-1 text-sm font-body text-foreground">Version {APP_VERSION}</Text>
          </View>
          <SettingsRow
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => Alert.alert('Help', 'Visit lovepath.app/help for support.')}
          />
        </View>

        {/* Sign out */}
        <TouchableOpacity
          className="items-center py-4 mb-8"
          onPress={handleSignOut}
        >
          <Text className="text-sm font-heading text-primary">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Retake quiz modal */}
      <Modal visible={showRetakeModal} transparent animationType="slide" onRequestClose={() => setShowRetakeModal(false)}>
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={() => setShowRetakeModal(false)} />
        <View className="bg-background rounded-t-3xl px-5 pt-6 pb-10">
          <Text className="text-lg font-heading text-foreground mb-2">Retake the quiz?</Text>
          <Text className="text-sm font-body text-muted mb-6">
            Your current love language result will be cleared. You can retake the quiz to get an updated result.
          </Text>
          <TouchableOpacity
            className="w-full bg-primary rounded-full py-4 items-center mb-3"
            onPress={handleRetakeQuiz}
          >
            <Text className="text-white text-base font-heading">Yes, retake quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-3" onPress={() => setShowRetakeModal(false)}>
            <Text className="text-sm font-body text-muted">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Delete account modal */}
      <Modal visible={showDeleteModal} transparent animationType="slide" onRequestClose={() => setShowDeleteModal(false)}>
        <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={() => setShowDeleteModal(false)} />
        <View className="bg-background rounded-t-3xl px-5 pt-6 pb-10">
          <Text className="text-lg font-heading text-foreground mb-2">Delete account?</Text>
          <Text className="text-sm font-body text-muted mb-4">
            All your data will be permanently removed. This cannot be undone. Type DELETE to confirm.
          </Text>
          <TextInput
            className="bg-card border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground mb-5"
            placeholder="Type DELETE to confirm"
            placeholderTextColor="#B4B2A9"
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            className="w-full rounded-full py-4 items-center mb-3"
            style={{
              backgroundColor: deleteConfirmText === 'DELETE' ? '#E24B4A' : '#E8E6E0',
            }}
            onPress={handleDeleteAccount}
            disabled={deleteConfirmText !== 'DELETE'}
          >
            <Text
              className="text-base font-heading"
              style={{ color: deleteConfirmText === 'DELETE' ? '#FFF' : '#B4B2A9' }}
            >
              Delete my account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-3" onPress={() => setShowDeleteModal(false)}>
            <Text className="text-sm font-body text-muted">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
