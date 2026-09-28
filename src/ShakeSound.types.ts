import type { StyleProp, ViewStyle } from 'react-native';

// SESSION 1 — the shape of the JS <-> native contract.
// Every string/type here must match the native files. See CLAUDE.md ▸ contract.

/**
 * Payload sent from native → JS on every detected shake.
 * Native only reports *how hard* the shake was; JS decides what to do with it.
 */
export type ShakeEventPayload = {
  /** Peak acceleration of the shake, in g (≈1 at rest, > 2.5 triggers). */
  intensity: number;
};

/**
 * Events this module can emit. The key `onShake` must match `Events("onShake")`
 * and the `sendEvent("onShake", …)` calls in the native modules.
 */
export type ShakeSoundModuleEvents = {
  onShake: (payload: ShakeEventPayload) => void;
};

/** Props for the native <ShakeMeter/> bar view (Session 2). */
export type ShakeMeterProps = {
  /** 0–1, how full the bar is. Driven from JS by the last shake intensity. */
  level: number;
  /** Bar colour — any React Native color string, e.g. '#ff3b30'. */
  barColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * The clips JS may ask native to play. Each name needs a matching `.mp3`
 * bundled on BOTH platforms:
 *   - iOS:     ios/Resources/<name>.mp3   (bundled via ShakeSound.podspec)
 *   - Android: android/src/main/res/raw/<name>.mp3   (lowercase a–z/0–9/_ only)
 *
 * Until the files exist, `filterAvailable` returns [] and playback is silent —
 * the shake events, counter and meter still work.
 */
export const MEME_SOUNDS = [
  'airhorn',
  'anime_wow',
  'boing_boing_boing',
  'help_me',
  'omg_bruh',
  'yeet',
] as const;

export type MemeSound = (typeof MEME_SOUNDS)[number];
