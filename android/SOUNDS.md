# Android sound clips

Drop your meme `.mp3` files into **`src/main/res/raw/`**, named to match
`MEME_SOUNDS` in `../src/ShakeSound.types.ts`.

Android resource filenames must be **lowercase `a–z`, `0–9`, or `_` only** — no
capitals, spaces, or dashes. So `airhorn.mp3`, `sad_trombone.mp3` are fine;
`Air-Horn.mp3` is not. (This is also why this note lives here and not inside
`res/raw/` — the resource packer rejects any non-conforming filename in that
folder, including a `README.md`.)

`ShakeSoundModule.kt` resolves them at runtime with
`resources.getIdentifier(name, "raw", packageName)`.

Use your own or royalty-free clips only.
