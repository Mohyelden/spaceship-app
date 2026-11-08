import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

export type SoundId = 'correct' | 'wrong' | 'hint' | 'win' | 'launch';

const SOURCES: Record<SoundId, number> = {
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  hint: require('../../assets/sounds/hint.wav'),
  win: require('../../assets/sounds/win.wav'),
  launch: require('../../assets/sounds/launch.wav'),
};

const cache: Partial<Record<SoundId, AudioPlayer>> = {};

/** Fire-and-forget short sound effect. Never throws (sound is a bonus). */
export function playSound(id: SoundId) {
  try {
    let p = cache[id];
    if (!p) {
      p = createAudioPlayer(SOURCES[id]);
      p.volume = 0.7;
      cache[id] = p;
    }
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    // ignore (autoplay policy on web before first tap, missing module, ...)
  }
}
