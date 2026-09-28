# HANDOVER.md

Full-picture context for picking this project up in Claude Code. Read this once,
then work from `CLAUDE.md` (code rules) and `SESSIONS.md` (teaching plan).

## The initiative

Two internal knowledge-share sessions, ~30 min each, teaching **Expo custom /
native modules**.

- **Audience:** senior engineers, but **web/backend — not mobile specialists.**
  They read code fluently; the mobile JS↔native boundary is what's new to them.
- **Goal:** literacy, not adoption. Be upfront that most of them will never write
  a native module. The value is understanding the seam where JS meets the OS —
  why some features are a day and others a week.
- **Format:** **no live coding.** The presenter would rather not fight syntax on
  stage. Every segment is: show the app running → open the finished file →
  explain its shape → move on. All docs assume this.

## The demo app

`shake-sound`: shake the phone → a random meme sound plays, with a native bar
that reacts to shake intensity.

- **Why this demo:** it needs real hardware — accelerometer, audio, and a native
  view — which is exactly where a custom module is justified and can't be faked
  in pure JS. It's also funny, which keeps a dry topic awake.
- **Design principle:** *native only senses; JS decides.* Native reports "a shake
  happened, this hard" and "here's what's actually bundled"; JS owns the choice
  of what to play. Keep it that way.
- **Structure:** one module **grows across the two sessions** (continuity beats
  re-explaining setup). Session 1 = Functions & AsyncFunctions; Session 2 adds
  Events + a native View. The boundary is a literal `// SESSION 2` banner in the
  native files.

## What's built

- A complete **standalone Expo module** at the repo root (Expo **SDK 57**), both
  platforms, typechecked (`tsc` clean):
  - `Function("playSound")` (sync), `AsyncFunction("filterAvailable")` (Promise)
  - `Events("onShake")` + `OnStartObserving`/`OnStopObserving` (CoreMotion /
    SensorManager)
  - a native `View` (`ShakeMeter`) with `level` / `barColor` props
- **Example app** (`example/`, its own `ios/`/`android/` prebuilt): `App.tsx` has
  two tabs mirroring the sessions, plus a "Fake a shake" button for demoing
  without motion. It autolinks the root module as a local module
  (`nativeModulesDir: ".."`). **Run the demo from `example/`, not the root.**
- **Docs:** `CLAUDE.md` (architecture, the cross-file contract, invariants,
  first-run), `SESSIONS.md` (teaching plan mapped to files), `README.md`.

## What's NOT done (open tasks)

1. **iOS not built yet.** Android is verified end-to-end (see below); iOS is
   blocked on **Xcode 26.2 / Swift 6.2.3** vs SDK 57 (see `CLAUDE.md ▸ Known
   gotchas`). Needs **Xcode 26.5+** or the community patch. The `barColor`
   `UIColor` path is written but unproven until iOS compiles.

## Done since first run (Android verified)

- ✅ **Runs on a real Android device.** Native built, installed, shake events +
   meter + Fake-a-shake all working. Build/bundle gotchas fixed and documented in
   `CLAUDE.md ▸ Known gotchas` (Metro/babel-preset resolution, `res/raw` naming,
   `barColor` String→color coercion, use `--dev-client` not Expo Go).
- ✅ **Session scripts written:** `SESSION-1-NOTES.md` (Functions & Async) and
   `SESSION-2-NOTES.md` (Events, Views & real-world patterns) — line-by-line,
   mapped to the files, with Q&A + cheat sheets.
- ✅ Added `react-native-safe-area-context` (replaces the deprecated RN
   `SafeAreaView`).
- ✅ **Sounds bundled:** 6 clips (masters in `sound/`) copied into
   `ios/Resources/` and `android/src/main/res/raw/` with underscore names, and
   `MEME_SOUNDS` updated to match. Android needs a rebuild after any sound change
   to repackage `res/raw`.

## Decisions made — don't silently undo these

- **Kept the meme-sound theme** instead of a battery/torch intro, so the *same*
  module carries both sessions. Continuity was weighted highest.
- **Built as a standalone module + `example/` app** (not a module inside a host
  app's `modules/`). It's the single-folder, runnable layout that matches the
  file map; the example autolinks the module as a local module, so the teaching
  point ("a local module, no ejecting") is intact. Run/prebuild from `example/`,
  never the repo root.
- **The contract spans three files** (TS / Swift / Kotlin). Names and payload
  shapes must stay in sync — see `CLAUDE.md ▸ The shared contract`. A mismatch
  fails silently at runtime, no compile error.
- **The Android g-normalization is load-bearing** (`/ GRAVITY_EARTH`). Don't
  "simplify" it away.
- **No live coding.** Don't reintroduce "type this live" into any doc.

## Suggested first moves in Claude Code

- *"Get the demo running on a real device"* → `CLAUDE.md ▸ Start here`.
- *"Add the meme sounds"* → drop the `.mp3`s in place; update `MEME_SOUNDS` if
  names change; add to both platforms.
- *"Verify against SDK <x>"* → scaffold a reference module and diff the JS wiring.
- *"Draft the session script from SESSIONS.md"* → turn the outline into the
  spoken copy.
