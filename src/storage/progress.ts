import AsyncStorage from '@react-native-async-storage/async-storage';

export type LevelId = 'prep' | 'level1' | 'level2';

export type ProgressState = {
  studentCode: string | null;
  stars: number;
  unlocked: Record<LevelId, boolean>;
  completed: Record<LevelId, boolean>;
  videosSeen: Record<string, boolean>;
  xp: number;
  badges: string[];
};

const KEY = 'spaceship_progress_v1';

export const defaultProgress = (): ProgressState => ({
  studentCode: null,
  stars: 0,
  unlocked: { prep: true, level1: false, level2: false },
  completed: { prep: false, level1: false, level2: false },
  videosSeen: {},
  xp: 0,
  badges: [],
});

export async function loadProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

export async function saveProgress(state: ProgressState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function clearProgress(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
