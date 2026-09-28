import ExpoModulesCore
import CoreMotion
import AVFoundation

public class ShakeSoundModule: Module {
  // The audio player is held in a field on purpose. A local would be
  // deallocated the instant playSound returns, cutting the clip off. (Invariant.)
  private var player: AVAudioPlayer?

  // Session 2 — shake detection state.
  private let motion = CMMotionManager()
  private var lastShake: TimeInterval = 0

  // The only tuning knobs. Don't restructure detection around them.
  private let shakeThreshold = 2.5          // in g
  private let cooldown: TimeInterval = 0.5  // 500 ms between shakes

  public func definition() -> ModuleDefinition {
    Name("ShakeSound")

    // ─────────────────── SESSION 1 — Functions & AsyncFunctions ───────────────────

    // JS → native, synchronous. Fire-and-forget: play a bundled clip by name.
    Function("playSound") { (name: String) in
      guard let url = Self.soundURL(for: name) else { return }
      try? AVAudioSession.sharedInstance().setCategory(.playback)
      self.player = try? AVAudioPlayer(contentsOf: url)
      self.player?.play()
    }

    // JS → native, returns a Promise. Native reports which of the requested
    // names are actually bundled here; JS owns the choice of what to play.
    AsyncFunction("filterAvailable") { (names: [String]) -> [String] in
      names.filter { Self.soundURL(for: $0) != nil }
    }

    // ─────────────────── SESSION 2 — Events (native → JS) ───────────────────

    Events("onShake")

    // Sensor lifecycle: the accelerometer runs only while JS has a listener.
    OnStartObserving {
      self.startAccelerometer()
    }
    OnStopObserving {
      self.motion.stopAccelerometerUpdates()
    }

    // ─────────────────── SESSION 2 — Native view ───────────────────

    View(ShakeMeterView.self) {
      Prop("level") { (view: ShakeMeterView, level: Double) in
        view.level = CGFloat(level)
      }
      Prop("barColor") { (view: ShakeMeterView, color: UIColor) in
        view.barColor = color
      }
    }
  }

  // MARK: - Shake detection (Session 2)

  private func startAccelerometer() {
    guard motion.isAccelerometerAvailable else { return }
    motion.accelerometerUpdateInterval = 1.0 / 60.0
    motion.startAccelerometerUpdates(to: .main) { [weak self] data, _ in
      guard let self, let a = data?.acceleration else { return }
      // CoreMotion already reports in g (≈1g at rest, including gravity).
      let magnitude = sqrt(a.x * a.x + a.y * a.y + a.z * a.z)
      let now = Date().timeIntervalSince1970
      if magnitude > self.shakeThreshold && now - self.lastShake > self.cooldown {
        self.lastShake = now
        // Native only senses. It reports how hard; JS decides what to play.
        self.sendEvent("onShake", ["intensity": magnitude])
      }
    }
  }

  // MARK: - Sound lookup

  // Clips are copied into the app bundle by ShakeSound.podspec (s.resources),
  // so a plain main-bundle lookup finds them.
  private static func soundURL(for name: String) -> URL? {
    Bundle.main.url(forResource: name, withExtension: "mp3")
  }
}
