import { requireNativeView } from 'expo';
import * as React from 'react';

import { ShakeSoundViewProps } from './ShakeSound.types';

const NativeView: React.ComponentType<ShakeSoundViewProps> = requireNativeView('ShakeSound');

export default function ShakeSoundView(props: ShakeSoundViewProps) {
  return <NativeView {...props} />;
}
