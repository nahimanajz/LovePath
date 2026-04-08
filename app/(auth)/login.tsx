import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';
import { colors, fonts, fontSizes, radii } from '../../src/styles/theme';

type AuthTab = 'login' | 'signup';

interface FieldError {
  email?: string;
  password?: string;
  name?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen(): JSX.Element {
  const [activeTab, setActiveTab] = useState<AuthTab>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  const setUserId = useSessionStore((s) => s.setUserId);

  function validate(): boolean {
    const next: FieldError = {};
    if (activeTab === 'signup' && !name.trim()) next.name = 'Name is required';
    if (!validateEmail(email)) next.email = 'Enter a valid email address';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!validate()) return;
    setLoading(true);
    try {
      setUserId(1);
      if (activeTab === 'signup') {
        router.replace('/love-languages/intro');
      } else {
        router.replace('/(tabs)/');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.backBtn}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.brand}>LovePath</Text>
            <Text style={styles.tagline}>
              {activeTab === 'signup' ? 'Create your account to get started' : 'Welcome back'}
            </Text>

            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
                onPress={() => { setActiveTab('signup'); setErrors({}); }}
              >
                <Text style={[styles.tabText, activeTab === 'signup' ? styles.tabTextActive : styles.tabTextInactive]}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.tabActive]}
                onPress={() => { setActiveTab('login'); setErrors({}); }}
              >
                <Text style={[styles.tabText, activeTab === 'login' ? styles.tabTextActive : styles.tabTextInactive]}>Log In</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'signup' && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.hint}
                  value={name}
                  onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
                  autoCapitalize="words"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.hint}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.fieldGroupLg}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.hint}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : (
                <Text style={styles.hintText}>Minimum 8 characters</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: loading ? colors.hint : colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>
                {loading ? 'Please wait…' : activeTab === 'signup' ? 'Create Account' : 'Log In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={18} color={colors.foreground} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={18} color={colors.foreground} />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex1: { flex: 1 },
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  brand: { fontSize: fontSizes.xl2, fontFamily: fonts.heading, color: colors.foreground, marginBottom: 4 },
  tagline: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.muted, marginBottom: 32 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F1EE',
    borderRadius: radii.button,
    padding: 4,
    marginBottom: 32,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radii.button, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: fontSizes.sm },
  tabTextActive: { color: colors.foreground, fontFamily: fonts.heading },
  tabTextInactive: { color: colors.muted, fontFamily: fonts.body },
  fieldGroup: { marginBottom: 16 },
  fieldGroupLg: { marginBottom: 32 },
  fieldLabel: { fontSize: fontSizes.caption, fontFamily: fonts.body, color: colors.muted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  passwordRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.foreground,
  },
  errorText: { fontSize: fontSizes.caption, color: colors.danger, marginTop: 4 },
  hintText: { fontSize: fontSizes.caption, color: colors.hint, marginTop: 4 },
  submitBtn: { width: '100%', borderRadius: radii.button, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  submitText: { color: colors.white, fontSize: fontSizes.base, fontFamily: fonts.heading },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { fontSize: fontSizes.caption, color: colors.muted, marginHorizontal: 12 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.button,
    paddingVertical: 12,
    backgroundColor: colors.card,
    gap: 8,
  },
  socialText: { fontSize: fontSizes.sm, fontFamily: fonts.body, color: colors.foreground },
});
