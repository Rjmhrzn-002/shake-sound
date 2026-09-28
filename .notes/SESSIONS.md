# SESSIONS.md

How this repo maps onto the two-session plan. One module, grown across both
sessions — Session 2 extends the exact module from Session 1, so no re-orienting.

The session boundary is a literal banner in the native files:
`// SESSION 1 — Functions & AsyncFunctions` … `// SESSION 2 — Events` … `// SESSION 2 — Native view`.

---

## How to present this (no live coding)

You are **not typing code on stage.** Every segment is the same three beats:

> **show it running → open the finished file → read the shape → move on.**

The annotation comments in each file are your script. Rehearse the run-order,
not your typing.

Before you start:
- **Release build** installed on a **real device**, mirrored to the screen, app
  open. (Release = no Metro dependency and no dev menu, so the shake gesture is
  100% ours — a debug build hijacks shake to open the RN dev menu.)
- Sounds are bundled (6 clips) so audio plays.
- A **screen recording** of the app working, as a backup if the device or audio
  misbehaves.
- Have open: the app on device, the repo at the relevant file, this file as your
  run sheet.

**One-screen layout (no tabs).** The demo is a single scrolling screen: Session 1
cards on top, a divider labelled *Session 2 · Events & Native View*, then the
Session 2 cards. In Session 1 you stay at the top and point at that divider as
your "this is for later" line; at the end you scroll down for a 10-second tease.
In Session 2 you recap the top, then scroll down and stay.

For the two platforms: show **one** platform's file as the main read and the
other as a quick side-by-side — the two native files are the same shape on
purpose, so the second reads in seconds. Not a code-along.

---

## Session 1 — Why & How: Functions & Async (~30 min)

**0–5 · Motivation.** When you need a custom module (missing native feature, no
existing library, wrapping a vendor SDK) vs when you don't (config plugins,
existing packages). The `example/` app autolinks this module as a **local
module** (`nativeModulesDir: ".."`) — still inside the managed workflow, no
ejecting. (Run and demo from `example/`; the repo root is the module itself.)
→ `README.md`, `CLAUDE.md` (intro).

**5–10 · Mental model.** Expo Modules API = a DSL over JSI, Swift/Kotlin
underneath. Project anatomy, and the one command that produced this module:
`npx create-expo-module@latest` (a standalone module with an `example/` app; the
`--local` flag makes the in-app variant). Show the generated folders — don't run
it live.
→ Open `expo-module.config.json`, `src/index.ts`, `src/ShakeSoundModule.ts`.

**10–25 · Walk-through (the core).** Show the app's **Session 1 section** (top of
the single screen) on device first — tap a sound, tap "check availability." *Then* open the finished code and
read what made that happen:
- `Name("ShakeSound")`
- `Function("playSound")` — sync
- `AsyncFunction("filterAvailable")` — returns a `Promise`
Show the Kotlin block side-by-side as a quick contrast.
→ `ios/ShakeSoundModule.swift` (SESSION 1 block), `android/.../ShakeSoundModule.kt`
(SESSION 1 block), `src/ShakeSoundModule.ts`, the Session 1 section of `example/App.tsx`.

**25–30 · Wrap-up.** Recap the DSL vocabulary (Name, Function, AsyncFunction).
**Scroll down** for a 10-second tease of the Session 2 cards (counter + bar):
"next time — events, native views, and shipping this for real." Scroll back up.
Q&A / buffer.

---

## Session 2 — Events, Views & Real-World Patterns (~30 min)

**0–5 · Recap.** Same module. Re-open the Session 1 files so people re-anchor.

**5–15 · Events.** Scroll to the **Session 2 section** — shake the phone, a sound fires,
the counter ticks. Then open the code: `Events`, `OnStartObserving`,
`OnStopObserving`, and the JS-side `addListener`.
→ `ios/ShakeSoundModule.swift` / `android/.../ShakeSoundModule.kt` (SESSION 2 —
Events block), the Session 2 section of `example/App.tsx`.

**15–25 · Native views.** Point at the `ShakeMeter` bar reacting on screen, then
open `View` + `Prop` and the view class. This is the part to walk through slowly
as finished code — it's the least familiar concept for a JS audience.
→ `ios/ShakeMeterView.swift`, `android/.../ShakeMeterView.kt`,
`src/ShakeMeterView.tsx`, and the `View(...)` block in the module files.

**25–30 · Shipping / closing.** Local module vs publishing to npm (when to
graduate). One line on config plugins (native config without ejecting).
Lifecycle hooks — mention, don't dwell. Q&A / buffer.

---

## Structural notes

- **Same module both sessions.** Continuity does the context-rebuilding for you.
- **Show one platform, contrast the other** — don't read both in full.
- **Keep the buffer real.** Demos and questions slip.
- **Real devices only** — the accelerometer barely works in a simulator. The
  "Fake a shake" button demos audio + the meter without motion if needed.

## Other structures this same code supports

- **Split by capability, not difficulty:** Session 1 = data & logic
  (Function, AsyncFunction, Events); Session 2 = UI (View + Prop). Same files,
  different cut line — move Events up into Session 1.
- **One continuous walk, split by time:** go top-to-bottom through the module
  (Function → AsyncFunction → Events → View) and stop at the 30-min mark.
