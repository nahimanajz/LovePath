import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface CheckItemProps {
  text: string;
}

function CheckItem({ text }: CheckItemProps): JSX.Element {
  return (
    <View className="flex-row items-start mb-3">
      <Ionicons
        name="checkmark-circle"
        size={18}
        color="#C0556A"
        style={{ marginRight: 10, marginTop: 2 }}
      />
      <Text className="flex-1 text-sm font-body text-foreground">{text}</Text>
    </View>
  );
}

export default function QuizIntroScreen(): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header with logo */}
      <View className="flex-row items-center justify-center px-5 pt-4 pb-2">
        <Text className="text-sm font-heading text-primary">LovePath</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero title */}
        <View className="mt-8 mb-6">
          <Text className="text-3xl font-heading text-foreground text-center leading-10">
            How do you{'\n'}
            <Text className="italic">truly</Text> feel loved?
          </Text>
        </View>

        {/* Body text */}
        <Text className="text-sm font-body text-muted text-center leading-5 mb-8 px-2">
          Based on Gary Chapman's revolutionary framework, discovering your Love
          Language helps you build deeper, more meaningful connections.
        </Text>

        {/* 5 language icons row */}
        <View className="flex-row justify-center items-center gap-3 mb-8">
          <View className="w-10 h-10 rounded-full bg-rose-tint items-center justify-center">
            <Ionicons name="chatbubble-outline" size={18} color="#C0556A" />
          </View>
          <View className="w-10 h-10 rounded-full bg-rose-tint items-center justify-center">
            <Ionicons name="hand-left-outline" size={18} color="#C0556A" />
          </View>
          <View className="w-10 h-10 rounded-full bg-rose-tint items-center justify-center">
            <Ionicons name="heart-outline" size={18} color="#C0556A" />
          </View>
          <View className="w-10 h-10 rounded-full bg-rose-tint items-center justify-center">
            <Ionicons name="gift-outline" size={18} color="#C0556A" />
          </View>
          <View className="w-10 h-10 rounded-full bg-rose-tint items-center justify-center">
            <Ionicons name="time-outline" size={18} color="#C0556A" />
          </View>
        </View>

        {/* The 5 Languages section */}
        <View className="bg-card rounded-2xl p-4 mb-6">
          <Text className="text-base font-heading text-foreground mb-2">
            The 5 Languages
          </Text>
          <Text className="text-sm font-body text-muted leading-5">
            Everyone gives and receives love differently. Words of Affirmation,
            Acts of Service, Receiving Gifts, Quality Time, and Physical Touch.
          </Text>
        </View>

        {/* What to expect */}
        <Text className="text-base font-heading text-foreground mb-4">
          What to expect
        </Text>

        <CheckItem text="30 questions focused on your preferences" />
        <CheckItem text="Approximately 5 minutes to complete" />
        <CheckItem text="Reveals your primary and secondary languages" />
        <CheckItem text="Invite a partner to compare and sync results" />

        <View className="h-8" />
      </ScrollView>

      {/* Footer */}
      <View className="px-5 pb-6">
        <TouchableOpacity
          className="w-full bg-primary rounded-full py-4 items-center"
          onPress={() => router.push('/love-languages/quiz')}
          activeOpacity={0.85}
        >
          <Text className="text-white text-base font-heading">Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
