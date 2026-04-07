import { create } from 'zustand';

type SituationType = 'relationship_building' | 'early_dating' | 'recovering' | 'starting_over';

interface SessionState {
  userId: number | null;
  situation: SituationType | null;
  setUserId: (id: number) => void;
  setSituation: (s: SituationType) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: 1, // default to user 1 for dev
  situation: null,
  setUserId: (id) => set({ userId: id }),
  setSituation: (s) => set({ situation: s }),
  clearSession: () => set({ userId: null, situation: null }),
}));
