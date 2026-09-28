# CLAUDE.md

Project context for Claude Code. Read this before editing. For the full story of
*why* this project exists (the sessions, the audience, decisions made, what's
still open), see `.notes/HANDOVER.md`.

## What this is

`shake-sound` is an **Expo native module** used as a teaching demo across two
~30-min sessions. Shake the phone → a random meme sound plays. It exists to
show how JavaScript reaches phone capabilities (accelerometer, audio, a native
view) that only exist as Swift/Kotlin APIs.

Layout: the **module lives at the repo root** (standalone package — `src/`,
`ios/`, `android/`, `ios/ShakeSound.podspec`), and the **`example/` app consumes
it** by autolinking it as a local module (`example/package.json` →
`expo.autolinking.nativeModulesDir: ".."`). So the teaching point still holds —
the example treats it exactly like a module in an app's `modules/` folder — but
it's a self-contained repo you run from `example/`. Built against **Expo SDK 57**.

It is intentionally small and structured to be *taught in order*. Do not add
features, abstractions, or dependencies unless asked — clarity for readers, and
the session flow (`.notes/SESSIONS.md`), come first. The sessions are **not live-coded**;
the code is presented as finished files, so keep it clean and readable.

## Start here (getting the demo running)

The immediate goal is a working demo on a real device. In order:

1. **Module reachability — already wired.** The `example/` app autolinks the
   root module via `example/package.json` → `expo.autolinking.nativeModulesDir:
   ".."` (and metro `extraNodeModules`). The root `package.json` `main` points
   at `src/index.ts`, so the example bundles the TS source directly — edits hot-
   reload, no build step. Confirm with: `cd example && npx tsc --noEmit`.
2. **Add the sounds.** `MEME_SOUNDS` in `src/ShakeSound.types.ts` lists the
   names; the `.mp3` files aren't in the repo yet. Add each one:
   - iOS: `ios/Resources/<name>.mp3` — bundled into the app by the podspec
     (`s.resources = "Resources/*.mp3"`). Re-run `pod install` after adding.
   - Android: `android/src/main/res/raw/<name>.mp3`, lowercase `a–z`/digits/
     underscore only.
3. **Build & run on a real device** (not a simulator — the accelerometer needs
   real hardware), from the `example/` folder:
   ```bash
   cd example
   npx expo run:ios --device    # pick your device; set a signing team in Xcode
   npx expo run:android         # device with USB debugging, or an emulator
   ```
   ⚠️ Run these **from `example/`**, never the repo root. The root is the module
   (a library), so `expo prebuild`/`run:*` there correctly reports "detected as a
   native module, not an Expo app" — that's expected, not an error. `example/`
   already has its `ios/`/`android/` projects; regenerate them with
   `cd example && npx expo prebuild --clean` if ever needed.
4. **Verify it.** Session 1 tab: tap a sound (should play once clips are added),
   tap "check availability" (lists the bundled clips). Session 2 tab: shake the
   phone (event fires, counter ticks, the meter bar reacts). The "Fake a shake"
   button works without motion.
5. **If anything errors on build/run,** it's most likely a version drift in the
   JS wiring — scaffold a reference with `npx create-expo-module@latest --local`
   on your SDK and diff (see "SDK / version note").

### Known gotchas (hit while first getting this running)

- **Metro bundling failures** — two forms, same root cause: `babel-preset-expo`
  is nested under `example/node_modules/expo/node_modules/`, not hoisted to
  `example/node_modules/` top-level, so a bare `presets: ['babel-preset-expo']`
  can't be resolved from `example/`. Symptoms: `Unable to determine event
  arguments for onModeChange` (a stale hoisted codegen got used) or
  `Cannot read properties of undefined (reading 'transformFile')` (the transformer
  failed to construct because the preset wasn't found). **Fix (already applied):**
  `example/babel.config.js` resolves the preset from expo's own tree via
  `require.resolve('babel-preset-expo', { paths: [<expo dir>] })` — that pins the
  SDK-matched version (and its matching `@react-native/codegen`). Don't revert it
  to the bare string. After any change here, restart with `npx expo start --clear`.
  Also run the app as a **dev build** (`--dev-client`), never Expo Go — the module
  has custom native code Expo Go can't load.
- **iOS on Xcode 26.2 / Swift 6.2.3** fails to compile `expo-modules-jsi` (SDK 57
  vs a too-new toolchain — expo/expo #50067, #50470). No SDK-57 patch; use
  **Xcode 26.5+**, or run the demo on **Android** (unaffected).
- **`android/src/main/res/raw/` takes only `.mp3`s** — no `README`/dotfiles; any
  non-`a–z0–9_` filename fails `packageDebugResources`. Sound docs live in
  `android/SOUNDS.md`.

## Session structure (why the code is shaped this way)

The module grows across two sessions, and the boundary is a literal banner in the
native files. See `.notes/SESSIONS.md` for the full plan.

- **Session 1 — Functions & AsyncFunctions:** `Function("playSound")` (sync) and
  `AsyncFunction("filterAvailable")` (returns a Promise). No shake yet.
- **Session 2 — Events + Native view:** `Events`/`OnStartObserving`/
  `OnStopObserving` (shake → JS), then a native `View` with `Prop`s (`ShakeMeter`).

When editing, keep Session 1 code above the `SESSION 2` banner and Session 2 code
below it, so the file still reads as a progression.

## Architecture / data flow

```
Session 1:  JS button → playSound(name)            // JS → native (Function)
            JS → filterAvailable(names) → Promise   // JS → native (AsyncFunction)

