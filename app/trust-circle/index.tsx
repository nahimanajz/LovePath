import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { trustService } from '../../src/services/trustCircle';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';
import type { TrustPerson, TrustStatus } from '../../src/types';

const DEFAULTS: Omit<TrustPerson, 'id' | 'userId'>[] = [
  { name: 'Partner',      role: 'Romantic partner',  yourInvestment: 3, theirInvestment: 3 },
  { name: 'Close Friend', role: 'Friend',             yourInvestment: 3, theirInvestment: 3 },
  { name: 'Mentor',       role: 'Advisor/Mentor',     yourInvestment: 3, theirInvestment: 3 },
];

const STATUS_ORDER: TrustStatus[] = ['Mutual', 'Watch', 'One-sided'];

const STATUS_COLORS: Record<TrustStatus, { bg: string; text: string; border: string }> = {
  Mutual:      { bg: colors.tealTint,  text: '#268947',      border: '#268947' },
  Watch:       { bg: colors.amberTint, text: colors.amber,   border: colors.amber },
  'One-sided': { bg: '#FDEAE8',        text: colors.danger,  border: colors.danger },
};

function getStatus(yours: number, theirs: number): TrustStatus {
  const diff = yours - theirs;
  if (diff >= 2) return 'One-sided';
  if (diff >= 1) return 'Watch';
  return 'Mutual';
}

function DotRating({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }): JSX.Element {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i + 1)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <View style={[styles.dot, { backgroundColor: i < value ? color : 'transparent', borderColor: i < value ? color : '#D4D2CC' }]} />
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

  const { data, isLoading } = useQuery({ queryKey: ['trustCircle', userId], queryFn: () => trustService.getByUser(userId) });

  const createMutation = useMutation({ mutationFn: (p: Omit<TrustPerson, 'id'>) => trustService.create(p), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trustCircle', userId] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data: d }: { id: number; data: Partial<TrustPerson> }) => trustService.update(id, d), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trustCircle', userId] }) });
  const deleteMutation = useMutation({ mutationFn: (id: number) => trustService.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trustCircle', userId] }) });

  if (isLoading) return <LoadingScreen />;

  const people = data ?? [];
  if (people.length === 0 && !isLoading && !createMutation.isPending) {
    DEFAULTS.forEach((d) => createMutation.mutate({ ...d, userId }));
  }

  const sorted = [...people].sort((a, b) => {
    const sa = STATUS_ORDER.indexOf(getStatus(a.yourInvestment, a.theirInvestment));
    const sb = STATUS_ORDER.indexOf(getStatus(b.yourInvestment, b.theirInvestment));
    return sa - sb;
  });

  const onesided = sorted.filter((p) => getStatus(p.yourInvestment, p.theirInvestment) === 'One-sided');

  function handleLongPress(person: TrustPerson): void {
    Alert.alert(`Remove ${person.name}?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteMutation.mutate(person.id) },
    ]);
  }

  function handleAddPerson(): void {
    if (!newName.trim()) return;
    createMutation.mutate({ userId, name: newName.trim(), role: newRole.trim() || 'Friend', yourInvestment: 3, theirInvestment: 3 });
    setNewName(''); setNewRole(''); setShowAdd(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LovePath</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="person-add-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your circle</Text>
        <Text style={styles.subtitle}>Rate investment on both sides. One-sided patterns are early warning signs.</Text>

        {onesided.map((p) => (
          <View key={`alert-${p.id}`} style={styles.alertCard}>
            <Ionicons name="warning" size={16} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
            <View style={styles.flex1}>
              <Text style={styles.alertTitle}>One-sided with {p.name}</Text>
              <Text style={styles.alertBody}>You are investing significantly more. Consider whether this is sustainable.</Text>
            </View>
          </View>
        ))}

        {sorted.map((person) => {
          const st = getStatus(person.yourInvestment, person.theirInvestment);
          const stStyle = STATUS_COLORS[st];
          return (
            <TouchableOpacity key={person.id} onLongPress={() => handleLongPress(person)} activeOpacity={0.85} style={styles.personCard}>
              <View style={styles.personHeader}>
                <View>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personRole}>{person.role}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: stStyle.bg, borderColor: stStyle.border }]}>
                  <Text style={[styles.statusText, { color: stStyle.text }]}>{st}</Text>
                </View>
              </View>

              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>You</Text>
                <DotRating value={person.yourInvestment} onChange={(v) => updateMutation.mutate({ id: person.id, data: { yourInvestment: v } })} color={colors.primary} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Them</Text>
                <DotRating value={person.theirInvestment} onChange={(v) => updateMutation.mutate({ id: person.id, data: { theirInvestment: v } })} color={colors.secondary} />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.addBtnText}>Add person</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowAdd(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Add to your circle</Text>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Alex" placeholderTextColor={colors.hint} value={newName} onChangeText={setNewName} />
          <Text style={styles.fieldLabel}>Role</Text>
          <TextInput style={[styles.input, styles.inputMb]} placeholder="e.g. Close Friend" placeholderTextColor={colors.hint} value={newRole} onChangeText={setNewRole} />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddPerson} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary },
  scroll: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginTop: 16, marginBottom: 4 },
  subtitle: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 20 },
  alertCard: { backgroundColor: colors.roseTint, borderRadius: radii.xl2, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start' },
  flex1: { flex: 1 },
  alertTitle: { fontSize: fontSizes.sm, fontFamily: fonts.heading, color: colors.primary, marginBottom: 2 },
  alertBody: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.foreground },
  personCard: { backgroundColor: colors.card, borderRadius: radii.xl2, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  personHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  personName: { fontSize: fontSizes.base, fontFamily: fonts.heading, color: colors.foreground },
  personRole: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.full, borderWidth: 1 },
  statusText: { fontSize: fontSizes.caption, fontFamily: fonts.heading },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  ratingLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, width: 64 },
  dotRow: { flexDirection: 'row', gap: 4 },
  dot: { width: 20, height: 20, borderRadius: radii.full, borderWidth: 2 },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  addBtn: { width: '100%', borderWidth: 1, borderColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: colors.primary, fontSize: fontSizes.base, fontFamily: fonts.heading },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radii.xl3, borderTopRightRadius: radii.xl3, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: fontSizes.lg, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 20 },
  fieldLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 4 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radii.xl, paddingHorizontal: 16, paddingVertical: 12, fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground, marginBottom: 16 },
  inputMb: { marginBottom: 24 },
  primaryBtn: { width: '100%', backgroundColor: colors.primary, borderRadius: radii.button, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
});
