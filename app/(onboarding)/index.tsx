import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BookPillProps {
  author: string;
}

function BookPill({ author }: BookPillProps): JSX.Element {
  return (
    <View className="border border-border rounded-full px-3 py-1 mx-1">
      <Text className="text-xs text-muted font-body">{author}</Text>
    </View>
  );
}

export default function SplashScreen(): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top rose tint area */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo circle */}
        <View className="w-24 h-24 rounded-full bg-rose-tint items-center justify-center mb-6">
          <Ionicons name="chatbubble-ellipses" size={40} color="#C0556A" />
        </View>

        {/* Brand title */}
        <Text className="text-4xl font-heading text-[#2D0B1F] mb-2">
          LovePath
        </Text>

        {/* Tagline */}
        <Text className="text-base font-body text-muted text-center mb-12">
          Understand love. Build it together.
        </Text>

        {/* Book source attribution */}
        <Text className="text-[10px] font-body text-hint tracking-widest uppercase mb-3">
          Informed by the wisdom of
        </Text>
        <View className="flex-row items-center mb-12">
          <BookPill author="Joe Beam" />
          <BookPill author="Ryan Holiday" />
          <BookPill author="Gary Chapman" />
        </View>

        {/* Get Started CTA */}
        <TouchableOpacity
          className="w-full bg-primary rounded-full py-4 items-center mb-4"
          onPress={() => router.push('/(onboarding)/how-it-works')}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading">Get Started</Text>
        </TouchableOpacity>

        {/* Sign in link */}
        <View className="flex-row items-center">
          <Text className="text-sm font-body text-muted">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-sm font-body text-primary">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
