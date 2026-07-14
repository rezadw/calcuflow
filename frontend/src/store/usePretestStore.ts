import { create } from 'zustand';

export type TopicScores = {
  Limit: number;
  Turunan: number;
  Integral: number;
  Aljabar: number;
  Trigonometri: number;
  Fungsi: number;
};

interface PretestState {
  scores: TopicScores | null;
  setScores: (scores: TopicScores) => void;
  resetScores: () => void;
}

export const usePretestStore = create<PretestState>((set) => ({
  scores: null,
  setScores: (scores) => set({ scores }),
  resetScores: () => set({ scores: null }),
}));
