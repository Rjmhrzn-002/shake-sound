# Session 2 — Speaker Notes: Events, Views & Real-World Patterns (~30 min)

The line-by-line script for Session 2. It grows the *same* module from Session 1 —
so people re-anchor fast. Same three beats every segment:
**show it running → open the finished file → read its shape → move on.** No live coding.

**Before you start:** dev build on the device (mirrored), app open on the
**Session 2 section** (one scrolling screen — scroll down past Session 1). Have the Session 1 native files open too — you'll re-open them
for the recap. If clips are bundled, great; if not, the counter/meter still work
and "Fake a shake" carries the demo.

---

## 0–5 min · Recap — same module, one step further

**Say:**
- "Last time: `Name`, `Function`, `AsyncFunction`. JS called *into* native and got
  answers back. Everything was JS-initiated."
- "Today, two new things: native pushes **events** *up* to JS on its own, and we
  render a **native view** — real Swift/Kotlin UI inside our React tree."
- "Same module. Open the Swift file — everything above the `SESSION 2` banner is
  what we already read. We're just adding below it."

**Show:** `ios/ShakeSoundModule.swift` — scroll to the `SESSION 2` banner. "Same
`Name("ShakeSound")`, same file. It grew." Then **scroll the app down** to the
Session 2 cards and stay there for the rest of the session.

**Theme to repeat:** *"Native senses; JS decides. Native will say 'a shake
happened, this hard.' JS decides what to play and what the bar does."*

---

## 5–15 min · Events — native → JS

### Beat 1 — Demo it (2 min)
Scrolled to the **Session 2 section**: **shake the phone.** The counter ticks, "last intensity"
updates, a sound fires (if bundled). "That number came *from native*. JS didn't
ask — native pushed it."
- Tap **Fake a shake**: "Same path, minus the hardware — handy when you're on a
  simulator or the demo gods are angry."

### Beat 2 — the native side (5 min)
**Open `ios/ShakeSoundModule.swift`, SESSION 2 — Events block.**
- `Events("onShake")` — "declares an event this module can emit. One line."
- `OnStartObserving { … }` / `OnStopObserving { … }` — "**this is the important
  pattern.** The accelerometer only runs while JS is actually listening. The
  moment the last JS listener detaches, we stop the sensor. You never leave a
  sensor draining the battery in the background — the framework tells you when
  anyone cares."
- Inside `startAccelerometer`: `sendEvent("onShake", ["intensity": magnitude])` —
  "that's the push to JS. A name and a payload dictionary. The key `intensity`
  has to match the type on the JS side."
- Point at the **cooldown** (`now - lastShake > cooldown`): "one physical shake
  is dozens of sensor samples over the threshold. The 500 ms guard collapses that
  into one event. Little bit of real-world debouncing."

**Contrast Android** — open `android/.../ShakeSoundModule.kt`, same block:
- "Same shape: `Events`, `OnStartObserving`/`OnStopObserving`, `sendEvent(...)`.
  `SensorManager` instead of CoreMotion; `registerListener`/`unregisterListener`
  are the start/stop."
- **The one real difference — call it out:** "iOS CoreMotion reports in **g**.
  Android reports in **m/s²**, so the Kotlin divides by `GRAVITY_EARTH` to
  normalise to g. Without that, the same `> 2.5` threshold would mean two
  different things and Android would feel broken. This is the single most common
  cross-platform sensor bug — the fix is one division, and it's easy to forget."

### Beat 3 — the JS side (3 min)
**Open the Session 2 section of `example/App.tsx`.**
- `ShakeSound.addListener('onShake', ({ intensity }) => …)` in a `useEffect`, with
  `sub.remove()` on cleanup. "Mounting this listener is what triggered
  `OnStartObserving` on the native side; the cleanup triggers `OnStopObserving`.
  The JS lifecycle drives the native sensor lifecycle."
- The `onShake` handler: bump the counter, set intensity, **pick a random clip and
  play it.** "Native reported *how hard*. JS decided *what to play* — random here,
  but it could escalate, or ignore small shakes. Behaviour lives in JS; the native
  code never changes."

---

## 15–25 min · Native views — Swift/Kotlin UI in the React tree

Walk this one slowly — it's the least familiar idea for a JS audience.

### Beat 1 — Demo it (1 min)
Point at the bar reacting on screen. "That green/orange/red bar is **not** a React
Native `<View>`. It's a Swift `UIView` (Kotlin `View` on Android) drawing itself,
handed to us as a React component."

### Beat 2 — registering the view (3 min)
**Back in the module file, SESSION 2 — Native view block:**
- `View(ShakeMeterView.self) { Prop("level") { … }; Prop("barColor") { … } }` —
  "inside the *same* module we register a view and its props. `Prop` wires a JS
  prop to a setter on the native view. `level` moves the bar; `barColor` colours
  it."

