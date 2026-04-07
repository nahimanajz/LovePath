import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface FrameworkCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  title: string;
  subtitle: string;
  source: string;
}

function FrameworkCard({
  icon,
  iconColor,
  bgColor,
  title,
  subtitle,
  source,
}: FrameworkCardProps): JSX.Element {
  return (
    <View
      className="flex-row items-center rounded-2xl p-4 mb-3"
      style={{ backgroundColor: bgColor }}
    >
      <View className="w-10 h-10 rounded-full bg-white/40 items-center justify-center mr-3">
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-heading text-foreground">{title}</Text>
        <Text className="text-xs font-body text-muted">{subtitle}</Text>
      </View>
      <Text className="text-[10px] font-body text-muted italic">{source}</Text>
    </View>
  );
}

interface ProgressDotsProps {
  total: number;
  active: number;
}

function ProgressDots({ total, active }: ProgressDotsProps): JSX.Element {
  return (
    <View className="flex-row items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className="h-2 rounded-full"
          style={{
            width: i === active ? 20 : 8,
            backgroundColor: i === active ? '#C0556A' : '#E8E6E0',
          }}
        />
      ))}
    </View>
  );
}

export default function HowItWorksScreen(): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <ProgressDots total={3} active={0} />
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="mt-6 mb-8">
          <Text className="text-2xl font-heading text-foreground mb-2">
            How LovePath works
          </Text>
          <Text className="text-sm font-body text-muted">
            Three proven frameworks. One clear picture.
          </Text>
        </View>

        {/* Framework cards */}
        <FrameworkCard
          icon="trending-up"
          iconColor="#C0556A"
          bgColor="#FDE8EC"
          title="LovePath stages"
          subtitle="Track your journey's growth"
          source="Joe Beam"
        />
        <FrameworkCard
          icon="person"
          iconColor="#7F77DD"
          bgColor="#EEEDFE"
          title="Stoic obstacle guide"
          subtitle="Navigate conflict with calm"
          source="Ryan Holiday"
        />
        <FrameworkCard
          icon="heart"
          iconColor="#268947"
          bgColor="#E1F5EE"
          title="5 Love Languages"
          subtitle="Speak their heart's dialect"
          source="Gary Chapman"
        />

        <View className="h-8" />
      </ScrollView>

      {/* Footer */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          className="w-full bg-primary rounded-full py-4 items-center mb-3"
          onPress={() => router.push('/(onboarding)/your-situation')}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading">Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center py-2"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-sm font-body text-muted">Skip intro</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
