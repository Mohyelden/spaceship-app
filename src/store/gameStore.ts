import { create } from 'zustand';
import {
  defaultProgress,
  loadProgress,
  saveProgress,
  type LevelId,
  type ProgressState,
} from '@/src/storage/progress';

type GameStore = ProgressState & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (code: string) => Promise<void>;
  markVideoSeen: (videoId: string) => Promise<void>;
  hasSeenVideo: (videoId: string) => boolean;
  completeLevel: (level: LevelId) => Promise<void>;
  addXp: (amount: number, badge?: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  progressFraction: () => number;
};

async function persist(get: () => GameStore) {
  const {
    studentCode,
    stars,
    unlocked,
    completed,
    videosSeen,
    xp,
    badges,
  } = get();
  await saveProgress({
    studentCode,
    stars,
    unlocked,
    completed,
    videosSeen,
    xp,
    badges,
  });
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...defaultProgress(),
  hydrated: false,

  hydrate: async () => {
    const data = await loadProgress();
    set({ ...data, hydrated: true });
  },

  login: async (code: string) => {
    set({ studentCode: code.trim() });
    await persist(get);
  },

  markVideoSeen: async (videoId: string) => {
    const videosSeen = { ...get().videosSeen, [videoId]: true };
    set({ videosSeen });
    await persist(get);
  },

  hasSeenVideo: (videoId: string) => Boolean(get().videosSeen[videoId]),

  completeLevel: async (level: LevelId) => {
    const { completed, unlocked, stars } = get();
    if (completed[level]) {
      await persist(get);
      return;
    }

    const nextCompleted = { ...completed, [level]: true };
    const nextUnlocked = { ...unlocked };
    let nextStars = stars;

    if (level === 'prep') {
      nextUnlocked.level1 = true;
      nextStars = Math.max(stars, 1);
    } else if (level === 'level1') {
      nextUnlocked.level2 = true;
      nextStars = Math.max(stars, 2);
    } else if (level === 'level2') {
      nextStars = Math.max(stars, 3);
    }

    set({
      completed: nextCompleted,
      unlocked: nextUnlocked,
      stars: nextStars,
    });
    await persist(get);
  },

  addXp: async (amount: number, badge?: string) => {
    const badges = badge && !get().badges.includes(badge)
      ? [...get().badges, badge]
      : get().badges;
    set({ xp: get().xp + amount, badges });
    await persist(get);
  },

  resetProgress: async () => {
    const code = get().studentCode;
    set({ ...defaultProgress(), studentCode: code, hydrated: true });
    await persist(get);
  },

  progressFraction: () => {
    const { completed } = get();
    let n = 0;
    if (completed.prep) n += 1;
    if (completed.level1) n += 1;
    if (completed.level2) n += 1;
    return n / 3;
  },
}));
