# iOS sound clips

Drop your meme `.mp3` files here, named to match `MEME_SOUNDS` in
`src/ShakeSound.types.ts` — e.g. `airhorn.mp3`, `bruh.mp3`.

The podspec (`ios/ShakeSound.podspec`, `s.resources = "Resources/*.mp3"`) copies
them into the app bundle, so `Bundle.main.url(forResource:withExtension:)` finds
them by name. Re-run `pod install` (or `npx expo run:ios`) after adding files.

Use your own or royalty-free clips only.
