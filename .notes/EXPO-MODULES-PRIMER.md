# Expo Modules — a from-zero primer (for the presenter)

You said you don't know Expo modules yet. This is the crash course: what they
are, why they exist, how you *always* build one, what every folder means — then
it narrows down to **our** repo and the two sessions. Read it top-to-bottom once
and you'll be ahead of your audience.

---

# Part 1 · The big picture (nothing Expo-specific yet)

## 1.1 What actually runs in a React Native app

Two worlds live in one app:

```
        ┌──────────────────────────────┐
        │  JavaScript world             │   your React code, business logic
        │  (Hermes engine)              │   — runs JS, that's ALL it knows
        └──────────────┬───────────────┘
                       │   ← the boundary ("the bridge") →
        ┌──────────────┴───────────────┐
        │  Native world                 │   the phone's real capabilities:
        │  iOS = Swift/Obj-C (UIKit,     │   camera, accelerometer, audio,
        │  CoreMotion, AVFoundation…)    │   Bluetooth, files, GPS, the actual
        │  Android = Kotlin/Java         │   pixels on screen…
        │  (SensorManager, MediaPlayer…) │
        └───────────────────────────────┘
```

Your JavaScript **cannot** touch the accelerometer or play a sound directly.
Those only exist as **Swift** APIs (on iOS) and **Kotlin** APIs (on Android).
JavaScript can only *ask* the native side to do it. The place where a JS call
crosses into Swift/Kotlin is **the native boundary** — the single most important
idea in this whole talk.

## 1.2 What a "native module" is

A **native module** is a piece of Swift/Kotlin you write and then *expose to
JavaScript*, so JS can call it like a normal function. It's the bridge across
that boundary, for *your* feature.

There are only **two directions** of traffic:

