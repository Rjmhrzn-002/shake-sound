import { ShakeSoundViewProps } from './ShakeSound.types';

// ShakeSoundView is not available on the web platform.
export default function ShakeSoundView(_props: ShakeSoundViewProps) {
  throw new Error('ShakeSoundView is not available on the web platform.');
}
