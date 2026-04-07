import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSessionStore } from '../../src/store/session';

type SituationType = 'relationship_building' | 'early_dating' | 'recovering' | 'starting_over';

interface SituationOption {
  value: SituationType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SITUATIONS: SituationOption[] = [
  {
    value: 'relationship_building',
    label: 'In a relationship, building something real',
    icon: 'construct-outline',
  },
  {
    value: 'early_dating',
    label: 'Dating someone, figuring things out early',
    icon: 'heart-circle-outline',
  },
  {
    value: 'recovering',
    label: 'Recovering from betrayal or hurt',
    icon: 'refresh-outline',
  },
  {
    value: 'starting_over',
    label: 'Starting over, want to understand love better',
    icon: 'sunny-outline',
  },
];

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

export default function YourSituationScreen(): JSX.Element {
  const [selected, setSelected] = useState<SituationType | null>(null);
  const setSituation = useSessionStore((s) => s.setSituation);

  function handleContinue(): void {
    if (!selected) return;
    setSituation(selected);
    router.push('/(auth)/login');
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <ProgressDots total={3} active={1} />
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="mt-6 mb-8">
          <Text className="text-2xl font-heading text-foreground mb-2">
            What describes you best?
          </Text>
          <Text className="text-sm font-body text-muted">
            We'll tailor your experience.
          </Text>
        </View>

        {/* Situation cards */}
        {SITUATIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              className={`flex-row items-center rounded-2xl p-4 mb-3 border ${
                isSelected
                  ? 'border-primary bg-rose-tint border-2'
                  : 'border-border bg-card border'
              }`}
              onPress={() => setSelected(option.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={isSelected ? '#C0556A' : '#888780'}
                style={{ marginRight: 12 }}
              />
              <Text
                className={`flex-1 text-sm font-body ${
                  isSelected ? 'text-foreground' : 'text-foreground'
                }`}
              >
                {option.label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color="#C0556A" />
              )}
            </TouchableOpacity>
          );
        })}

        <View className="h-8" />
      </ScrollView>

      {/* Footer */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          className={`w-full rounded-full py-4 items-center ${
            selected ? 'bg-primary' : 'bg-hint'
          }`}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
