import { create } from 'zustand';
import { LanguageKey, LanguageScores } from '../types';

interface QuizState {
  result: { primary: LanguageKey; secondary: LanguageKey; scores: LanguageScores } | null;
  setResult: (r: { primary: LanguageKey; secondary: LanguageKey; scores: LanguageScores }) => void;
  clearResult: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  result: null,
  setResult: (r) => set({ result: r }),
  clearResult: () => set({ result: null }),
}));
