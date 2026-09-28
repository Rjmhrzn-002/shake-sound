import { registerWebModule, NativeModule } from 'expo';

import { ShakeSoundModuleEvents } from './ShakeSound.types';

// ShakeSoundModule is not available on the web platform.
class ShakeSoundModule extends NativeModule<ShakeSoundModuleEvents> {}

export default registerWebModule(ShakeSoundModule, 'ShakeSoundModule');
