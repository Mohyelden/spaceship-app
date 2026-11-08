import { create } from 'zustand';

/** In-memory only: forces splash once per app open */
type SessionStore = {
  splashSeen: boolean;
  markSplashSeen: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  splashSeen: false,
  markSplashSeen: () => set({ splashSeen: true }),
}));
