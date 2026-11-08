import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_HINT_MODE, type HintMode } from '@/src/config/env';

export type LevelId = 'prep' | 'level1' | 'level2';
export type VideoId = 'intro' | 'prep' | 'level1' | 'level2' | 'finale';
export type StatKey = LevelId | 'bank';

export type Stats = {
  correct: number;
  errors: number;
  hintsShown: number;
  helpPresses: number;
  solutionsShown: number;
};

export type StudentProgress = {
  code: string;
  createdAt: number;
  lastLoginAt: number;
  logins: number;
  completed: Record<LevelId, boolean>;
  videosSeen: Partial<Record<VideoId, boolean>>;
  xp: number;
  badges: string[];
  stats: Record<StatKey, Stats>;
};

export type SaveData = {
  version: 2;
  hintMode: HintMode;
  lastCode: string | null;
  students: Record<string, StudentProgress>;
};

const KEY = 'spaceship_save_v2';

export const emptyStats = (): Stats => ({
  correct: 0,
  errors: 0,
  hintsShown: 0,
  helpPresses: 0,
  solutionsShown: 0,
});

export function newStudent(code: string): StudentProgress {
  const now = Date.now();
  return {
    code,
    createdAt: now,
    lastLoginAt: now,
    logins: 0,
    completed: { prep: false, level1: false, level2: false },
    videosSeen: {},
    xp: 0,
    badges: [],
    stats: {
      prep: emptyStats(),
      level1: emptyStats(),
      level2: emptyStats(),
      bank: emptyStats(),
    },
  };
}

export const defaultSave = (): SaveData => ({
  version: 2,
  hintMode: DEFAULT_HINT_MODE,
  lastCode: null,
  students: {},
});

export async function loadSave(): Promise<SaveData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed?.version !== 2) return defaultSave();
    return { ...defaultSave(), ...parsed };
  } catch {
    return defaultSave();
  }
}

export async function writeSave(data: SaveData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full / unavailable: keep playing in memory
  }
}