### Beat 3 — the view class (4 min)
**Open `ios/ShakeMeterView.swift`.**
- "It's an `ExpoView` (a `UIView`). `level` and `barColor` are just properties;
  setting them calls `setNeedsLayout` / repaints. `layoutSubviews` sizes the fill
  from `level`. Plain UIKit — the Expo part is only `ExpoView` + the `Prop`
  wiring."

**Open `android/.../ShakeMeterView.kt`** (quick contrast):
- "Same idea in Kotlin — draws in `onDraw`. **One gotcha worth showing:**
  `setWillNotDraw(false)` in `init`. `ExpoView` is a `ViewGroup`, and ViewGroups
  skip `onDraw` by default — without that line the bar is invisible and you'd
  swear your code is right. The kind of platform detail you inherit when you drop
  into native."

**Open `src/ShakeMeterView.tsx`:**
- `requireNativeView('ShakeSound')` → export `ShakeMeter`. "One line to pull the
  native view into JS. That string matches `Name(...)` again — same contract."
- In `App.tsx`: `<ShakeMeter level={level} barColor={colorFor(level)} />`. "From
  JS it's just a component. The `level` and `barColor` props flow straight to the
  native setters."

### Beat 4 — a real-world war story (2 min) — *optional but great*
"When we first wired `barColor`, iOS was happy and **Android crashed**: *'barColor
cannot be cast from String to double.'* On iOS, Expo's `UIColor` type parses a
CSS string like `'#ff3b30'` for free. On Android, the color arrives as an `Int`
and won't accept a string — so we parse it with `Color.parseColor` on the native
side. That asymmetry — the *same* prop needing different handling per platform — is
exactly the tax of the native boundary, and exactly what you're now equipped to
spot." (Point at the `barColor` `Prop` in the Kotlin file.)

---

## 25–30 min · Shipping & closing — real-world patterns

**Say:**
- **Local vs publishing:** "This is a local module — it lives in the repo and the
  app pulls it in. When a module is genuinely reusable across apps, you graduate
  it to a published npm package. Same code, different distribution."
- **Native views need a rebuild:** "One workflow note we hit live: JS changes
  hot-reload, but touching Swift/Kotlin — a new `Prop`, a view tweak — needs a
  native rebuild (`expo run:ios|android`). Budget for that in your loop."
- **Config plugins (one line, don't dwell):** "When you need to change *native
  config* — a permission, an Info.plist key — without ejecting, that's a config
  plugin. Different tool, same 'stay in managed workflow' spirit."
- **Lifecycle hooks (mention only):** "Modules can also hook app lifecycle events
  (foreground/background, etc.). Exists; look it up when you need it."
- **Close on the theme:** "Across both sessions, the module only ever *sensed* and
  *drew*. Every decision — which sound, what the bar does, what a shake means —
  stayed in JavaScript. That line is the whole mental model: reach into native for
  capabilities you can't get in JS, keep your logic in JS."
- Q&A / buffer.

---

## Anticipated questions

- **"Why events instead of polling from JS?"** Native owns the sensor stream;
  pushing an event when something happens is cheaper and lower-latency than JS
  asking 'anything yet?' 60×/second.
- **"What if two screens listen to onShake?"** `OnStartObserving` fires on the
  *first* listener, `OnStopObserving` on the *last* removal. The sensor runs once,
  events fan out to all listeners.
- **"Can the native view have its own events (taps, etc.)?"** Yes — views can emit
  events back to JS too (a `ViewEvent`/dispatcher). We didn't need it here.
- **"Why did Android need `setWillNotDraw(false)` but iOS didn't?"** Platform
  default: Android ViewGroups skip `onDraw`; iOS `UIView` doesn't. Native quirks
  don't cancel out across platforms.
- **"Do JS prop changes rebuild the app?"** No — prop changes are runtime. Only
  changing the native *code* (new props, view logic) needs a native rebuild.

---

## One-glance cheat sheet

| Concept | Says | File |
|---|---|---|
| `Events("onShake")` | declares a native→JS event | `*/ShakeSoundModule.{swift,kt}` |
| `OnStartObserving`/`OnStopObserving` | sensor runs only while JS listens | same, SESSION 2 |
| `sendEvent("onShake", …)` | native pushes payload up | same |
| g-normalization | Android `/ GRAVITY_EARTH` to match iOS | Kotlin module |
| `View(...)` + `Prop(...)` | register native view + props | same |
| `ExpoView` subclass | the actual native UI | `*/ShakeMeterView.{swift,kt}` |
| `setWillNotDraw(false)` | Android ViewGroup must opt into `onDraw` | `ShakeMeterView.kt` |
| `barColor` String vs Int | iOS parses color strings, Android needs a parse | Kotlin `Prop("barColor")` |
| `requireNativeView('ShakeSound')` | pull native view into JS | `src/ShakeMeterView.tsx` |
| listener drives sensor | `addListener` mounts → sensor starts | `example/App.tsx` (Session 2 section) |
