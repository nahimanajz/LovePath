import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { trustService } from '../../src/services/trustCircle';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import type { TrustPerson, TrustStatus } from '../../src/types';

const DEFAULTS: Omit<TrustPerson, 'id' | 'userId'>[] = [
  { name: 'Partner',       role: 'Romantic partner', yourInvestment: 3, theirInvestment: 3 },
  { name: 'Close Friend',  role: 'Friend',            yourInvestment: 3, theirInvestment: 3 },
  { name: 'Mentor',        role: 'Advisor/Mentor',    yourInvestment: 3, theirInvestment: 3 },
];

const STATUS_ORDER: TrustStatus[] = ['Mutual', 'Watch', 'One-sided'];

const STATUS_STYLES: Record<TrustStatus, { bg: string; text: string; border: string }> = {
  Mutual:      { bg: '#E1F5EE', text: '#268947', border: '#268947' },
  Watch:       { bg: '#FAEEDA', text: '#EF9F27', border: '#EF9F27' },
  'One-sided': { bg: '#FDEAE8', text: '#E24B4A', border: '#E24B4A' },
};

function getStatus(yours: number, theirs: number): TrustStatus {
  const diff = yours - theirs;
  if (diff >= 2) return 'One-sided';
  if (diff >= 1) return 'Watch';
  return 'Mutual';
}

interface DotRatingProps {
  value: number;
  onChange: (v: number) => void;
  color: string;
}

function DotRating({ value, onChange, color }: DotRatingProps): JSX.Element {
  return (
    <View className="flex-row gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onChange(i + 1)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <View
            className="w-5 h-5 rounded-full border-2"
            style={{
              backgroundColor: i < value ? color : 'transparent',
              borderColor: i < value ? color : '#D4D2CC',
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function TrustCircleScreen(): JSX.Element {
  const userId = useSessionStore((s) => s.userId) ?? 1;
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['trustCircle', userId],
    queryFn: () => trustService.getByUser(userId),
  });

  const createMutation = useMutation({
    mutationFn: (p: Omit<TrustPerson, 'id'>) => trustService.create(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trustCircle', userId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }: { id: number; data: Partial<TrustPerson> }) =>
      trustService.update(id, d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trustCircle', userId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trustService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trustCircle', userId] }),
  });

  if (isLoading) return <LoadingScreen />;

  const people = data ?? [];

  // Seed defaults if empty
  if (people.length === 0 && !isLoading && !createMutation.isPending) {
    DEFAULTS.forEach((d) => createMutation.mutate({ ...d, userId }));
  }

  const sorted = [...people].sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(getStatus(a.yourInvestment, a.theirInvestment));
    const sb = STATUS_ORDER.indexOf(getStatus(b.yourInvestment, b.theirInvestment));
    return sa - sb;
  });

  const onesided = sorted.filter(
    (p) => getStatus(p.yourInvestment, p.theirInvestment) === 'One-sided',
  );

  function handleLongPress(person: TrustPerson): void {
    Alert.alert(
      `Remove ${person.name}?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteMutation.mutate(person.id) },
      ],
    );
  }

  function handleAddPerson(): void {
    if (!newName.trim()) return;
    createMutation.mutate({
      userId,
      name: newName.trim(),
      role: newRole.trim() || 'Friend',
      yourInvestment: 3,
      theirInvestment: 3,
    });
    setNewName('');
    setNewRole('');
    setShowAdd(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-sm font-heading text-primary">LovePath</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="person-add-outline" size={22} color="#C0556A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-heading text-foreground mt-4 mb-1">Your circle</Text>
        <Text className="text-sm font-body text-muted mb-5">
          Rate investment on both sides. One-sided patterns are early warning signs.
        </Text>

        {/* One-sided alert cards */}
        {onesided.map((p) => (
          <View key={`alert-${p.id}`} className="bg-rose-tint rounded-2xl p-4 mb-3 flex-row items-start">
            <Ionicons name="warning" size={16} color="#C0556A" style={{ marginRight: 8, marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-sm font-heading text-primary mb-0.5">One-sided with {p.name}</Text>
              <Text className="text-xs font-body text-foreground">
                You are investing significantly more. Consider whether this is sustainable.
              </Text>
            </View>
          </View>
        ))}

        {/* People cards */}
        {sorted.map((person) => {
          const st = getStatus(person.yourInvestment, person.theirInvestment);
          const stStyle = STATUS_STYLES[st];
          return (
            <TouchableOpacity
              key={person.id}
              onLongPress={() => handleLongPress(person)}
              activeOpacity={0.85}
              className="bg-card rounded-2xl p-4 mb-3 border border-border"
            >
              <View className="flex-row items-start justify-between mb-3">
                <View>
                  <Text className="text-base font-heading text-foreground">{person.name}</Text>
                  <Text className="text-xs font-body text-muted">{person.role}</Text>
                </View>
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: stStyle.bg, borderWidth: 1, borderColor: stStyle.border }}
                >
                  <Text className="text-xs font-heading" style={{ color: stStyle.text }}>{st}</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-body text-muted w-16">You</Text>
                <DotRating
                  value={person.yourInvestment}
                  onChange={(v) => updateMutation.mutate({ id: person.id, data: { yourInvestment: v } })}
                  color="#C0556A"
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-body text-muted w-16">Them</Text>
                <DotRating
                  value={person.theirInvestment}
                  onChange={(v) => updateMutation.mutate({ id: person.id, data: { theirInvestment: v } })}
                  color="#7F77DD"
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <View className="h-4" />
      </ScrollView>

      {/* Add button */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          className="w-full border border-primary rounded-full py-4 flex-row items-center justify-center"
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#C0556A" style={{ marginRight: 6 }} />
          <Text className="text-primary text-base font-heading">Add person</Text>
        </TouchableOpacity>
      </View>

      {/* Add person modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setShowAdd(false)}
        />
        <View className="bg-background rounded-t-3xl px-5 pt-6 pb-10">
          <Text className="text-lg font-heading text-foreground mb-5">Add to your circle</Text>

          <Text className="text-xs font-body text-muted mb-1">Name</Text>
          <TextInput
            className="bg-card border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground mb-4"
            placeholder="e.g. Alex"
            placeholderTextColor="#B4B2A9"
            value={newName}
            onChangeText={setNewName}
          />

          <Text className="text-xs font-body text-muted mb-1">Role</Text>
          <TextInput
            className="bg-card border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground mb-6"
            placeholder="e.g. Close Friend"
            placeholderTextColor="#B4B2A9"
            value={newRole}
            onChangeText={setNewRole}
          />

          <TouchableOpacity
            className="w-full bg-primary rounded-full py-4 items-center"
            onPress={handleAddPerson}
            activeOpacity={0.85}
          >
            <Text className="text-white text-base font-heading">Add</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
