# Session 1 — Speaker Notes: Functions & AsyncFunctions (~30 min)

The line-by-line script for Session 1. Read `SESSIONS.md` for the plan; this is
what you actually *say*. Every segment is the same three beats:
**show it running → open the finished file → read its shape → move on.**
No live coding.

**Before you start:** dev build open on the device (mirrored), `example/` app on
the top (the **Session 1 section** — it's one scrolling screen, no tabs), this file and the repo open. If audio clips aren't bundled
yet, that's fine for Session 1 — say so and use the chips/availability anyway.

---

## 0–5 min · Motivation — "why would I ever write native code?"

**Say:**
- "Most of you will never write a native module. That's fine — the goal today is
  *literacy*: understanding the seam where JavaScript meets the phone's OS, so you
  can tell when a feature is a one-day job and when it's a one-week job."
- "React Native gives you JS. But the accelerometer, the audio hardware, the
  camera — those only exist as **Swift and Kotlin APIs**. A native module is the
  bridge: a small piece of Swift/Kotlin you call from JS."
- **When you DON'T need one:** there's already a library (`expo-camera`,
  `expo-audio`), or you just need a native *config* change (a config plugin).
- **When you DO:** no library exists, you're wrapping a vendor SDK, or you need
  raw hardware access — like *this* demo: shake detection + audio + a custom view.
- "This is a **local module** — the `example/` app pulls it straight from this
  repo. Still the managed Expo workflow. **No ejecting.**"

**Show:** `README.md`, top of `CLAUDE.md`. Don't open code yet.

**Land this line:** *"Native senses; JavaScript decides. Keep that in your head —
it's the whole design."*

---

## 5–10 min · Mental model — what an Expo module actually is

**Say:**
- "The Expo Modules API is a small **DSL** — a domain-specific language — over the
  JS↔native bridge (JSI). You write Swift or Kotlin, but the *structure* is the
  same on both platforms: you declare a `Name`, then `Function`s, `Event`s, a
  `View`. That symmetry is deliberate."
- "One command scaffolds all of this:
  `npx create-expo-module@latest`. It generated the folders you're about to see —
  I'm **not** running it live."

**Show, in order:**
1. `expo-module.config.json` — "This is the registration. It tells Expo which
   native class to load per platform. Note iOS uses the class name
   (`ShakeSoundModule`), Android the fully-qualified name
   (`expo.modules.shakesound.ShakeSoundModule`)."
2. `src/index.ts` — "The public surface: the module, the view, the types. Three
   lines."
3. `src/ShakeSoundModule.ts` — "This is the **JS handle** — a typed stub. It says
   *what* the native side offers (`playSound`, `filterAvailable`); the *how* lives
   in Swift/Kotlin. `requireNativeModule('ShakeSound')` fetches the native object
   by name."

**Land this line:** *"The string `'ShakeSound'` here has to match `Name(\"ShakeSound\")`
in the native files exactly. There's no compiler checking that across languages —
a typo just means 'module not found' at runtime. That's the tax of crossing a
language boundary."* (Point at `CLAUDE.md ▸ The shared contract`.)

---

## 10–25 min · Walk-through (the core) — Function & AsyncFunction

This is the heart of the session. **Show it running first, then read the code.**

### Beat 1 — Demo it (2 min)
At the top of the screen (**Session 1 section**):
- Tap a couple of sound chips. "Each tap is JS calling into native — a
  `Function`. Synchronous, fire-and-forget." (If clips aren't bundled yet: "audio
  isn't wired up on this build, but the call is still crossing into native.")
- Tap **Check availability**. "That's an `AsyncFunction` — it returns a Promise.
  Native looks at what's actually bundled and hands back the list."
- **Point at the divider** below (labelled *Session 2 · Events & Native View*):
  "Everything under this line — the shake counter, the bar — is next session.
  Park it. Today it's just these two: call into native, and get a value back."
  (This is your "this is for later" beat — the screen signposts it for you.)

### Beat 2 — `Function` (5 min)
**Open `ios/ShakeSoundModule.swift`, the SESSION 1 block.**
- `Name("ShakeSound")` — "the module's identity; this is the string JS looked up."
- `Function("playSound") { (name: String) in … }` — "**synchronous** JS→native.
  JS passes a string, native plays the clip. It returns nothing — fire and
  forget. Notice: JS chose *which* sound; native just plays what it's told."
- Point at the `AVAudioPlayer` field and its comment. "Small but important: the
  player is stored on the object, not in a local variable. A local would be freed
  the instant the function returns and the sound would cut out. This is the kind
  of lifetime detail you own once you're in native land."

**Contrast with Android:** open `android/.../ShakeSoundModule.kt`, same block.
- "Same shape — `Name`, `Function('playSound')`. Different API underneath:
  `MediaPlayer` instead of `AVAudioPlayer`, `getIdentifier(...)` to find the clip
  in `res/raw`. Read it in seconds because the structure is identical." Don't read
  it line by line.

### Beat 3 — `AsyncFunction` (5 min)
Back to the Swift file:
- `AsyncFunction("filterAvailable") { (names: [String]) -> [String] in … }` —
  "Same idea, but it returns a value **asynchronously** — on the JS side it's a
  `Promise`. Use `AsyncFunction` whenever the work could block (disk, network) or
  you need to return a result. `Function` is for quick, synchronous calls."
- "Here native is the source of truth for *what's on the device*; JS decides what
  to do with that list. Native senses, JS decides — again."

**Then the JS side — `src/ShakeSoundModule.ts` and the Session 1 section of `example/App.tsx`.**
- In `App.tsx`: "The chips just call `ShakeSound.playSound(name)`. 'Check
  availability' does `await ShakeSound.filterAvailable(MEME_SOUNDS)` and renders
  the result. That's the entire consumer side — it reads like any other TS module,
  because the native handle is typed."

### Beat 4 — the contract (3 min)
Open `CLAUDE.md ▸ The shared contract` table.
- "Three files — TypeScript, Swift, Kotlin — and a handful of **strings** hold
  them together: the module name, the function names, the payload keys. Change one
  and forget another, and it fails **silently** at runtime — no red squiggle.
  That's the one genuinely new discipline when you cross the JS/native line."

---

## 25–30 min · Wrap-up

**Say:**
- "Recap the vocabulary: **`Name`** (identity), **`Function`** (sync JS→native),
  **`AsyncFunction`** (Promise-returning JS→native). That's most of what you need
  to read 90% of modules."
- "And the mental model: native senses, JS decides. Native exposed *play this* and
  *what's available*; the choices stayed in JavaScript."
- **Tease Session 2 — scroll down now** to the Session 2 cards (counter + bar):
  "Next time we go the *other* direction — native pushing **events** up to JS when
  you shake the phone — and this bar, a **native view**, reacting on screen. Same
  module, grown." Then scroll back up.
- Q&A / buffer.

---

## Anticipated questions (keep answers short)

- **"Do I need a Mac / Xcode to use a module?"** To *build* iOS, yes. To *use* an
  existing one, no — install and go. Writing native code is the Mac part.
- **"Function vs AsyncFunction — when do I pick which?"** `Function` for fast,
  synchronous calls that return immediately. `AsyncFunction` when it might block or
  needs to return a value; JS gets a Promise. When unsure, `AsyncFunction`.
- **"Why not just use a JS library?"** For audio/sensors there often is one
  (`expo-audio`, `expo-sensors`). We wrote our own to *see the boundary*. In real
  life, reach for the library first.
- **"What's the perf cost of crossing into native?"** Cheap per call on modern
  JSI, but it's still a boundary — batch chatty calls rather than calling in a
  tight loop.
- **"What happens if the names don't match?"** Runtime failure, no compile error —
  exactly the contract point. That's why the names live in one documented table.

---

## One-glance cheat sheet

| Concept | Says | File |
|---|---|---|
| `Name("ShakeSound")` | module identity, matched across 3 files | `*/ShakeSoundModule.{swift,kt}` |
| `Function("playSound")` | sync JS→native, no return | `ios`/`android` module |
| `AsyncFunction("filterAvailable")` | JS→native returning a Promise | `ios`/`android` module |
| JS handle | typed stub, `requireNativeModule('ShakeSound')` | `src/ShakeSoundModule.ts` |
| Consumer | chips + availability button | `example/App.tsx` (Session 1 section) |
| The contract | strings that must match | `CLAUDE.md ▸ The shared contract` |