Session 2:  accelerometer → magnitude (g) → threshold + 500ms cooldown
            → sendEvent("onShake", { intensity })   // native → JS (Event)
            → JS listener auto-plays + feeds <ShakeMeter level={…}/>  (native View)
```

Design rule that shapes everything: **native only senses; JS decides.** The
choice of *which* sound to play lives in JS. Behaviour changes (random vs
escalation) should be JS-only, native untouched.

## File map

| File | Role | Session |
|---|---|---|
| `src/index.ts` | Public exports (module + view + types). | — |
| `src/ShakeSoundModule.ts` | Typed JS handle: `playSound`, `filterAvailable`, `onShake`. | 1 + 2 |
| `src/ShakeSound.types.ts` | Event payload type + `MEME_SOUNDS` catalog. | 1 |
| `src/ShakeMeterView.tsx` | JS wrapper for the native view. | 2 |
| `ios/ShakeSoundModule.swift` | iOS impl: CoreMotion + AVAudioPlayer + `View(...)`. | 1 + 2 |
| `ios/ShakeMeterView.swift` | iOS native view (bar meter). | 2 |
| `android/.../ShakeSoundModule.kt` | Android impl: SensorManager + MediaPlayer + `View(...)`. | 1 + 2 |
| `android/.../ShakeMeterView.kt` | Android native view (bar meter). | 2 |
| `example/App.tsx` | Consumer, two tabs mirroring the sessions. | 1 + 2 |
| `expo-module.config.json` | Registers the native module classes per platform. | — |
| `ios/ShakeSound.podspec` | iOS build spec (+ where module-bundled sounds go). | — |
| `android/build.gradle` | Android module build config. | — |
| `.notes/SESSIONS.md` | Session-by-session teaching plan mapped to these files. | — |
| `.notes/HANDOVER.md` | Full project context (initiative, decisions, open tasks). | — |

## The shared contract (read before editing any module file)

The module is defined by **strings that must match across files**. A mismatch
breaks at runtime with **no compile error** (JS finds no module, the event never
arrives, or a prop is ignored):

| Thing | TS | Swift | Kotlin |
|---|---|---|---|
| Module name | `requireNativeModule("ShakeSound")` / `requireNativeView("ShakeSound")` | `Name("ShakeSound")` | `Name("ShakeSound")` |
| Event | `onShake` in `ShakeSoundModuleEvents` | `Events("onShake")` + `sendEvent("onShake", …)` | same |
| Function | `playSound(name)` | `Function("playSound")` | `Function("playSound")` |
| Async fn | `filterAvailable(names): Promise` | `AsyncFunction("filterAvailable")` | `AsyncFunction("filterAvailable")` |
| Payload | `{ intensity: number }` | `["intensity": g]` | `mapOf("intensity" to g)` |
| View props | `level`, `barColor` in `ShakeMeterProps` | `Prop("level")`, `Prop("barColor")` | `Prop("level")`, `Prop("barColor")` |

If a class name changes, also update `expo-module.config.json`.

## Cross-platform parity

Swift and Kotlin are deliberately the same shape (`Name` → Session 1 funcs →
`Events` + observing → `View`). Edit behaviour on one, mirror it on the other.

The one real difference to respect:
- **iOS CoreMotion** reports acceleration in **g** (incl. gravity, ~1g at rest).
- **Android SensorManager** reports **m/s²**; the Kotlin code divides by
  `SensorManager.GRAVITY_EARTH` to normalize to g.

Both end in g so the `> 2.5` threshold means the same thing. **Do not remove the
Android division** — it's the most common cross-platform sensor bug and it's
load-bearing here.

## Invariants — don't break these

- **Sensor lifecycle:** accelerometer starts in `OnStartObserving`, stops in
  `OnStopObserving` — runs only while JS has a listener. Never start it eagerly.
- **Cooldown:** the 500ms guard stops one shake firing a burst. Keep it.
- **Player reference:** both platforms hold the audio player in a field; a local
  would be deallocated mid-playback. Keep the field.
- **Android view `onDraw`:** `ShakeMeterView` calls `setWillNotDraw(false)` in
  `init` because `ExpoView` is a `ViewGroup` and skips `onDraw` otherwise. Keep it.
- **Tuning knobs are threshold + cooldown only.** Don't restructure detection.

## Sound assets

`MEME_SOUNDS` in `src/ShakeSound.types.ts` lists the clip names. Each needs a
matching `.mp3` in `ios/Resources/` (bundled by the podspec) **and**
`android/src/main/res/raw/` (lowercase `a–z`/digits/underscore only). Own or
royalty-free clips only. Adding/renaming a sound → update `MEME_SOUNDS` and add
the file on both platforms. See `ios/Resources/README.md` and `android/SOUNDS.md`
(nothing but `.mp3`s may live in `android/src/main/res/raw/` — the resource
packer rejects any other filename there).

## SDK / version note

Scaffolded and typechecked against **Expo SDK 57** (`create-expo-module`,
react-native 0.82 for the module / 0.86 for the example) using the current Expo
Modules API — `NativeModule` / `requireNativeModule` / `requireNativeView`. The
native compile (Swift/Kotlin) has not been run yet — that happens on the first
`npx expo run:ios` / `run:android` (see "Start here"). If the JS wiring ever
drifts on a different SDK, scaffold a reference with
`npx create-expo-module@latest --local` on that SDK and reconcile; the native
structure has been stable.
