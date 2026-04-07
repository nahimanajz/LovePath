import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';

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
    if (activeTab === 'signup' && !name.trim()) {
      next.name = 'Name is required';
    }
    if (!validateEmail(email)) {
      next.email = 'Enter a valid email address';
    }
    if (password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!validate()) return;
    setLoading(true);
    try {
      // Dev: use hardcoded user 1
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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-5 pt-6">
            {/* Brand */}
            <Text className="text-2xl font-heading text-foreground mb-1">
              LovePath
            </Text>
            <Text className="text-sm font-body text-muted mb-8">
              {activeTab === 'signup'
                ? 'Create your account to get started'
                : 'Welcome back'}
            </Text>

            {/* Tab toggle */}
            <View className="flex-row bg-[#F1F1EE] rounded-full p-1 mb-8">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-full items-center ${
                  activeTab === 'signup' ? 'bg-white' : ''
                }`}
                onPress={() => { setActiveTab('signup'); setErrors({}); }}
              >
                <Text
                  className={`text-sm font-body ${
                    activeTab === 'signup' ? 'text-foreground font-heading' : 'text-muted'
                  }`}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-full items-center ${
                  activeTab === 'login' ? 'bg-white' : ''
                }`}
                onPress={() => { setActiveTab('login'); setErrors({}); }}
              >
                <Text
                  className={`text-sm font-body ${
                    activeTab === 'login' ? 'text-foreground font-heading' : 'text-muted'
                  }`}
                >
                  Log In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name field (sign up only) */}
            {activeTab === 'signup' && (
              <View className="mb-4">
                <Text className="text-xs font-body text-muted mb-1">Name</Text>
                <TextInput
                  className="border border-border rounded-[12px] px-4 py-3 text-foreground text-sm font-body bg-card"
                  placeholder="Your name"
                  placeholderTextColor="#B4B2A9"
                  value={name}
                  onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
                  autoCapitalize="words"
                />
                {errors.name && (
                  <Text className="text-xs text-danger mt-1">{errors.name}</Text>
                )}
              </View>
            )}

            {/* Email field */}
            <View className="mb-4">
              <Text className="text-xs font-body text-muted mb-1">Email</Text>
              <TextInput
                className="border border-border rounded-[12px] px-4 py-3 text-foreground text-sm font-body bg-card"
                placeholder="you@example.com"
                placeholderTextColor="#B4B2A9"
                value={email}
                onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text className="text-xs text-danger mt-1">{errors.email}</Text>
              )}
            </View>

            {/* Password field */}
            <View className="mb-8">
              <Text className="text-xs font-body text-muted mb-1">Password</Text>
              <View className="border border-border rounded-[12px] flex-row items-center bg-card px-4">
                <TextInput
                  className="flex-1 py-3 text-foreground text-sm font-body"
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#B4B2A9"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#888780"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text className="text-xs text-danger mt-1">{errors.password}</Text>
              ) : (
                <Text className="text-xs text-hint mt-1">Minimum 8 characters</Text>
              )}
            </View>

            {/* Submit button */}
            <TouchableOpacity
              className={`w-full rounded-full py-4 items-center mb-4 ${
                loading ? 'bg-hint' : 'bg-primary'
              }`}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text className="text-white text-base font-heading">
                {loading ? 'Please wait…' : activeTab === 'signup' ? 'Create Account' : 'Log In'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-xs text-muted mx-3">or continue with</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Social buttons */}
            <View className="flex-row gap-3 mb-8">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-border rounded-full py-3 bg-card gap-2">
                <Ionicons name="logo-google" size={18} color="#1A1A1A" />
                <Text className="text-sm font-body text-foreground">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-border rounded-full py-3 bg-card gap-2">
                <Ionicons name="logo-apple" size={18} color="#1A1A1A" />
                <Text className="text-sm font-body text-foreground">Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
