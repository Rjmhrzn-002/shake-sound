import { NativeModule, requireNativeModule } from 'expo';

import { ShakeSoundModuleEvents } from './ShakeSound.types';

declare class ShakeSoundModule extends NativeModule<ShakeSoundModuleEvents> {
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

export default requireNativeModule<ShakeSoundModule>('ShakeSound');
