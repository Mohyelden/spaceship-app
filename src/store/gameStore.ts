import { create } from 'zustand';
import type { HintMode } from '@/src/config/env';
import {
  defaultSave,
  loadSave,
  newStudent,
  writeSave,
  type LevelId,
  type SaveData,
  type StatKey,
  type Stats,
  type StudentProgress,
  type VideoId,
} from '@/src/storage/progress';

type GameStore = {
  hydrated: boolean;
  save: SaveData;
  /** Code of the student playing right now (null = logged out) */
  code: string | null;

  hydrate: () => Promise<void>;
  login: (code: string) => Promise<{ firstTime: boolean }>;
  logout: () => void;
  setHintMode: (mode: HintMode) => Promise<void>;
  markVideoSeen: (id: VideoId) => Promise<void>;
  completeLevel: (level: LevelId) => Promise<void>;
  addXp: (amount: number, badge?: string) => Promise<void>;
  track: (key: StatKey, field: keyof Stats, by?: number) => void;
  resetStudent: (code: string) => Promise<void>;
  deleteStudent: (code: string) => Promise<void>;
};

export const normalizeCode = (raw: string) => raw.trim().toUpperCase().replace(/\s+/g, '');

let persistTimer: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameStore>((set, get) => {
  const persistNow = async () => writeSave(get().save);
  const persistSoon = () => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      persistTimer = null;
      writeSave(get().save);
    }, 400);
  };

  const updateStudent = (fn: (s: StudentProgress) => StudentProgress) => {
    const { code, save } = get();
    if (!code || !save.students[code]) return;
    set({
      save: { ...save, students: { ...save.students, [code]: fn(save.students[code]) } },
    });
  };

  return {
    hydrated: false,
    save: defaultSave(),
    code: null,

    hydrate: async () => {
      const save = await loadSave();
      set({ save, hydrated: true });
    },

    login: async (raw) => {
      const code = normalizeCode(raw);
      const { save } = get();
      const existing = save.students[code];
      const student = existing ?? newStudent(code);
      const updated: StudentProgress = {
        ...student,
        logins: student.logins + 1,
        lastLoginAt: Date.now(),
      };
      set({
        code,
        save: {
          ...save,
          lastCode: code,
          students: { ...save.students, [code]: updated },
        },
      });
      await persistNow();
      return { firstTime: !existing };
    },

    logout: () => set({ code: null }),

    setHintMode: async (mode) => {
      set({ save: { ...get().save, hintMode: mode } });
      await persistNow();
    },

    markVideoSeen: async (id) => {
      updateStudent((s) => ({ ...s, videosSeen: { ...s.videosSeen, [id]: true } }));
      await persistNow();
    },

    completeLevel: async (level) => {
      updateStudent((s) =>
        s.completed[level] ? s : { ...s, completed: { ...s.completed, [level]: true }, xp: s.xp + 50 }
      );
      await persistNow();
    },

    addXp: async (amount, badge) => {
      updateStudent((s) => ({
        ...s,
        xp: s.xp + amount,
        badges: badge && !s.badges.includes(badge) ? [...s.badges, badge] : s.badges,
      }));
      persistSoon();
    },

    track: (key, field, by = 1) => {
      updateStudent((s) => ({
        ...s,
        stats: { ...s.stats, [key]: { ...s.stats[key], [field]: s.stats[key][field] + by } },
      }));
      persistSoon();
    },

    resetStudent: async (code) => {
      const { save } = get();
      if (!save.students[code]) return;
      const fresh = { ...newStudent(code), logins: save.students[code].logins };
      set({ save: { ...save, students: { ...save.students, [code]: fresh } } });
      await persistNow();
    },

    deleteStudent: async (code) => {
      const { save } = get();
      const students = { ...save.students };
      delete students[code];
      set({
        save: { ...save, students, lastCode: save.lastCode === code ? null : save.lastCode },
        code: get().code === code ? null : get().code,
      });
      await persistNow();
    },
  };
});

/* ---------- selectors ---------- */

export function useStudent(): StudentProgress | null {
  return useGameStore((s) => (s.code ? s.save.students[s.code] ?? null : null));
}

export function useHintMode(): HintMode {
  return useGameStore((s) => s.save.hintMode);
}

export function starsOf(st: StudentProgress | null): number {
  if (!st) return 0;
  return (st.completed.prep ? 1 : 0) + (st.completed.level1 ? 1 : 0) + (st.completed.level2 ? 1 : 0);
}

export function isUnlocked(st: StudentProgress | null, level: LevelId): boolean {
  if (!st) return level === 'prep';
  if (level === 'prep') return true;
  if (level === 'level1') return st.completed.prep;
  return st.completed.level1;
}
