import type { LanguageKey } from '@/types';

export interface QuizQuestion {
  id: number;
  optionA: { text: string; language: LanguageKey };
  optionB: { text: string; language: LanguageKey };
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    optionA: { text: 'someone expresses appreciation for the things I do', language: 'AS' },
    optionB: { text: 'someone touches me affectionately', language: 'PT' },
  },
  {
    id: 2,
    optionA: { text: 'alone with my partner, undivided attention', language: 'QT' },
    optionB: { text: 'someone gives me a gift', language: 'RG' },
  },
  {
    id: 3,
    optionA: { text: 'someone helps me with a task', language: 'AS' },
    optionB: { text: 'someone touches me', language: 'PT' },
  },
  {
    id: 4,
    optionA: { text: 'someone gives me a special gift', language: 'RG' },
    optionB: { text: 'someone affirms how much they appreciate me', language: 'WA' },
  },
  {
    id: 5,
    optionA: { text: 'my partner and I sit close together', language: 'PT' },
    optionB: { text: 'someone tells me how much they love me', language: 'WA' },
  },
  {
    id: 6,
    optionA: { text: 'my partner wants to go out somewhere, just the two of us', language: 'QT' },
    optionB: { text: 'my partner helps me with something', language: 'AS' },
  },
  {
    id: 7,
    optionA: { text: "my partner holds my hand while we're in public", language: 'PT' },
    optionB: { text: 'my partner gives me a gift', language: 'RG' },
  },
  {
    id: 8,
    optionA: { text: 'my partner speaks kind, encouraging words to me', language: 'WA' },
    optionB: { text: 'my partner takes time to be with me', language: 'QT' },
  },
  {
    id: 9,
    optionA: { text: 'someone buys me a gift', language: 'RG' },
    optionB: { text: 'my partner touches me', language: 'PT' },
  },
  {
    id: 10,
    optionA: { text: 'a partner helps me when I need it', language: 'AS' },
    optionB: { text: 'my partner says I love you', language: 'WA' },
  },
  {
    id: 11,
    optionA: { text: 'someone expresses how happy they are to be with me', language: 'WA' },
    optionB: { text: 'I receive a gift from someone', language: 'RG' },
  },
  {
    id: 12,
    optionA: { text: 'my partner puts their arm around me when with others', language: 'PT' },
    optionB: { text: 'my partner does something for me', language: 'AS' },
  },
  {
    id: 13,
    optionA: { text: 'I receive a heartfelt gift', language: 'RG' },
    optionB: { text: 'I sit close to my partner', language: 'PT' },
  },
  {
    id: 14,
    optionA: { text: 'my partner tells me how much I mean to them', language: 'WA' },
    optionB: { text: 'my partner helps with a household chore', language: 'AS' },
  },
  {
    id: 15,
    optionA: { text: 'my partner and I have meaningful conversations', language: 'QT' },
    optionB: { text: 'my partner gives me something special', language: 'RG' },
  },
  {
    id: 16,
    optionA: { text: 'my partner runs errands or does tasks I need done', language: 'AS' },
    optionB: { text: 'my partner touches me or holds my hand', language: 'PT' },
  },
  {
    id: 17,
    optionA: { text: 'my partner compliments my appearance', language: 'WA' },
    optionB: { text: 'my partner and I spend time alone together', language: 'QT' },
  },
  {
    id: 18,
    optionA: { text: 'my partner greets me with a hug', language: 'PT' },
    optionB: { text: 'my partner does something meaningful for me', language: 'AS' },
  },
  {
    id: 19,
    optionA: { text: 'my partner takes time just for me', language: 'QT' },
    optionB: { text: 'my partner tells me what they like about me', language: 'WA' },
  },
  {
    id: 20,
    optionA: { text: 'my partner helps me with a chore without being asked', language: 'AS' },
    optionB: { text: 'my partner gives me a thoughtful gift', language: 'RG' },
  },
  {
    id: 21,
    optionA: { text: 'my partner holds me', language: 'PT' },
    optionB: { text: 'my partner encourages me by words', language: 'WA' },
  },
  {
    id: 22,
    optionA: { text: 'my partner gives me a gift that shows they thought of me', language: 'RG' },
    optionB: { text: 'my partner helps me with a specific task', language: 'AS' },
  },
  {
    id: 23,
    optionA: { text: 'my partner spends quality time with me', language: 'QT' },
    optionB: { text: 'my partner pats me on the back', language: 'PT' },
  },
  {
    id: 24,
    optionA: { text: 'my partner completes tasks I ask them to do', language: 'AS' },
    optionB: { text: 'spending a whole day with my partner', language: 'QT' },
  },
  {
    id: 25,
    optionA: { text: 'my partner gives me a hug', language: 'PT' },
    optionB: { text: 'my partner gives me a birthday gift', language: 'RG' },
  },
  {
    id: 26,
    optionA: { text: "my partner expresses interest in what I'm feeling", language: 'QT' },
    optionB: { text: 'a gift from my partner shows thought', language: 'RG' },
  },
  {
    id: 27,
    optionA: { text: 'I can hear my partner speak positively about me', language: 'WA' },
    optionB: { text: 'my partner and I have planned dates', language: 'QT' },
  },
  {
    id: 28,
    optionA: { text: 'my partner gives me a gift after being away', language: 'RG' },
    optionB: { text: 'my partner touches me spontaneously', language: 'PT' },
  },
  {
    id: 29,
    optionA: { text: 'my partner helps plan an activity', language: 'QT' },
    optionB: { text: 'my partner tells me how much I matter', language: 'WA' },
  },
  {
    id: 30,
    optionA: { text: 'my partner pays attention and listens deeply', language: 'QT' },
    optionB: { text: 'my partner and I hug when reuniting', language: 'PT' },
  },
];

export function computeLanguageScores(
  answers: Record<number, 'A' | 'B'>,
): Record<LanguageKey, number> {
  const scores: Record<LanguageKey, number> = { WA: 0, QT: 0, RG: 0, AS: 0, PT: 0 };

  for (const [idStr, choice] of Object.entries(answers)) {
    const id = Number(idStr);
    const question = QUIZ_QUESTIONS.find((q) => q.id === id);
    if (!question) continue;
    const selected = choice === 'A' ? question.optionA : question.optionB;
    scores[selected.language] += 1;
  }

  return scores;
}
