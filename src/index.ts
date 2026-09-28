// Reexport the native module. On web, it will be resolved to ShakeSoundModule.web.ts
// and on native platforms to ShakeSoundModule.ts
export { default } from './ShakeSoundModule';
export { default as ShakeSoundView } from './ShakeSoundView';
export * from './ShakeSound.types';
