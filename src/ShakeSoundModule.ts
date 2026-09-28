import { NativeModule, requireNativeModule } from 'expo';

import { ShakeSoundModuleEvents } from './ShakeSound.types';

// Typed JS handle for the native module. The methods here mirror the
// Function / AsyncFunction / Events defined in the Swift and Kotlin files.
declare class ShakeSoundModule extends NativeModule<ShakeSoundModuleEvents> {
  // SESSION 1 — JS → native
  /** Play a bundled clip by name, synchronously. No-op if it isn't bundled. */
  playSound(name: string): void;
  /** Resolve `names` to the subset actually bundled on this device (Promise). */
  filterAvailable(names: string[]): Promise<string[]>;

  // SESSION 2 — native → JS events come through `addListener('onShake', …)`,
  // inherited from NativeModule<ShakeSoundModuleEvents>.
}

// This string must match `Name("ShakeSound")` in ShakeSoundModule.swift/.kt.
export default requireNativeModule<ShakeSoundModule>('ShakeSound');