- **JS → native**: JS calls a function ("play this sound", "what's the battery
  level?"). Optionally native returns a value.
- **native → JS**: native pushes an **event** up when something happens that JS
  didn't ask for in the moment ("the phone just shook", "a Bluetooth device
  connected", "download progress: 40%").

That's it. Every native module, however fancy, is some mix of those two.

## 1.3 The old way vs the new way (10-second history — say it once)

- **Old (pre-2022) "bridge":** JS and native talked by passing JSON messages
  asynchronously over a queue. Everything was async, a bit slow, lots of
  boilerplate.
- **New: JSI + TurboModules / Fabric ("the New Architecture").** JS holds direct
  references to native objects and can call them **synchronously**. Faster, less
  overhead. React Native 0.86 / Expo SDK 57 (what we're on) is New-Architecture
  by default.

You don't need to *teach* this — just know it, because it's *why* modern modules
can have synchronous functions and feel snappy.

## 1.4 So where does **Expo Modules** come in?

Writing a raw New-Architecture native module by hand is painful: you write a
TypeScript "spec", run a code generator, wire up C++ glue, register classes.
Lots of ceremony before you play a single sound.

**Expo Modules API** is Expo's answer: a small, clean **DSL** (domain-specific
language) in Swift and Kotlin that hides all that. You write:

```swift
Function("playSound") { (name: String) in … }
```

…and Expo generates the JSI bindings, the type conversions, the registration —
everything — for you. Same tiny DSL on both platforms.

**Key point for the talk:** Expo Modules isn't a *different kind* of module — it's
the **ergonomic, modern way to write one**. You can use it in any React Native app
that has the `expo` package installed; you do **not** have to build your whole app
"the Expo way" to use it. (Under the hood it's still JSI/TurboModules.)

## 1.5 Why would you ever need one? (the "day vs week" framing)

Reach for a custom native module when:

- **No library exists** for the native capability you need.
- You're **wrapping a vendor SDK** (a payments SDK, a hardware SDK) that only
  ships native code.
- You need **raw hardware/OS access** with custom logic.

Do **not** write one when:

- **A library already does it** — `expo-camera`, `expo-audio`, `expo-sensors`,
  etc. (Reach for these first, always.)
- You only need a **native config change** (a permission, an Info.plist key) —
  that's a **config plugin**, not a module.

This is the literacy your audience needs: being able to look at a feature and
guess "that's a library / that's a config plugin / that's a one-day module / that
needs a week of Swift + Kotlin."

---

# Part 2 · The uniform method — how you ALWAYS make one

Good news: there's a single, boring, repeatable path. You never hand-create these
files.

## 2.1 One command scaffolds everything

```bash
npx create-expo-module@latest            # a standalone, publishable module (+ example app)
npx create-expo-module@latest --local    # a module that lives inside one app (in modules/)
```

It generates the folder skeleton, the native project files, the TypeScript
bindings, and (for standalone) a runnable **example app**. You then **replace the
generated sample code with your real implementation**. That's the whole workflow:

```
scaffold  →  pick which features you want  →  replace sample code  →  build & run
```

## 2.2 Local module vs standalone module

| | **Local** (`--local`) | **Standalone** |
|---|---|---|
| Lives | inside one app, in `modules/` | its own repo/package |
| Deps/tooling | the app's | its own `package.json` |
| Example app | none (the host app *is* the consumer) | yes, an `example/` app |
| Use when | native code for **just this app** | **reusable**, monorepo, or publish to npm |

(Our repo is **standalone + example app** — more on that in Part 4.)

## 2.3 The entire DSL vocabulary (this is genuinely most of it)

Everything you declare inside a module's `definition()` is one of these:

| Building block | Direction | Meaning |
|---|---|---|
| `Name("…")` | — | the module's identity; the string JS looks it up by |
| `Function("f") {…}` | JS → native | **synchronous** call, returns immediately |
| `AsyncFunction("f") {…}` | JS → native | returns a **Promise** (use for anything slow) |
| `Property` / `Constant` | JS → native | expose a value/getter |
| `Events("e")` + `sendEvent("e", …)` | native → JS | push an event up to JS |
| `OnStartObserving` / `OnStopObserving` | — | run only while JS is listening (sensor lifecycle) |
| `View(MyView.self) { Prop("p") {…} }` | — | expose a **native UI view** + its props |

On the **JS side** you only need:

- `requireNativeModule('Name')` — grab the native module object.
- `requireNativeView('Name')` — grab the native view as a React component.
- `module.addListener('event', cb)` — subscribe to events.

## 2.4 The cross-language contract (the one real gotcha)

A module spans **three files/languages**: TypeScript (the JS types), Swift (iOS),
Kotlin (Android). They're glued together by **matching strings** — the module
name, function names, event names, payload keys. There's **no compiler** checking
that the Swift `Name("ShakeSound")` matches the TS `requireNativeModule('ShakeSound')`.
Get one wrong and it fails **silently at runtime** (module not found, event never
arrives, prop ignored). Keeping those names in sync is the core discipline.

---

# Part 3 · Folder structure — what every piece means

A **standalone** module looks like this (this *is* our repo):

```
shake-sound/
├── src/                         ← the TypeScript (JS-facing) layer
│   ├── index.ts                 ← public exports (the module, the view, the types)
│   ├── ShakeSoundModule.ts      ← typed JS "handle": what the native side offers
│   ├── ShakeSound.types.ts      ← shared types + our sound catalog
│   └── ShakeMeterView.tsx       ← JS wrapper for the native view
├── ios/                         ← the iOS (Swift) implementation
│   ├── ShakeSound.podspec        ← iOS build spec (deps, where bundled files go)
│   ├── ShakeSoundModule.swift    ← the module: Functions, Events, View(...)
│   └── ShakeMeterView.swift      ← the native view class (a UIView)
├── android/                     ← the Android (Kotlin) implementation
│   ├── build.gradle              ← Android build config
│   └── src/main/java/…/          ← the Kotlin package
│       ├── ShakeSoundModule.kt   ← mirror of the Swift module
│       └── ShakeMeterView.kt     ← the native view class (an Android View)
├── expo-module.config.json      ← registers native classes per platform (autolinking)
├── package.json                 ← package metadata; `main` points at src for dev
└── example/                     ← a REAL, runnable app that consumes the module
    ├── App.tsx                  ← the demo screen (what you show on stage)
    ├── ios/  android/           ← the example app's native projects (you run THESE)
    └── package.json             ← autolinks the parent module as a local module
```

Folder-by-folder, in plain terms:

- **`src/`** — everything JavaScript sees. Types + a typed stub that says *what*
  native offers. No real logic here; it just describes the boundary.
- **`ios/`** — the Swift side. The `.podspec` is iOS's "how to build me" file
  (CocoaPods). The `.swift` files are the real implementation.
- **`android/`** — the Kotlin side. `build.gradle` is Android's build file; the
  Kotlin files are the real implementation, mirroring Swift.
- **`expo-module.config.json`** — the registration card. Expo's **autolinking**
  reads this to find your native classes automatically — no manual wiring in the
  app. (iOS uses the class name; Android uses the fully-qualified name.)
- **`example/`** — a throwaway app that imports the module so you can run it. In a
  standalone module, **this is the app you actually launch** (`cd example && npx
  expo run:android`). The repo root is the *library*, not an app — that's why
  running `expo` at the root says "this is a native module, not an app."

A **local** module (`--local`) is the same `src/ios/android/expo-module.config.json`
core, but it sits inside an app's `modules/` folder and uses the app's tooling —
no `example/`, no `package.json` of its own.

---

# Part 4 · Now — bridge into OUR repo

Everything above maps 1:1 onto `shake-sound`. Here's the concrete mapping.

**What the module does:** shake the phone → a random meme sound plays, and a
native bar reacts to how hard you shook. It needs the **accelerometer**, **audio
playback**, and a **custom native view** — three things that only exist natively,
which is exactly what justifies a custom module (you can't fake them in JS).

**Our one design rule — repeat it in both sessions:**

> **Native only *senses*; JavaScript *decides*.**
> Native reports "a shake happened, this hard" and "here's what's actually
> bundled." JavaScript owns the choice of *which* sound to play and what the bar
> does. Behaviour changes stay in JS; the native code doesn't move.

**Our contract** (the matching-strings table, concrete):

| Thing | TypeScript | Swift | Kotlin |
|---|---|---|---|
| Module name | `requireNativeModule('ShakeSound')` | `Name("ShakeSound")` | `Name("ShakeSound")` |
| Function | `playSound(name)` | `Function("playSound")` | `Function("playSound")` |
| Async fn | `filterAvailable(names): Promise` | `AsyncFunction("filterAvailable")` | `AsyncFunction("filterAvailable")` |
| Event | `onShake` | `Events("onShake")` + `sendEvent` | same |
| Payload | `{ intensity: number }` | `["intensity": g]` | `mapOf("intensity" to g)` |
| View props | `level`, `barColor` | `Prop("level")`, `Prop("barColor")` | same |

**How we built it (the honest version):** we ran `create-expo-module` to scaffold
the correct wiring for our SDK, then replaced the sample `hello()/setValueAsync()`
code with the real thing — `playSound`, `filterAvailable`, the `onShake` event,
and the `ShakeMeter` view — keeping Swift and Kotlin the same shape on purpose.
The `example/App.tsx` is the single-screen demo you present from.

---

# Part 5 · Session 1 in this frame — Functions & Async (JS → native)

This session is **only the JS→native direction**. You're showing the two simplest
building blocks.

- **`Function("playSound")`** — synchronous JS→native. JS passes a clip name,
  native plays it via `AVAudioPlayer` (iOS) / `MediaPlayer` (Android). Returns
  nothing. *(Detail worth showing: the audio player is stored in a field so it
  isn't freed mid-playback — a lifetime concern you inherit in native land.)*
- **`AsyncFunction("filterAvailable")`** — returns a **Promise**. Native looks at
  which clips are actually bundled and hands the list back. Use `AsyncFunction`
  whenever work could block or you need a return value; `Function` for quick fire-
  and-forget.
- **The takeaway:** native exposed *play this* and *what's available*; the choice
  of what to play stayed in JS. (`native senses, JS decides`.)

Files to open: `ios/ShakeSoundModule.swift` (Session 1 block), the Kotlin mirror,
`src/ShakeSoundModule.ts`, and `example/App.tsx` (top of the screen). Full
line-by-line script is in **`SESSION-1-NOTES.md`**.

---

# Part 6 · Session 2 — Events & Native Views (native → JS, and native UI)

This session adds the **native→JS direction** and **native UI**.

- **`Events("onShake")` + `sendEvent(...)`** — native pushes an event up when the
  accelerometer magnitude crosses a threshold. JS subscribes with `addListener`.
- **`OnStartObserving` / `OnStopObserving`** — the accelerometer runs **only while
  JS is listening**. This is the pattern that keeps you from draining the battery.
- **Native views: `View(...)` + `Prop(...)`** — the `ShakeMeter` bar is a real
  Swift `UIView` / Kotlin `View`, handed to React as `<ShakeMeter level=… barColor=…/>`.
  Props flow from JS straight into native setters.
- **The cross-platform sensor detail:** iOS CoreMotion reports in **g**; Android
  reports in **m/s²**, so Kotlin divides by `GRAVITY_EARTH` to normalise — without
  it the same threshold means two different things (the classic cross-platform
  sensor bug).

Files: the Session 2 blocks in the Swift/Kotlin modules, the `ShakeMeterView`
files, `src/ShakeMeterView.tsx`, and the bottom of `example/App.tsx`. Full script:
**`SESSION-2-NOTES.md`**.

---

# Part 7 · What building one *actually* felt like (great real-world color)

These are true stories from getting this demo running — drop any of them in for
"this is what native work is really like":

1. **The toolchain is load-bearing.** iOS wouldn't compile because **Xcode 26.2 /
   Swift 6.2.3** was stricter than Expo SDK 57 expected (a core header failed).
   No app-code bug — the *compiler version* was the problem. Lesson: in native
   land, your toolchain versions are part of your code.
2. **The same prop needed different handling per platform.** `barColor="#ff3b30"`
   worked on iOS (its `UIColor` type parses color strings) but *crashed* Android
   (it wanted a number) until we parsed the string natively. The boundary isn't
   always symmetric.
3. **JS hot-reloads; native doesn't.** Editing `App.tsx` updates instantly;
   adding a `Prop` or a sound file means a native rebuild. Knowing which is which
   saves you a lot of confused waiting.
4. **Shaking opened the dev menu.** React Native's dev build uses the shake
   gesture too, so our shake fired both. A release build has no dev menu — the
   gesture becomes 100% ours.

These aren't failures — they're the texture of the JS/native seam, and they're
exactly the "why some features are a day and others a week" point from Session 1's
opening.

---

## TL;DR to hold in your head

- JS can't touch hardware; **native modules bridge JS ↔ Swift/Kotlin**.
- Two directions only: **JS→native (Functions)** and **native→JS (Events)**; plus
  **native Views**.
- **Expo Modules API** = the clean Swift/Kotlin **DSL** for writing one; scaffold
  with `create-expo-module`, then fill in the code.
- A module = **3 files glued by matching strings** (TS/Swift/Kotlin).
- Ours: **shake → sound + meter**, standalone module + `example/` app, and the
  rule is **native senses, JS decides**.
- Session 1 = **Functions & Async** (JS→native). Session 2 = **Events & Views**
  (native→JS + native UI).
