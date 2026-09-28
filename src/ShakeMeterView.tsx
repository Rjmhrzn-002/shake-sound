import { requireNativeView } from 'expo';
import * as React from 'react';

import { ShakeMeterProps } from './ShakeSound.types';

// SESSION 2 — JS wrapper for the native view.
// The module defines exactly one View, so we reference it by the module name
// ("ShakeSound"), which must match `Name("ShakeSound")` in the native files.
const NativeView: React.ComponentType<ShakeMeterProps> =
  requireNativeView('ShakeSound');

export default function ShakeMeter(props: ShakeMeterProps) {
  return <NativeView {...props} />;
}
